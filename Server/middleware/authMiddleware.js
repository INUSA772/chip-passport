
const jwt = require('jsonwebtoken');

function protect(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer <token>" → just <token>

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

   
    req.staff = { staffId: decoded.staffId, role: decoded.role };

    next(); // token is valid — let the request continue to the controller
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
}


function restrictTo(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.staff.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    next();
  };
}

module.exports = { protect, restrictTo };