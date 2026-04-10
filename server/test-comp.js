const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Invoice = require('./models/Invoice');
const User = require('./models/User');

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const user = await User.findOne({ role: 'seller' });
        if (!user) return console.log("No seller found.");
        console.log("Seller:", user.id, typeof user.id, user._id);
        
        const inv = await Invoice.findOne({ sellerId: user._id });
        if (!inv) return console.log("No invoices found for seller.");
        console.log("Invoice sellerId:", inv.sellerId, inv.sellerId.toString(), typeof inv.sellerId.toString());
        
        console.log("Comparison:", inv.sellerId.toString() === user.id);
        
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}
test();
