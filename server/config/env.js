const requiredAlways = ['MONGO_URI'];
const requiredInProduction = [
  'SESSION_SECRET',
  'CLIENT_URL',
  'RPC_URL',
  'PRIVATE_KEY',
  'CONTRACT_ADDRESS',
];

function validateEnv() {
  const missing = [];

  requiredAlways.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (process.env.NODE_ENV === 'production') {
    requiredInProduction.forEach((key) => {
      if (!process.env[key]) {
        missing.push(key);
      }
    });
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = {
  validateEnv,
};
