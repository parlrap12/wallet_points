const express = require("express");
const cors = require("cors"); // ✅ Import cors
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Enable CORS for Odoo frontend
app.use(cors({
  origin: 'https://code-icons-technology3.odoo.com', // allow only this frontend
  methods: ['GET', 'POST'],
  credentials: true
}));

// Sample static wallet data
const walletData = [
  {
    phone: "9322535019",
    name: "Aarti Sharma",
    points: 200
  },
  {
    phone: "9876543210",
    name: "Neha Singh",
    points: 150
  }
];

// API route to fetch wallet by phone number
app.get("/api/wallet/:phone", (req, res) => {
  const { phone } = req.params;
  const beautician = walletData.find(w => w.phone === phone);

  if (beautician) {
    res.json(beautician);
  } else {
    res.status(404).json({ message: "Beautician not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
