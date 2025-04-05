const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Step 1: Extract token from Authorization header
  const token = req.header("Authorization");

  // Debugging: Log the token to check its presence and format
  console.log("Authorization Header:", token);

  if (!token) {
    // Debugging: Log the absence of the token
    console.log("No token provided.");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Step 2: Remove "Bearer " prefix if present and verify the token
    const tokenWithoutBearer = token.replace("Bearer ", "");

    // Debugging: Log the token without "Bearer " for further inspection
    console.log("Token without Bearer:", tokenWithoutBearer);

    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);

    // Step 3: Attach decoded user data to the request object
    req.user = decoded;

    // Debugging: Log the decoded token for debugging
    console.log("Decoded Token:", decoded);

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    // Debugging: Log the error if token verification fails
    console.error("JWT Error:", error);

    // Handle errors if token is invalid or expired
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
