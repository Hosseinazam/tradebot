// ==========================================
// server.js - TradeBot + MongoDB
// ==========================================

const express = require("express");
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();  // برای خواندن متغیر محیطی WEBHOOK_SECRET

const app = express();
app.use(express.json());

// ----------------------
// 1️⃣ اتصال به MongoDB
// ----------------------
const uri = "mongodb+srv://tradebotuser:secret123@cluster0.pz0qrex.mongodb.net/tradebot?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let signalsCollection;

async function connectDB() {
    try {
        await client.connect();
        const db = client.db("tradebot"); // نام دیتابیس
        signalsCollection = db.collection("signals"); // Collection سیگنال‌ها
        console.log("MongoDB connected ✅");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}

connectDB();

// ----------------------
// 2️⃣ وب‌هوک برای دریافت سیگنال
// ----------------------
app.post("/webhook", async (req, res) => {
    // بررسی توکن امنیتی
    const token = req.headers['x-webhook-token'];
    if(token !== process.env.WEBHOOK_SECRET)
        return res.status(403).json({ error: "forbidden" });

    const signal = req.body;

    try {
        // ذخیره سیگنال در MongoDB
        await signalsCollection.insertOne({
            ...signal,
            timestamp: new Date()
        });

        console.log("Signal saved:", signal);
        res.json({ status: "ok" });
    } catch (err) {
        console.error("Error saving signal:", err);
        res.status(500).json({ error: "internal server error" });
    }
});

// ----------------------
// 3️⃣ صفحه تست ساده
// ----------------------
app.get("/", (req, res) => {
    res.send("TradeBot Server is running ✅");
});

// ----------------------
// 4️⃣ اجرای سرور
// ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} ✅`);
});
{
  "name": "tradebot",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongodb": "^4.1",
    "dotenv": "^16.0.3"
  }
}
