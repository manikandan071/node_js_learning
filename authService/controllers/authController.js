const db = require("../../shared/db");
const { generateOTP } = require("../../shared/otp");
const { generateToken } = require("../../shared/jwt");

exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  const otp = generateOTP();

  await db.execute(
    "INSERT INTO login_otp (email, otp, expires_at) VALUES (?,?,?)",
    [email, otp, Date.now() + 5 * 60 * 1000],
  );

  res.json({ message: "OTP sent", otp });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const [rows] = await db.execute(
    "SELECT * FROM login_otp WHERE email=? ORDER BY id DESC LIMIT 1",
    [email],
  );

  if (!rows.length) return res.status(400).json({ message: "No OTP" });

  const record = rows[0];

  if (Date.now() > record.expires_at)
    return res.status(400).json({ message: "Expired OTP" });

  if (record.otp !== otp)
    return res.status(400).json({ message: "Invalid OTP" });

  const [users] = await db.execute("SELECT * FROM users WHERE email=?", [
    email,
  ]);

  const token = generateToken(users[0]);

  res.json({ message: "Login success", token });
};
