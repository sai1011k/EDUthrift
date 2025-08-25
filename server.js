// server.js - FINAL CORRECTED VERSION
const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const path = require('path'); // Required to find the public folder

const app = express();
app.use(express.json());
app.use(cors());

// This is the new line that serves your website from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// --- PASTE YOUR RAZORPAY KEYS HERE ---
const RAZORPAY_KEY_ID = 'PASTE_YOUR_KEY_ID_HERE';
const RAZORPAY_KEY_SECRET = 'PASTE_YOUR_KEY_SECRET_HERE';

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

app.post('/create-order', async (req, res) => {
    const { amount, currency } = req.body;
    const options = { amount, currency, receipt: `receipt_${Date.now()}` };
    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).send("Error creating order");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));