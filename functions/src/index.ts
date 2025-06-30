import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import Razorpay from 'razorpay';
import express from 'express';
import cors from 'cors';
import * as crypto from 'crypto';
import { createOrder, razorpayWebhook } from './payments';

// Initialize Firebase Admin
admin.initializeApp();

// Get Razorpay config from Firebase Functions config
const razorpayConfig = functions.config().razorpay;

// Check if required config is set
if (!razorpayConfig?.key_id || !razorpayConfig?.key_secret) {
  console.error('Missing Razorpay configuration. Please set the config using:');
  console.error('firebase functions:config:set razorpay.key_id=your_key_id razorpay.key_secret=your_key_secret');
  process.exit(1);
}

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: razorpayConfig.key_id,
  key_secret: razorpayConfig.key_secret
});

// Create Express app
const app = express();

// Configure CORS to allow requests from your domain and local development
const allowedOrigins = [
  'https://mahalaxmifoods.in',
  'http://localhost:3000',
  'https://shree-mahalaxmi-foods-products.web.app',
  'https://us-central1-mahalaxmifoods-4b2d5.cloudfunctions.net',
  'https://us-central1-shree-mahalaxmi-foods-products.cloudfunctions.net'
];

// CORS middleware function
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list or is localhost or cloudfunctions
    if (allowedOrigins.includes(origin) || 
        origin.startsWith('http://localhost:') || 
        origin.includes('cloudfunctions.net')) {
      return callback(null, true);
    }
    
    console.log('CORS blocked for origin:', origin);
    return callback(new Error('Not allowed by CORS'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-razorpay-signature', 'x-request-id'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 600, // 10 minutes
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Apply CORS middleware with the specified options
app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight requests
app.options('*', cors(corsOptions));

// Add headers to all responses
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const origin = req.headers.origin || '';
  
  // Set CORS headers
  if (allowedOrigins.includes(origin) || 
      origin.startsWith('http://localhost:') || 
      origin.includes('cloudfunctions.net')) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-razorpay-signature');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Webhook endpoint for Razorpay
app.post('/razorpay-webhook', express.raw({ type: 'application/json' }), async (req: express.Request, res: express.Response) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret';
  const signature = req.headers['x-razorpay-signature'] as string;
  
  if (!signature) {
    return res.status(400).json({ error: 'No signature provided' });
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (generatedSignature !== signature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Handle the webhook event
  const event = req.body.event;
  const payment = req.body.payload?.payment?.entity;
  const order = req.body.payload?.order?.entity;

  if (event === 'payment.captured' && payment) {
    try {
      // Save payment details to Firestore
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
    } catch (error) {
      console.error('Error saving payment:', error);
      return res.status(500).json({ error: 'Error processing payment' });
    }
  }

  return res.status(200).json({ received: true });
});

// Create Razorpay order endpoint
app.post('/api/create-order', async (req: express.Request, res: express.Response) => {
  try {
    const { amount, currency = 'INR', receipt, notes = {} } = req.body;

    if (!amount) {
      return res.status(400).json({ 
        success: false,
        message: 'Amount is required' 
      });
    }

    console.log(`Creating order for amount: ${amount}, currency: ${currency}, receipt: ${receipt}`);
    
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `order_${Date.now()}`,
      payment_capture: true,
      notes
    } as any);

    console.log('Razorpay order created:', order);
    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Razorpay webhook handler
app.post('/razorpay-webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const signature = req.headers['x-razorpay-signature'] as string || '';

  if (!signature) {
    return res.status(400).send('No signature found in headers');
  }

  const body = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('Webhook signature verification failed');
    return res.status(400).send('Invalid signature');
  }

  const payload = req.body;
  console.log('Webhook payload:', payload);

  // TODO: Add your business logic here to handle different event types

  res.status(200).send('Webhook received and verified');
});

// Export the Express app as a Firebase function
export const api = functions.https.onRequest(app);
// Firestore rules should be updated in firestore.rules file
