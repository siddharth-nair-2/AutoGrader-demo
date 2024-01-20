require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connection = require("./config/db");
const Axios = require("axios");
const userRoutes = require("./routes/users");
const trackerRoutes = require("./routes/trackers");
const path = require("path");

// database connection
connection();

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use("/api/user", userRoutes);
app.use("/api/tracker", trackerRoutes);

//serving the frontend
app.use(express.static(path.join(__dirname, "./client/build")));

app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"), (err) => {
    res.status(500).send(err);
  });
});

const port = process.env.PORT || 5000;
app.listen(port, console.log(`Server started on port ${port}...`));
