import express from "express";
import bcrypt from "bcrypt";
import { query } from "../db.js";

const router = express.Router();

const REQUIRED_FIELDS = ["username", "password", "firstName", "lastName", "email"];
const SALT_ROUNDS = 10;

function validateRegistration(payload) {
  const missing = REQUIRED_FIELDS.filter((field) => !payload[field]);
  if (missing.length) {
    return `Missing required fields: ${missing.join(", ")}`;
  }

  if (payload.password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  return null;
}

router.post("/register", async (req, res) => {
  const validationError = validateRegistration(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const {
    username,
    password,
    firstName,
    lastName,
    email,
    phone,
    department,
    jobTitle,
    address1,
    address2,
    city,
    state,
    postalCode
  } = req.body;

  try {
    const existing = await query(
      "SELECT 1 FROM employees WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({ error: "Username or email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const insertResult = await query(
      `INSERT INTO employees
        (username, password_hash, first_name, last_name, email, phone, department, job_title,
         address1, address2, city, state, postal_code)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, username, first_name, last_name`,
      [
        username,
        passwordHash,
        firstName,
        lastName,
        email,
        phone || null,
        department || null,
        jobTitle || null,
        address1 || null,
        address2 || null,
        city || null,
        state || null,
        postalCode || null
      ]
    );

    return res.status(201).json({
      message: "Registration complete.",
      employee: insertResult.rows[0]
    });
  } catch (error) {
    console.error("Error during registration:", error);
    if (error.code === "23505") {
      return res.status(409).json({ error: "Username or email already exists." });
    }
    return res.status(500).json({ error: "Registration failed. Please try again later." });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    const result = await query(
      "SELECT id, username, password_hash, first_name, last_name FROM employees WHERE username = $1",
      [username]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const employee = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, employee.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    return res.json({
      message: "Login successful.",
      employee: {
        id: employee.id,
        username: employee.username,
        firstName: employee.first_name,
        lastName: employee.last_name
      }
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: "Login failed. Please try again later." });
  }
});

export default router;
