const { GoogleSpreadsheet } = require('google-spreadsheet');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const doc = new GoogleSpreadsheet(process.env.SHEET_ID);

app.get('/api/wallet/:phone', async (req, res) => {
  try {
    await doc.useServiceAccountAuth({
      client_email: process.env.CLIENT_EMAIL,
      private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const userRow = rows.find(row => row.Phone?.trim() === req.params.phone.trim());

    if (userRow) {
      res.json({ name: userRow.Name || "User", points: userRow.Points || 0 });
    } else {
      res.status(404).json({ message: "No wallet data found for this phone number." });
    }
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
