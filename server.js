// server.js - UPGRADED VERSION

const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const path = require('path'); // ADD THIS LINE

const app = express();
app.use(express.json());
app.use(cors());

// --- THIS IS THE NEW AND IMPORTANT PART ---
// This tells Express to serve your storefront files (from the 'public' folder)
app.use(express.static(path.join(__dirname, 'public')));
// -----------------------------------------

// --- PASTE YOUR RAZORPAY KEYS HERE ---
const RAZORPAY_KEY_ID = 'PASTE_YOUR_KEY_ID_HERE';
const RAZORPAY_KEY_SECRET = 'PASTE_YOUR_KEY_SECRET_HERE';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

// The endpoint for creating a payment order (no changes here)
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

const PORT = process.env.PORT || 3000; // Use Render's port or 3000 for local
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));