import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

//TODO routes da mettere qui (import)

const app = express();
const PORT = process.env.PORT || 3000;
const CONNECTION_URL = process.env.CONNECTION_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "../frontend")));
app.set("view engine", "ejs");
app.set("views", "../frontend/views");

app.get("/", (req, res) => {
  res.render("registrazione"); // render il file registrazione.ejs
});

mongoose
  .connect(CONNECTION_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server running on port: ${PORT}`);
    });
  })
  .catch((error) => console.error(error));
