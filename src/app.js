/**
* Express Application Setup
* -------------------------
* This file initializes the Express.js application with security, logging,
* body parsing, routing, and error handling middleware.
*
* Key Features:
* - Helmet: Adds security-related HTTP headers
* - CORS: Allows cross-origin requests from frontend
* - Morgan: Logs HTTP requests
* - Routes: Auth & Admin endpoints
* - Health Check endpoint
* - 404 handling
* - Global error handler
*/

const express = require("express"); // Import Express framework
const cors = require("cors"); // Middleware for Cross-Origin Resource Sharing
const helmet = require("helmet"); // Middleware to secure Express apps by setting various HTTP headers
const morgan = require("morgan"); // Middleware for logging HTTP requests
require("dotenv").config(); // Loads environment variables from a .env file

// Import route files
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const medicineRoutes = require("./routes/medicineRoutes");

// Import database models (sequelize models are initialized here)
const db = require("./models");

const app = express(); // Initialize Express app

// ---------------------- Middleware Setup ----------------------

// Security middleware
app.use(helmet()); // Adds various HTTP headers for better security

// CORS configuration - allows frontend app to access this backend API

// app.use((req, res, next) => {
//   const allowedOrigins = [
//     process.env.FRONTEND_URL,
//     "http://localhost:3000",
//     "http://localhost:3001",
//   ];
//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader("Access-Control-Allow-Origin", origin);
//     res.setHeader("Access-Control-Allow-Credentials", "true");
//     res.setHeader(
//       "Access-Control-Allow-Methods",
//       "GET, POST, PUT, DELETE, OPTIONS"
//     );
//     res.setHeader(
//       "Access-Control-Allow-Headers",
//       "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//     );
//   }

//   if (req.method === "OPTIONS") {
//     return res.status(200).end();
//   }

//   next();
// });
app.use(
  cors({
    origin: [
      "https://medicine-inventory-xdzx.vercel.app",
      "http://localhost:3001"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
// app.use(cors(...));
app.options("*", cors());



// Logging middleware
app.use(morgan("combined")); // Logs HTTP requests in Apache combined format

// Body parsing middleware
app.use(express.json({ limit: "10mb" })); // Parse JSON request bodies, limit set to 10MB
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// ---------------------- Routes ----------------------

// Authentication routes (e.g., login, register, refresh token)
app.use("/auth", authRoutes);

// Admin routes (e.g., user management, dashboard)
app.use("/admin", adminRoutes);

// Medicine routes (e.g., CRUD operations for medicines)
app.use("/medicines", medicineRoutes);

// Health check endpoint
// Used to verify if the server is running and reachable
app.get("/health", (req, res) => {
 res.json({
   success: true,
   message: "Server is running",
   timestamp: new Date().toISOString(), // Current server time
 });
});

// ---------------------- Error Handling ----------------------

// Handle 404 - Route not found
app.use((req, res) => {
 res.status(404).json({
   success: false,
   message: "Route not found",
 });
});

// Global error handler
// Catches any errors thrown in the app and returns a structured JSON response
app.use((err, req, res, next) => {
 console.error("Global error handler:", err); // Log the error to server console
 res.status(500).json({
   success: false,
   message: "Something went wrong!", // Generic error message for users
   // Show detailed error only in development mode
   ...(process.env.NODE_ENV === "development" && { error: err.message }),
 });
});

// Export app for server.js or testing purposes
module.exports = app;

