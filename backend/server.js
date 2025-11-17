import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

//TODO routes da mettere qui (import)

const app = express();
const PORT = process.env.PORT || 3000;
const CONNECTION_URL = process.env.CONNECTION_URL;

app.use(express.json());
app.use(cors());
//TODO per le routes app.use('')

//app.get("/", (req, res) => res.send("benvenuto nella homepage"));
app.get("/", (req, res) => {
  res.render("registrazione");
});

mongoose
  .connect(CONNECTION_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server running on port: ${PORT}`);
    });
  })
  .catch((error) => console.error(error));
