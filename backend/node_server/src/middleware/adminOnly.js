/**
 * Admin-only middleware — must be used AFTER authMiddleware
 * Equivalent to FastAPI's get_current_admin dependency
 */
function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ detail: "The user doesn't have enough privileges" });
  }
  next();
}

module.exports = adminOnly;
