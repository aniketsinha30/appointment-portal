// middlewares/roleMiddleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)||!(req.user.isApproved)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient Permission' });
    }
    next();
  };
};

module.exports = { authorize };
