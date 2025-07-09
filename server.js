const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static frontend (if needed)
app.use(express.static(path.join(__dirname, "public")));

// Form submission endpoint
app.post("/submit", async (req, res) => {
  const { employeeId, asset, username, currentPassword, newPassword } =
    req.body;

  console.log("📥 Form submitted. Sending to UiPath Queue...");

  try {
    // 1. Get OAuth Token
    const tokenResponse = await axios.post(
      "https://cloud.uipath.com/identity_/connect/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: "aa38df26-cc6c-4e12-b2f8-4eed9c7574f0",
        client_secret: "vlF_BIfY0VCCBDzM",
        scope: "OR.Queues.Write OR.Folders.Read",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // 2. Push to UiPath Queue
    const queueResponse = await axios.post(
      "https://cloud.uipath.com/faizanorg/DefaultTenant/odata/Queues/UiPathODataSvc.AddQueueItem",
      {
        itemData: {
          Name: "User Credentials Update Queue",
          Priority: "Normal",
          SpecificContent: {
            employeeId,
            asset,
            username,
            currentPassword,
            newPassword,
            requestTimestamp: new Date().toISOString(),
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-UIPATH-OrganizationUnitId": "98475",
        },
      }
    );

    console.log("✅ Queue Item Added:", queueResponse.data);

    res.send(`
      <h2>✅ Credentials submitted and added to UiPath Queue successfully!</h2>
      <a href="/">Go back to form</a>
    `);
  } catch (error) {
    console.error(
      "❌ Error while submitting:",
      error.response?.data || error.message
    );
    res.status(500).send(`
      <h2>❌ Failed to submit credentials to UiPath Queue</h2>
      <pre>${JSON.stringify(
        error.response?.data || error.message,
        null,
        2
      )}</pre>
      <a href="/">Try Again</a>
    `);
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
