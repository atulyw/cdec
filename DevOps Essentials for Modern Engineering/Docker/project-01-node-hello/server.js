// Tiny web server — one page that says hello

const express = require("express");

const app = express();
// Use 3000 inside the container; Docker can map it to another port on your computer
const PORT = process.env.PORT || 3000;

// When someone opens the site, send back plain text
app.get("/", (req, res) => {
  res.type("text/plain").send("Hello World");
});

// 0.0.0.0 = listen for traffic from outside the container (not only from inside)
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
