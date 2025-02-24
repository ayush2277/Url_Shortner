const jwt = require('jsonwebtoken');
const secret = "Ayush@123@"  // Ideally, use process.env.JWT_SECRET

function setUser(user) {
  return jwt.sign( {
    id: user._id,
    email: user.email,
  },
  secret
);// Generates a JWT with only the user ID
}

function getUser(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return null;
  }
}

module.exports = { setUser, getUser };
