const express = require("express");
const cors = require("cors");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("./credentials.json"); // Make sure this file is in the same folder

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Enable CORS for your Odoo frontend
app.use(cors({
  origin: 'https://code-icons-technology3.odoo.com',
  methods: ['GET', 'POST'],
  credentials: true
}));

// ✅ Google Sheet ID (from your sheet URL)
const SHEET_ID = 'https://docs.google.com/spreadsheets/d/1_FLuLWAeEPTBFV31AUMlit_zH96aUIDEID_9O6cX1wo/edit?gid=0#gid=0'; // replace with actual sheet ID

// ✅ API route to fetch wallet by phone number
app.get("/api/wallet/:phone", async (req, res) => {
  const { phone } = req.params;

  try {
    const doc = new GoogleSpreadsheet(SHEET_ID);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0]; // use first sheet
    const rows = await sheet.getRows();

    const beautician = rows.find(row => row.Phone === phone);

    if (beautician) {
      res.json({
        phone: beautician.Phone,
        name: beautician.Name,
        points: beautician.Points
      });
    } else {
      res.status(404).json({ message: "Beautician not found" });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
