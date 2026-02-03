const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided byt telth id' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next(); // Properly call next() without inline comments
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token by telthid' });
  }
};

module.exports = authMiddleware;





