import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import { closePool } from "./db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

function shutdown() {
  console.log("Shutting down server...");
  server.close(() => {
    closePool()
      .then(() => {
        console.log("PostgreSQL pool closed.");
        process.exit(0);
      })
      .catch((err) => {
        console.error("Error closing pool", err);
        process.exit(1);
      });
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
