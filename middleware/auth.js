import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
  try {
    // Read token from cookie or Authorization header. Don't use browser localStorage on server.
    let token = req.cookies?.accessToken || req?.headers?.authorization?.split(" ")[1];
    console.log("Received Token:", token);

    if (!token) {
      return res.status(401).json({
        message: "Authentication failed. No token provided.",
        error: true,
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userId = decoded.id; 

    next();
  } catch (error) {
    
    
    console.error("Authentication Error:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token. Please log in again.",
        error: true,
        success: false,
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired. Please log in again.",
        error: true,
        success: false,
      });
    }
    
    // Handle other errors
    return res.status(500).json({
      message: "Internal server error. Authentication failed.",
      error: true,
      success: false,
    });
  }
};

export default auth;