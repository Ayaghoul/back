import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

import connectDB from "./config/ConnectDB.js";
import productRoutes from "./Routes/productRoutes.js";
import userRoutes from "./Routes/userRoutes.js"; // ⚡ il manquait ça
import orderRoutes from "./Routes/orderRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Activer CORS pour toutes les requêtes
app.use(
  cors({
    origin: "http://localhost:3000", // frontend
    credentials: true,
  })
);

// __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// rendre le dossier uploads accessible
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// ⚡ Brancher les routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes); // <- indispensable
app.use("/api/orders", orderRoutes);

// middlewares erreurs
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));