const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

let users = {};

// CREATE PAYMENT
app.post("/create-payment", async (req, res) => {
  const { userId, amount } = req.body;

  try {
    const response = await axios.post(
      "https://api.nowpayments.io/v1/payment",
      {
        price_amount: amount,
        price_currency: "usd",
        pay_currency: "btc",
        order_id: userId,
        order_description: "Premium Access"
      },
      {
        headers: {
          "x-api-key": process.env.NOWPAYMENTS_API_KEY
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// IPN WEBHOOK (AUTO UNLOCK)
app.post("/ipn", (req, res) => {
  const payment = req.body;

  if (payment.payment_status === "finished") {
    const userId = payment.order_id;
    users[userId] = { paid: true };
  }

  res.sendStatus(200);
});

// CHECK ACCESS
app.get("/access/:userId", (req, res) => {
  const user = users[req.params.userId];

  if (user?.paid) {
    return res.json({ access: true, content: "🔥 Unlocked" });
  }

  res.json({ access: false });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
