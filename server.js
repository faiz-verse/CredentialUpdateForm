const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (HTML, CSS)
app.use(express.static(path.join(__dirname, "public")));

// Handle form submission
app.post("/submit", (req, res) => {
  const { employeeId, asset, username, currentPassword, newPassword } =
    req.body;

  console.log("Form submitted with the following data:");
  console.log({
    employeeId,
    asset,
    username,
    currentPassword,
    newPassword,
  });

  // You can now call UiPath Queue API here (next step)
  res.send(`
  <h2>✅ Credentials submitted successfully!</h2>
  <a href="/">Go back</a>
`);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
