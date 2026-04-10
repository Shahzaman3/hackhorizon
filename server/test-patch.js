const baseURL = 'http://localhost:5000/api';
let sessionCookie = '';

async function request(method, path, data = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (sessionCookie) headers['Cookie'] = sessionCookie;

  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);

  const res = await fetch(`${baseURL}${path}`, options);
  
  const cookieHeader = res.headers.get('set-cookie');
  if (cookieHeader) sessionCookie = cookieHeader.split(';')[0];

  const json = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(`[${res.status}] ${JSON.stringify(json)}`);
  return json;
}

async function start() {
    try {
        const email = `test_${Date.now()}@test.com`;
        await request('POST', '/auth/register', {
            name: "Test Seller", email, password: "password", role: "seller", gstin: "22AAAAA0000A1Z5"
        });
        
        const invoiceRes = await request('POST', '/invoices', {
            invoiceNumber: "INV-" + Date.now(),
            buyerEmail: "buyer@test.com",
            buyerName: "Test Buyer",
            buyerGstin: "33BBBBB0000B1Z6",
            amount: 500,
            tax: { cgst: 0, sgst: 0, igst: 0 },
            date: new Date()
        });
        
        const invId = invoiceRes.data.id || invoiceRes.data._id;
        console.log(`Created invoice ${invId}`);
        
        console.log("Triggering Mark as Paid...");
        const updateRes = await request('PATCH', `/invoices/${invId}/payment`, { paymentStatus: 'paid' });
        console.log("Update OK", updateRes.success);
        
    } catch(err) {
        console.error("TEST FAILED:", err.message);
    }
}
start();
