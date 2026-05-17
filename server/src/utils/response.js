// Standardized response helpers so every API response has the same shape.
// Frontend can always check response.data.success to know if it worked.
export const sendSuccess = (res, data, message = "Success", statusCode = 200) => {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };
  
  export const sendError = (res, message = "Error", statusCode = 400) => {
    res.status(statusCode).json({
      success: false,
      message,
      data: null,
    });
  };