import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import express from 'express';
import cors from 'cors';

// Initialize Firebase Admin

// Initialize Razorpay with live keys from environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || functions.config().razorpay.key_id,
  key_secret: process.env.RAZORPAY_KEY_SECRET || functions.config().razorpay.key_secret,
});

// Create Express app for webhook handling
const app = express();
app.use(cors({ origin: true }) as express.RequestHandler);
app.use(express.json() as express.RequestHandler);

// Webhook endpoint
const handleWebhook = async (req: express.Request, res: express.Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret';

  if (!signature) {
    console.error('No signature found in headers');
    return res.status(400).json({ error: 'No signature found in headers' });
  }

  const body = (req as any).rawBody || JSON.stringify(req.body);
  
  try {
    const generatedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (generatedSignature !== signature) {
      console.error('Invalid signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const payment = req.body.payload?.payment?.entity;
    const order = req.body.payload?.order?.entity;

    if (event === 'payment.captured' && payment) {
      // Handle successful payment
      await admin.firestore().collection('payments').doc(payment.id).set({
        paymentId: payment.id,
        orderId: order?.id || '',
        amount: payment.amount / 100, // Convert paise to INR
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email || '',
        contact: payment.contact || '',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Error processing webhook' });
  }
};

app.post('/webhook', handleWebhook as express.RequestHandler);

// Create Razorpay order
export const createOrder = functions.https.onCall(async (data, context) => {
  const { amount, currency = 'INR', receipt } = data;

  if (!amount) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Amount is required to create an order'
    );
  }

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt: receipt || `order_${Date.now()}`,
      payment_capture: 1,
    } as any);
    return { order };
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create order',
      error.message
    );
  }
});

// Get Razorpay Key ID
export const getRazorpayKey = functions.https.onCall(async (data, context) => {
  const keyId = process.env.RAZORPAY_KEY_ID || functions.config().razorpay.key_id;
  if (!keyId) {
    throw new functions.https.HttpsError('not-found', 'Razorpay Key ID not found');
  }
  return { keyId };
});

// Export the Express app as a Firebase Function
export const razorpayWebhook = functions.https.onRequest(app);
