const { createProxyMiddleware } = require("http-proxy-middleware");
const express = require("express");
const app = express();
const PORT = 5002;
const taskController = require("./controllers/taskController");
const auth = require("../shared/authMiddleware");
app.use(
  "/api/tasks",
  createProxyMiddleware({
    target: "http://localhost:5002",
    changeOrigin: true,
  }),
);
app.use(express.json());

app.get("/getAccessToken", taskController.getAccessToken);
app.get("/allTasks", auth, taskController.getAllTasks);
app.post("/task", auth, taskController.createTask);
app.put("/task/:id", auth, taskController.updateTask);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
