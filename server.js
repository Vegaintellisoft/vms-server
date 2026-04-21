// ============================================================
// VISITOR MANAGEMENT SYSTEM - API SERVER
// Production-Ready Configuration
// ============================================================

const dotenv = require("dotenv");
dotenv.config();

// Validate required environment variables before starting
const requiredEnvVars = [
  "DB_HOST",
  "DB_USER",
  "DB_NAME",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(
    `ERROR: Missing required environment variables: ${missingEnvVars.join(", ")}`,
  );
  console.error("Please check your .env file");
  process.exit(1);
}

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// Import middleware
const {
  generalLimiter,
  authLimiter,
  otpLimiter,
} = require("./middleware/rateLimiter");
const { authenticateToken } = require("./middleware/auth");
const { logger, errorLogger, requestLogger } = require("./utils/logger");

// Import database
const db = require("./db");

const app = express();

// ============================================================
// SECURITY MIDDLEWARE
// ============================================================

// Helmet - Security headers
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }),
);

// CORS - Configure allowed origins
const corsOptions = {
  // origin: process.env.CORS_ORIGIN
  //   ? process.env.CORS_ORIGIN.split(",").map(s => s.trim())
  //   : [
  //       "http://localhost:3000",
  //       "http://localhost:4200",
  //       "http://localhost:5173",
  //       "https://localhost:5173",
  //     ],
  origin : "*",
  // credentials: true, // Allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
app.use(cors(corsOptions));

// Cookie parser - Required for reading refresh tokens
app.use(cookieParser());

// Rate limiting - Apply to all requests
app.use(generalLimiter);

// Request logging
app.use(requestLogger);

// ============================================================
// BODY PARSING MIDDLEWARE
// ============================================================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ============================================================
// STATIC FILES
// ============================================================

// Serve images from 'uploads' directory at /uploads URL
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: process.env.NODE_ENV === "production" ? "1d" : 0,
  }),
);

// Serve public files (e.g., verify.html for admin verification page)
app.use(express.static(path.join(__dirname, "public")));

// ============================================================
// SWAGGER DOCUMENTATION
// ============================================================

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "VMS API",
      version: "1.0.0",
      description: "Visitor Management System API Documentation",
    },
    servers: [
      {
        url: process.env.BASE_URL || "http://localhost:3000",
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "refreshToken",
        },
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============================================================
// HEALTH CHECK ENDPOINT
// ============================================================

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ============================================================
// IMPORT ROUTES
// ============================================================

const dashboardRoutes = require("./routes/dashboard_routes");
const companyRoutes = require("./routes/company");
const departmentRoutes = require("./routes/department");
const designationRoutes = require("./routes/designation");
const employeeRoutes = require("./routes/employees_routes");
const uploadRoutes = require("./routes/upload");
const roleRoutes = require("./routes/role_routes");
const authRoutes = require("./routes/auth_routes");
const dropdownRoutes = require("./routes/dropdownRoutes");
const visitorRoutes = require("./routes/visitor");
const appointmentRoutes = require("./routes/appointment_routes");
const selectRoutes = require("./routes/select_routes");
const visitorreportRoutes = require("./routes/visitor_reports_routes");
const appointmentreportRoutes = require("./routes/appointment_report_routes");

// ============================================================
// APPLY ROUTES
// ============================================================

// Public routes (no authentication required)
app.use("/api/v1/auth", authLimiter, authRoutes); // Rate limited auth routes

// Protected routes (require authentication)
app.use("/api/v1/dashboard", authenticateToken, dashboardRoutes);
app.use("/api/v1/appointments", authenticateToken, appointmentRoutes);
app.use(
  "/api/v1/appointments_report",
  authenticateToken,
  appointmentreportRoutes,
);
app.use("/api/v1/visitors_reports", authenticateToken, visitorreportRoutes);
app.use("/api/v1/selects", authenticateToken, selectRoutes);
app.use("/api/v1/dropdowns", authenticateToken, dropdownRoutes);
app.use("/api/v1/companies", authenticateToken, companyRoutes);
app.use("/api/v1/employees", authenticateToken, employeeRoutes);
app.use("/api/v1/designations", authenticateToken, designationRoutes);
app.use("/api/v1/departments", authenticateToken, departmentRoutes);
app.use("/api/v1/upload", authenticateToken, uploadRoutes);
app.use("/api/v1/roles", authenticateToken, roleRoutes);

// Visitor routes - some public, some protected
// Standardize visitor routes under /api/v1/visitors
app.use("/api/v1/visitors", visitorRoutes);

// Public appointment routes (e.g. self-registration/OTP)
app.use("/api/v1/public/appointments", appointmentRoutes);

// Public dropdown route for visitor check-in (no auth required)
app.use("/api/v1/public/dropdowns", dropdownRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Visitor Management System API",
    version: "1.0.0",
    status: "running",
    documentation: `${process.env.BASE_URL || "http://localhost:3000"}/api-docs`,
  });
});

// ============================================================
// ERROR HANDLING
// ============================================================

// Error logging middleware
app.use(errorLogger);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.url}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : err.message;

  logger.error("Unhandled error:", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(statusCode).json({
    error: statusCode >= 500 ? "Internal Server Error" : "Request Error",
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// ============================================================
// SERVER STARTUP & GRACEFUL SHUTDOWN
// ============================================================

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`VMS API Server started`, {
    port: PORT,
    environment: process.env.NODE_ENV || "development",
    url: `http://localhost:${PORT}`,
    docs: `http://localhost:${PORT}/api-docs`,
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close((err) => {
    if (err) {
      logger.error("Error during server shutdown:", err);
      process.exit(1);
    }

    logger.info("HTTP server closed");

    // Close database connections
    if (db.end) {
      db.end((err) => {
        if (err) {
          logger.error("Error closing database:", err);
          process.exit(1);
        }
        logger.info("Database connections closed");
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });

  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    logger.error("Graceful shutdown timeout, forcing exit");
    process.exit(1);
  }, 30000); // 30 seconds timeout
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

module.exports = app;
