import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (userId, userRole, res) => {
  const token = jwt.sign({ userId, role: userRole }, process.env.JWT_SECRET, {
    expiresIn: '15d',
  });

  res.cookie('jwt', token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
    httpOnly: true, // Prevent XSS attacks by not allowing JS to access the cookie
    sameSite: 'strict', // Prevent CSRF attacks
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
  });
};

export default generateTokenAndSetCookie;
