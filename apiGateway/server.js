const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use(cors());
app.use(express.json());

/* 🔹 Route to Services */

// USER SERVICE
app.use(
  "/api/users",
  createProxyMiddleware({
    target: "http://localhost:5001",
    changeOrigin: true,
  }),
);

// AUTH SERVICE
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://localhost:5002",
    changeOrigin: true,
  }),
);

// TASK SERVICE
app.use(
  "/api/tasks",
  createProxyMiddleware({
    target: "http://localhost:5003",
    changeOrigin: true,
  }),
);

app.listen(5000, () => {
  console.log("API Gateway running on http://localhost:5000");
});
