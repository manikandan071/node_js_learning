const userService = require("../services/userService");
const otpStore = {};

exports.userLogin = async (req, res) => {
  const { email } = req.body;
  const otp = await userService.userLogin(req.body);
  otpStore[email] = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };
  res.json({ status: "200", message: "OTP generated", otp });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const record = otpStore[email];

  if (!record) return res.status(400).json({ message: "OTP not requested" });

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP expired" });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  delete otpStore[email];

  const token = await userService.getAccessToken(email);

  res.json({
    status: "200",
    message: "Login successful",
    token,
  });
};

exports.registerUser = async (req, res) => {
  const response = await userService.createUser(req.body);
  res.json(response);
};

exports.getUser = async (req, res) => {
  const response = await userService.getUser(req.params.id);
  res.json(response);
};

exports.getAllUsers = async (req, res) => {
  const response = await userService.getAllUsers();
  res.json(response);
};

exports.updateUser = async (req, res) => {
  const response = await userService.updateUser(req.params.id, req.body);
  res.json(response);
};

exports.deleteUser = async (req, res) => {
  const response = await userService.deleteUser(req.params.id);
  res.json(response);
};
