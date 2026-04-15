const { verifyToken } = require("./jwt");

module.exports = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header)
    return res.status(401).json({ message: "Authorization header missing" });

  const token = header.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  const user = verifyToken(token);

  if (!user)
    return res.status(401).json({ message: "Invalid or expired token" });

  req.user = user;
  next();
};
