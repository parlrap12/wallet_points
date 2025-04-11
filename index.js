const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const walletData = {
  beautician_id: "12345",
  points: 200
};

app.get("/api/wallet/:id", (req, res) => {
  const { id } = req.params;
  // Example static response
  if (id === walletData.beautician_id) {
    res.json(walletData);
  } else {
    res.status(404).json({ message: "Beautician not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
