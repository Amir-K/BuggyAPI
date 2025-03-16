const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// In-memory store (resets when server restarts)
let transactions = [];
let balance = 0;

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 10);

/**
 * POST /balance - Add a transaction (Deposit/Withdraw)
 */
app.post("/balance", (req, res) => {
  const { amount } = req.body;
  console.log(req);
  if (typeof amount !== "number") {
    return res.status(400).json({ error: "Invalid amount" });
  }

  // Create transaction
  const transaction = {
    id: generateId(),
    amount,
    timestamp: new Date().toISOString(),
  };

  transactions.push(transaction);

  // BUG: If a withdrawal makes the balance negative, the last deposit is ignored
  balance = transactions.reduce((acc, tx, index, arr) => {
    if (acc + tx.amount < 0 && arr[index - 1]?.amount > 0) {
      return acc; // ❌ Incorrectly ignores the last deposit if balance goes negative
    }
    return acc + tx.amount;
  }, 0);

  res.json({ message: "Transaction processed", balance, transactions });
});

/**
 * GET /balance - Get current balance & transaction history
 */
app.get("/balance", (req, res) => {
  res.json({ balance, transactions });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
