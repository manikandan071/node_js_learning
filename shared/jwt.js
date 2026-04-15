const jwt = require("jsonwebtoken");

const SECRET = "mysecretkey";

exports.generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, SECRET, {
    expiresIn: "1h",
  });
};

exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
};
