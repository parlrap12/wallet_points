const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize the Google Spreadsheet API
const doc = new GoogleSpreadsheet(process.env.SHEET_ID);

// Middleware to parse JSON requests
app.use(express.json());

// Authenticate with Google Sheets
async function authenticate() {
  try {
    await doc.useServiceAccountAuth({
      client_email: process.env.CLIENT_EMAIL,
      private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  } catch (err) {
    throw new Error('Authentication failed: ' + err.message);
  }
}

// Route to fetch wallet data for a specific phone number
app.get('/api/wallet/:phone', async (req, res) => {
  try {
    const phone = req.params.phone;

    // Ensure phone number is provided
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required." });
    }

    // Authenticate with Google Sheets
    await authenticate();

    // Load sheet data
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0]; // Get the first sheet
    const rows = await sheet.getRows(); // Fetch all rows in the sheet

    // Log the data for debugging
    console.log('Requested Phone:', phone);
    console.log('Rows in Google Sheet:', rows.map(row => row.Phone));

    // Find the row based on the phone number, trimming any spaces
    const userRow = rows.find(row => row.Phone.trim() === phone.trim());

    if (userRow) {
      // Respond with the user's name and points
      return res.json({
        name: userRow.Name,
        points: userRow.Points,
      });
    } else {
      // Return an error message if no matching phone number is found
      return res.status(404).json({ message: "No wallet data found for this phone number." });
    }
  } catch (err) {
    console.error('Error occurred:', err);
    res.status(500).json({
      message: "Server error occurred.",
      error: err.message,
    });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
