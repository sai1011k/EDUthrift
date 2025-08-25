// server.js - Our Secure Back Office

const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- PASTE YOUR RAZORPAY KEYS HERE ---
const RAZORPAY_KEY_ID = 'PASTE_YOUR_KEY_ID_HERE';
const RAZORPAY_KEY_SECRET = 'PASTE_YOUR_KEY_SECRET_HERE';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

// The endpoint our website will call to create a payment order
app.post('/create-order', async (req, res) => {
    const { amount, currency } = req.body;
    const options = {
        amount,
        currency,
        receipt: `receipt_order_${Date.now()}`,
    };
    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).send("Error creating order");
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Payment server running on http://localhost:${PORT}`));