import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { transcribeAudio } from "./transcriber.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: "uploads/" });

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Audio upload route
app.post("/transcribe", upload.single("file"), async (req, res) => {
  try {
    const result = await transcribeAudio(req.file.path);
    res.json(result);
  } catch (error) {
    console.error("Error in /transcribe:", error);
    res.status(500).json({ error: "Processing failed" });
  }
});

app.get(/^\/\.well-known\/.*/, (req, res) => {
  res.status(204).end();
});

app.listen(3000, () => {
  console.log(" Server running at http://localhost:3000");
});
