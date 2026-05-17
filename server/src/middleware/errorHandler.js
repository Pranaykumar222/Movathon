// Global error handler — Express calls this whenever next(error) is called.
// Centralizing error handling means we never have try/catch duplication in controllers.
export const errorHandler = (err, req, res, next) => {
    console.error("Error:", err.message);
  
    // Prisma unique constraint violation (e.g., duplicate email)
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: `A record with this ${err.meta?.target?.join(", ")} already exists.`,
      });
    }
  
    // Prisma record not found
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Record not found.",
      });
    }
  
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || "Internal server error.",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  };
  
  // Shortcut to create errors with status codes
  export const createError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  };