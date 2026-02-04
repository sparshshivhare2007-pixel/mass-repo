import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'massreport_secret_key_change_in_production';

export function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function getUserFromToken(token) {
  const decoded = verifyToken(token);
  return decoded ? decoded : null;
}
