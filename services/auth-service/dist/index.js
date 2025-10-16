"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const logger_middleware_1 = require("./middleware/logger.middleware");
const database_1 = require("./config/database");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(logger_middleware_1.requestLogger);
// Health check with database status
app.get("/health", async (req, res) => {
    const dbHealth = await (0, database_1.getConnectionHealth)();
    const overallHealth = dbHealth.healthy;
    res.status(overallHealth ? 200 : 503).json({
        status: overallHealth ? "ok" : "degraded",
        service: "auth-service",
        timestamp: new Date().toISOString(),
        database: dbHealth,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || "1.0.0",
    });
});
// Routes
app.use("/api/auth", auth_routes_1.default);
// Error handling
app.use(error_middleware_1.errorHandler);
app.listen(PORT, () => {
    console.log(`[Auth Service] Running on port ${PORT}`);
    console.log(`[Auth Service] Environment: ${process.env.NODE_ENV || "development"}`);
});
//# sourceMappingURL=index.js.map