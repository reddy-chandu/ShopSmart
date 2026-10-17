const path = require("path");

// Environment Configuration
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    path: path.resolve(__dirname, ".env"),
  });
}

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const expressFileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

const connectDB = require("./Config/connection");

const userRoutes = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const categoryRoute = require("./routes/categoryRoute");
const chatRoute = require("./routes/chatRoute");

// Express App
const app = express();

app.set("trust proxy", 1);

app.use(helmet());

// cors
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://shopsmart-io.onrender.com",
  ],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// api rate limiter
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiRateLimiter);

// Request Parsers
app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// File Upload
app.use(
  expressFileUpload({
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
    abortOnLimit: true,
    useTempFiles: false,
  })
);

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET_KEY,
  secure: true,
});

// Database Connection
let dbConnectionPromise;

const ensureDatabaseConnection = () => {
  if (!dbConnectionPromise) {
    dbConnectionPromise = connectDB().catch((error) => {
      // Allow a later request to retry if the connection failed.
      dbConnectionPromise = null;
      throw error;
    });
  }

  return dbConnectionPromise;
};

app.use(async (req, res, next) => {
  try {
    await ensureDatabaseConnection();
    next();
  } catch (error) {
    next(error);
  }
});

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
  });
});

// API Routes
app.use("/api/user", userRoutes);
app.use("/api/product", productRoute);
app.use("/api/category", categoryRoute);
app.use("/api/chat", chatRoute);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || error.status || 500;

  // Request body exceeded configured limit
  if (error.type === "entity.too.large") {
    statusCode = 413;
  }

  // Invalid JSON body
  if (
    error instanceof SyntaxError &&
    error.status === 400 &&
    "body" in error
  ) {
    statusCode = 400;
  }

  if (statusCode >= 500) {
    console.error("Server error:", error);
  }

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "An unexpected server error occurred."
        : error.message || "Request failed.",
  });
});

// Local Development Server
if (require.main === module) {
  const PORT = Number(process.env.PORT) || 5000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

// Vercel Export
module.exports = app;