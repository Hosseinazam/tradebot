// ==========================================
// server.js - TradeBot ready for Render
// ==========================================

const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(express.json());

// ----------------------
// MongoDB Connect
// ----------------------
const uri = process.env.MONGODB_URI;

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
    const db = client.db("tradebot");
    signalsCollection = db.collection("signals");
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("MongoDB error:", err);
  }
}

connectDB();

// ----------------------
// Secure Webhook
// ----------------------
const SECRET = process.env.WEBHOOK_SECRET;

app.post("/webhook", async (req, res) => {
  const token = req.headers["x-webhook-token"];
  if (token !== SECRET) {
    return res.status(403).json({ error: "forbidden" });
  }

  const signal = req.body;

  try {
    await signalsCollection.insertOne({
      ...signal,
      timestamp: new Date()
    });

    console.log("Saved:", signal);

    res.json({ status: "ok" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "db error" });
  }
});

// ----------------------
// Home test
// ----------------------
app.get("/", (req, res) => {
  res.send("TradeBot Server Running ✔️");
});

// ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
