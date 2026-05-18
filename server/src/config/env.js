const stripTrailingSlash = (value) => value?.replace(/\/+$/, "");
const parseClientUrls = (value) => {
  const configuredUrls = (value || "http://localhost:5173")
    .split(",")
    .map((url) => stripTrailingSlash(url.trim()))
    .filter(Boolean);

  if (process.env.NODE_ENV !== "production") {
    configuredUrls.push("http://localhost:5173", "http://127.0.0.1:5173");
  }

  return [...new Set(configuredUrls)];
};

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
  clientUrls: parseClientUrls(process.env.CLIENT_URL),
  isDev: process.env.NODE_ENV === "development",
};
