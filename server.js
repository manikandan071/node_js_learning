const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const fs = require("fs");
const XLSX = require("xlsx");

const app = express();
const PORT = 5000;
const FILE_PATH = "./employees.xlsx";

app.use(cors());
app.use(express.json());

/* ------------------ Helper Functions ------------------ */

// Create Excel file if not exists
const initializeFile = () => {
  if (!fs.existsSync(FILE_PATH)) {
    const ws = XLSX.utils.json_to_sheet([]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, FILE_PATH);
  }
};

// Read data
const readData = () => {
  const wb = XLSX.readFile(FILE_PATH);
  const ws = wb.Sheets["Employees"];
  return XLSX.utils.sheet_to_json(ws);
};

// Write data
const writeData = (data) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employees");
  XLSX.writeFile(wb, FILE_PATH);
};

initializeFile();

/* ------------------ variables ------------------ */

const SECRET_KEY = "mysecretkey";
const otpStore = {};
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/* ------------------ JWT Token ------------------ */

const generateToken = (employee) => {
  return jwt.sign(
    {
      email: employee.email,
      id: employee.id,
    },
    SECRET_KEY,
    { expiresIn: "1h" }, // token expiry
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
};

/* ------------------ Authentication Middleware ------------------ */

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  // Format: Bearer TOKEN
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  const employee = verifyToken(token);

  if (!employee) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  req.employee = employee;
  next();
};

/* ------------------ APIs ------------------ */

/**
 * 🔹 POST - Employee Login (with email)
 * /login
 */

app.post("/login", (req, res) => {
  const { email } = req.body;
  const data = readData();

  const employee = data.find((e) => e.email === email);

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const otp = generateOTP();

  otpStore[email] = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  };

  res.json({
    message: "OTP generated",
    otp,
  });
});

/**
 * 🔹 POST - Verify OTP (with email)
 * /verify-otp
 */

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  const record = otpStore[email];

  console.log("OTP Store:", otpStore, "Email:", email, "OTP:", otp);

  if (!record) {
    return res.status(400).json({ message: "OTP not requested" });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP expired" });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  delete otpStore[email];

  const data = readData();
  const employee = data.find((e) => e.email === email);

  const token = generateToken(employee);

  res.json({
    message: "Login successful",
    valid: true,
    token,
  });
});

/**
 * 🔹 GET - Fetch Employees (with sorting)
 * /employees?sort=asc OR desc
 */
app.get("/employees", authMiddleware, (req, res) => {
  let data = readData();
  const sort = req.query.sort;
  console.log("Sort:", sort);

  if (sort === "asc") {
    data.sort((a, b) => a.id - b.id);
  } else if (sort === "desc") {
    data.sort((a, b) => b.id - a.id);
  }

  res.json(data);
});

/**
 * 🔹 GET - Fetch Single Employee
 */
app.get("/employees/:id", authMiddleware, (req, res) => {
  const data = readData();
  const emp = data.find((e) => e.id == req.params.id);

  if (!emp) return res.status(404).json({ message: "Employee not found" });

  res.json(emp);
});

/**
 * 🔹 POST - Add Employee
 */
app.post("/employees", (req, res) => {
  const data = readData();

  const newEmp = {
    id: Date.now(), // simple unique id
    name: req.body.name,
    email: req.body.email,
    department: req.body.department,
    salary: req.body.salary,
  };

  data.push(newEmp);
  writeData(data);

  res.json({ message: "Employee added", data: newEmp });
});

/**
 * 🔹 PUT - Update Employee
 */
app.put("/employees/:id", (req, res) => {
  let data = readData();
  const index = data.findIndex((e) => e.id == req.params.id);

  if (index === -1)
    return res.status(404).json({ message: "Employee not found" });

  data[index] = {
    ...data[index],
    ...req.body,
  };

  writeData(data);

  res.json({ message: "Employee updated", data: data[index] });
});

/**
 * 🔹 DELETE - Remove Employee
 */

app.delete("/employees/:id", (req, res) => {
  let data = readData();
  const newData = data.filter((e) => e.id != req.params.id);

  if (data.length === newData.length)
    return res.status(404).json({ message: "Employee not found" });

  writeData(newData);

  res.json({ message: "Employee deleted" });
});

/* ------------------ Start Server ------------------ */

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
