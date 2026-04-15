const { createProxyMiddleware } = require("http-proxy-middleware");
const express = require("express");
const app = express();
const PORT = 5001;
const userController = require("./controllers/userController");
const auth = require("../shared/authMiddleware");

app.use(
  "/api/users",
  createProxyMiddleware({
    target: "http://localhost:5001",
    changeOrigin: true,
  }),
);
app.use(express.json());

app.post("/login", userController.userLogin);
app.post("/verify-otp", userController.verifyOtp);
app.get("/users", auth, userController.getAllUsers);
app.get("/user/:id", auth, userController.getUser);
app.post("/user", auth, userController.registerUser);
app.put("/user/:id", auth, userController.updateUser);
app.delete("/user/:id", auth, userController.deleteUser);

/* ------------------ Start Server ------------------ */

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
