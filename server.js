const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

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

const SECRET = process.env.WEBHOOK_SECRET || 'secret-1234567890';

// endpoint TradingView -> POST JSON
app.post('/webhook', async (req, res) => {
  const auth = req.headers['x-webhook-token'] || req.headers['authorization'] || '';
  if(auth !== SECRET) {
    return res.status(403).json({error: 'forbidden'});
  }

  const payload = req.body;
  console.log('got signal', payload);

  try {
      await signalsCollection.insertOne({
          time: new Date(),
          data: payload
      });
      console.log("saved to MongoDB");
  } catch (err) {
      console.error("MongoDB save error:", err);
  }

  return res.json({status:'ok'});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('listening', PORT));
