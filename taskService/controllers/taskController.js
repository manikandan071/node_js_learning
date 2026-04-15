const taskService = require("../services/taskService");
const db = require("../../shared/db");
const generateToken = require("../../shared/jwt");

exports.getAccessToken = async (req, res) => {
  const { email } = req.body;
  const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  const employee = rows[0];
  const token = generateToken.generateToken(employee);
  res.json({ status: "200", message: "Token generated.", token });
};
exports.getAllTasks = async (req, res) => {
  const response = await taskService.getAllTasks(req.user);
  res.json(response);
};

exports.createTask = async (req, res) => {
  const response = await taskService.createTask(req.body, req.user.id);
  res.json(response);
};

exports.updateTask = async (req, res) => {
  const response = await taskService.updateTask(req.params.id, req.body);
  res.json(response);
};
