const paypal = require('@paypal/checkout-server-sdk');

function paypalClient() {
  const environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
  return new paypal.core.PayPalHttpClient(environment);
}

module.exports = {
  paypalClient,
  paypal
};
