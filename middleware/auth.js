const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Check if the token is in the Authorization header or cookies
  const authHeader = req.header('Authorization');
  const token = authHeader ? authHeader.replace('Bearer ', '') : req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Access denied, no token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach decoded user info to the request object
    next();  // Proceed to the next middleware
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};
