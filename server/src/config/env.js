const stripTrailingSlash = (value) => value?.replace(/\/+$/, "");

// Validates that required environment variables exist at startup.
// The app crashes immediately with a clear error instead of later with a cryptic one.
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "PORT"];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: stripTrailingSlash(process.env.CLIENT_URL) || "http://localhost:5173",
  isDev: process.env.NODE_ENV === "development",
};
