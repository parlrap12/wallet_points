const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize the Google Spreadsheet API
// The `SHEET_ID` should be the ID of your Google Sheet (which you get from the URL)
const doc = new GoogleSpreadsheet('1_FLuLWAeEPTBFV31AUMlit_zH96aUIDEID_9O6cX1wo'); // Replace with your actual Google Sheet ID

// Middleware to parse JSON requests
app.use(express.json());

// Authenticate with Google Sheets
async function authenticate() {
  try {
    await doc.useServiceAccountAuth({
      // These values come from your Google Cloud service account
      client_email: process.env.CLIENT_EMAIL, // Your service account email (found in the JSON key file)
      private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'), // Your private key from the JSON key file
    });
  } catch (err) {
    throw new Error('Authentication failed: ' + err.message); // This will show an error if authentication fails
  }
}

// Route to fetch wallet data for a specific phone number
// This is the endpoint that your frontend (website) will call
app.get('/api/wallet/:phone', async (req, res) => {
  try {
    const phone = req.params.phone; // Retrieve the phone number from the URL (e.g., /api/wallet/9322535019)

    // Ensure phone number is provided
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required." });
    }

    // Authenticate with Google Sheets to get access
    await authenticate();

    // Load the sheet data
    await doc.loadInfo();  // Load the spreadsheet data into memory
    const sheet = doc.sheetsByIndex[0]; // Get the first sheet (use index 0 for the first sheet)
    const rows = await sheet.getRows(); // Fetch all rows from the sheet

    // Log the data for debugging purposes (you can see this in the console)
    console.log('Requested Phone:', phone);
    console.log('Rows in Google Sheet:', rows.map(row => row.Phone));

    // Find the row based on the phone number, trimming any spaces to avoid mismatches
    const userRow = rows.find(row => row.Phone.trim() === phone.trim()); // Match the phone number entered

    if (userRow) {
      // If the row is found, send the user's name and points
      return res.json({
        name: userRow.Name, // Name from the Google Sheet (Column 'Name')
        points: userRow.Points, // Points from the Google Sheet (Column 'Points')
      });
    } else {
      // If no matching phone number is found in the sheet, return a 404 error
      return res.status(404).json({ message: "No wallet data found for this phone number." });
    }
  } catch (err) {
    console.error('Error occurred:', err);
    // Return a server error if anything goes wrong during processing
    res.status(500).json({
      message: "Server error occurred.",
      error: err.message,
    });
  }
});

// Start the Express server
// The server will listen on the port you specify or 3000 by default
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
