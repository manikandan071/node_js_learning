const db = require("../../shared/db");
const generateToken = require("../../shared/jwt");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.userLogin = async (data) => {
  const { email } = data;
  const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  if (rows.length === 0) {
    return res.status(404).json({ message: "Employee not found" });
  }
  const otp = generateOTP();
  return otp;
};

exports.getAccessToken = async (email) => {
  const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);

  const employee = rows[0];

  const token = generateToken.generateToken(employee);

  return token;
};

exports.createUser = async (data) => {
  const { name, email, phone, gender, age, address, city, country } = data;

  const [result] = await db.execute(
    `INSERT INTO users 
      (name, email, phone, gender, age, address, city, country) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, phone, gender, age, address, city, country],
  );

  return {
    status: "200",
    message: "User created",
    data: {
      id: result.insertId,
      name,
      email,
      phone,
      gender,
      age,
      address,
      city,
      country,
    },
  };
};

exports.getUser = async (userId) => {
  const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [userId]);

  if (rows.length === 0) {
    return { status: "404", message: "Employee not found" };
  }

  return { status: "200", message: "User details fetched", data: rows[0] };
};

exports.getAllUsers = async () => {
  const [rows] = await db.execute("SELECT * FROM users");
  return { status: "200", message: "All users fetched", data: rows };
};

exports.updateUser = async (id, data) => {
  console.log("Updating user with ID:", id, "Data:", data);

  const fields = [];
  const values = [];

  for (const key in data) {
    fields.push(`${key} = ?`);
    values.push(data[key]);
  }

  values.push(id);

  const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;

  const [result] = await db.execute(query, values);

  return {
    status: 200,
    message: "User updated",
    data: result,
  };
};

exports.deleteUser = async (id) => {
  const [result] = await db.execute(`DELETE FROM users WHERE id=?`, [id]);
  return { status: "200", message: "User deleted", data: result };
};
