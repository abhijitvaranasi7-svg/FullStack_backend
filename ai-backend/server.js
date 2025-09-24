const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { getRecommendations } = require("./recommend"); 

const app = express();
const PORT = 5000;
const SECRET_KEY = "supersecret"; 

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./users.db");

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    content TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  )
`);

const DATA_LAKE_PATH = path.join(__dirname, "data_lake");
if (!fs.existsSync(DATA_LAKE_PATH)) fs.mkdirSync(DATA_LAKE_PATH);

const META_PATH = path.join(DATA_LAKE_PATH, "metadata.json");
if (!fs.existsSync(META_PATH)) fs.writeFileSync(META_PATH, "[]");


app.post("/register", (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashedPassword],
        function (err) {
            if (err) return res.status(400).json({ error: "User already exists" });
            res.json({ message: "Registration successful" });
        }
    );
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err || !user) return res.status(400).json({ error: "Invalid username or password" });

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(400).json({ error: "Invalid username or password" });

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ message: "Login successful", token });
    });
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}


app.get("/profile", authenticateToken, (req, res) => {
    res.json({ message: "This is your profile", user: req.user });
});

app.post("/upload", authenticateToken, (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "No content provided" });

    const createdAt = new Date().toISOString();

    db.run(
        "INSERT INTO uploads (userId, content, createdAt) VALUES (?, ?, ?)",
        [req.user.id, content, createdAt],
        function (err) {
            if (err) return res.status(500).json({ error: "Failed to save upload" });

            const post = { id: this.lastID, userId: req.user.id, username: req.user.username, content, createdAt };
            const filePath = path.join(DATA_LAKE_PATH, `post_${this.lastID}.json`);
            fs.writeFileSync(filePath, JSON.stringify(post, null, 2));

            let metadata = JSON.parse(fs.readFileSync(META_PATH));
            metadata.push({ id: this.lastID, userId: req.user.id, username: req.user.username, createdAt, file: `post_${this.lastID}.json` });
            fs.writeFileSync(META_PATH, JSON.stringify(metadata, null, 2));

            res.json({ message: "Upload saved!", id: this.lastID });
        }
    );
});

app.get("/posts", authenticateToken, (req, res) => {
    const sql = `
      SELECT uploads.id, uploads.content, users.username
      FROM uploads
      JOIN users ON uploads.userId = users.id
      ORDER BY uploads.createdAt DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Failed to fetch posts" });
        res.json(rows);
    });
});

app.get("/search", authenticateToken, (req, res) => {
    const q = req.query.q?.toLowerCase();
    if (!q) return res.json([]);

    const sql = `
      SELECT uploads.id, uploads.content, users.username
      FROM uploads
      JOIN users ON uploads.userId = users.id
      WHERE LOWER(uploads.content) LIKE ?
      ORDER BY uploads.createdAt DESC
    `;
    db.all(sql, [`%${q}%`], (err, rows) => {
        if (err) return res.status(500).json({ error: "Failed to search" });
        res.json(rows);
    });
});

app.get("/recommendations", authenticateToken, (req, res) => {
    try {
        const recs = getRecommendations(req.user.id);
        res.json({ suggestions: recs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate recommendations" });
    }
});

app.post("/logout", (req, res) => {
    res.json({ message: "Logged out" });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
