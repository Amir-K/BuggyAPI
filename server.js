const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// In-memory store with user mapping
let userTransactions = {}; // { userId: [...transactions] }
let userBalances = {}; // { userId: balance }

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 10);

/**
 * POST /balance - Add a transaction (Deposit/Withdraw)
 */
app.post("/balance", (req, res) => {
  const { amount, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  if (typeof amount !== "number") {
    return res.status(400).json({ error: "Invalid amount" });
  }

  // Initialize user data if it doesn't exist
  if (!userTransactions[userId]) {
    userTransactions[userId] = [];
    userBalances[userId] = 0;
  }

  // Create transaction
  const transaction = {
    id: generateId(),
    amount,
    timestamp: new Date().toISOString(),
    userId,
  };

  // Send immediate response
  res.json({
    message: "Transaction request received",
  });

  // Process transaction asynchronously after 5 seconds
  setTimeout(() => {
    userTransactions[userId].push(transaction);

    // Calculate balance for this user
    userBalances[userId] = userTransactions[userId].reduce((acc, tx, index, arr) => {
      if (acc + tx.amount < 0 && arr[index - 1]?.amount > 0) {
        return acc;
      }
      return acc + tx.amount;
    }, 0);

    console.log(`Transaction ${transaction.id} processed for user ${userId}`);
  }, 5000);
});

/**
 * GET /balance - Get current balance & transaction history for a user
 */
app.get("/balance/:userId", (req, res) => {
  const { userId } = req.params;

  if (!userTransactions[userId]) {
    return res.json({ balance: 0, transactions: [] });
  }

  res.json({
    balance: userBalances[userId],
    transactions: userTransactions[userId],
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
