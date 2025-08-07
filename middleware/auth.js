function authMiddleware(req, res, next) {
  const token = req.headers.authorization;

  if (!token || token !== "faxriyor_123") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  next();
}

module.exports = authMiddleware;
