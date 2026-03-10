import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("data.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS app_data (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    profile TEXT NOT NULL
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get("/api/data", (req, res) => {
    const row = db.prepare("SELECT data FROM app_data WHERE id = 1").get() as { data: string } | undefined;
    res.json(row ? JSON.parse(row.data) : {});
  });

  app.post("/api/sync", (req, res) => {
    const data = JSON.stringify(req.body);
    db.prepare("INSERT OR REPLACE INTO app_data (id, data) VALUES (1, ?)").run(data);
    res.json({ status: "ok" });
  });

  app.get("/api/profile", (req, res) => {
    const row = db.prepare("SELECT profile FROM user_profile WHERE id = 1").get() as { profile: string } | undefined;
    res.json(row ? JSON.parse(row.profile) : { 
      name: 'Leo Luz', 
      cpf: '', 
      profileImage: '',
      menuButtonImage: undefined
    });
  });

  app.post("/api/profile", (req, res) => {
    const profile = JSON.stringify(req.body);
    db.prepare("INSERT OR REPLACE INTO user_profile (id, profile) VALUES (1, ?)").run(profile);
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
