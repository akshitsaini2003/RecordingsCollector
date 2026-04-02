const jwt = require("jsonwebtoken");

const authenticate = (requiredRole) => (req, res, next) => {
  const authorizationHeader = req.headers.authorization || "";

  if (!authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized access." });
  }

  const token = authorizationHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (requiredRole && decodedToken.role !== requiredRole) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    req.auth = decodedToken;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = authenticate;
