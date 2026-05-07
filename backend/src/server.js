import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"
import client from "prom-client"
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import doctorRoutes from "./routes/doctors.js"
import appointmentRoutes from "./routes/appointments.js"
import cycleRoutes from "./routes/cycles.js"
import notificationRoutes from "./routes/notifications.js"
import prescriptionRoutes from "./routes/prescriptions.js"
import adminRoutes from "./routes/admin.js"
import { errorHandler } from "./middleware/errorHandler.js"

dotenv.config()

const app = express()

// Prometheus metrics
const register = new client.Registry()
client.collectDefaultMetrics({ register })

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
  registers: [register],
})

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route"],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
})

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://frontend:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json())

// Track request metrics
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer({ method: req.method, route: req.path })
  res.on("finish", () => {
    httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode })
    end()
  })
  next()
})

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/doctors", doctorRoutes)
app.use("/api/appointments", appointmentRoutes)
app.use("/api/cycles", cycleRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/prescriptions", prescriptionRoutes)
app.use("/api/admin", adminRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

// Prometheus metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType)
  res.end(await register.metrics())
})

// Error handling
app.use(errorHandler)

const PORT = process.env.PORT || 5000
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`)
// })

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;