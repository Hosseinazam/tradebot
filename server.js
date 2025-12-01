// server.js - very simple webhook receiver (Node.js + Express)
const express = require('express');
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
