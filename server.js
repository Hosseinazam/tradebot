// server.js - very simple webhook receiver (Node.js + Express)
const express = require('express');const { MongoClient, ServerApiVersion } = require('mongodb');

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
        const db = client.db("tradebot");
        signalsCollection = db.collection("signals");
        console.log("MongoDB connected ✅");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}

connectDB();

const fs = require('fs');
const app = express();
app.use(express.json());

const SECRET = process.env.WEBHOOK_SECRET || 'change-me-very-secret';

// endpoint TradingView -> POST JSON
app.post('/webhook', (req, res) => {
  const auth = req.headers['x-webhook-token'] || req.headers['authorization'] || '';
  if(auth !== SECRET) {
    return res.status(403).json({error: 'forbidden'});
  }
  const payload = req.body;
  console.log('got signal', payload);

  // append to local file (quick, free)
  fs.appendFileSync('signals.json', JSON.stringify({t: new Date().toISOString(), p: payload}) + '\n');

  return res.json({status:'ok'});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('listening', PORT));
