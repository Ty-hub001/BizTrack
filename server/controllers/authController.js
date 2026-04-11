const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const isValidEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(email)) return false;
  const blockedDomains = [
    'mailinator.com', 'guerrillamail.com', 'tempmail.com',
    'throwaway.email', 'fakeinbox.com', 'trashmail.com',
    'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com',
    'grr.la', 'spam4.me', 'maildrop.cc', 'dispostable.com',
  ];
  const domain = email.split('@')[1]?.toLowerCase();
  if (blockedDomains.includes(domain)) return false;
  return true;
};

// REGISTER
const register = (req, res) => {
  const { name, email, password } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Please use a valid email address' });
  }
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length > 0) return res.status(400).json({ message: 'An account with this email already exists' });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const insertQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(insertQuery, [name.trim(), email.toLowerCase(), hashedPassword], (err, result) => {
      if (err) {
        console.error('Register error:', err);
        return res.status(500).json({ message: 'Error creating account' });
      }
      const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ message: 'Account created successfully', token });
    });
  });
};

// LOGIN
const login = (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email.toLowerCase()], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'No account found with this email' });

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: 'Login successful', token });
  });
};

// GET PROFILE
const getProfile = (req, res) => {
  const query = 'SELECT id, name, email, avatar, created_at FROM users WHERE id = ?';
  db.query(query, [req.userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(results[0]);
  });
};

// UPDATE PROFILE
const updateProfile = (req, res) => {
  const { name, currentPassword, newPassword, avatar } = req.body;

  const query = 'SELECT * FROM users WHERE id = ?';
  db.query(query, [req.userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = results[0];

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password is required' });
      const isMatch = bcrypt.compareSync(currentPassword, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });
      if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });

      const hashed = bcrypt.hashSync(newPassword, 10);
      const updateQuery = 'UPDATE users SET name = ?, password = ?, avatar = ? WHERE id = ?';
      db.query(updateQuery, [name?.trim() || user.name, hashed, avatar || user.avatar, req.userId], (err) => {
        if (err) {
          console.error('Update password error:', err);
          return res.status(500).json({ message: 'Database error' });
        }
        res.status(200).json({ message: 'Profile updated successfully' });
      });
    } else {
      const updateQuery = 'UPDATE users SET name = ?, avatar = ? WHERE id = ?';
      db.query(updateQuery, [name?.trim() || user.name, avatar !== undefined ? avatar : user.avatar, req.userId], (err) => {
        if (err) {
          console.error('Update profile error:', err);
          return res.status(500).json({ message: 'Database error' });
        }
        res.status(200).json({ message: 'Profile updated successfully' });
      });
    }
  });
};

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email.toLowerCase()], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const user = results[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate old tokens
    const deleteQuery = 'DELETE FROM password_reset_tokens WHERE user_id = ?';
    db.query(deleteQuery, [user.id], async (err) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      // Save new token
      const insertQuery = 'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)';
      db.query(insertQuery, [user.id, token, expiresAt], async (err) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

        const html = `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
            <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
              <h1 style="color: #fff; font-size: 28px; font-weight: 800; margin: 0;">BizTrack</h1>
              <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0;">Business Management Platform</p>
            </div>

            <div style="background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
              <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 12px;">Reset your password</h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 8px;">Hi ${user.name},</p>
              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
                We received a request to reset your password. Click the button below to create a new password. This link expires in <strong>1 hour</strong>.
              </p>

              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; margin-bottom: 28px;">
                Reset Password →
              </a>

              <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0 0 8px;">
                If you didn't request this, you can safely ignore this email. Your password will not change.
              </p>
              <p style="color: #94a3b8; font-size: 13px; margin: 0;">
                Or copy this link: <a href="${resetUrl}" style="color: #6366f1;">${resetUrl}</a>
              </p>
            </div>

            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 24px 0 0;">
              © 2026 BizTrack · Syvittek Consultant
            </p>
          </div>
        `;

        try {
          await sendEmail({ to: user.email, subject: 'Reset your BizTrack password', html });
          res.status(200).json({ message: 'Password reset link sent to your email' });
        } catch (emailErr) {
          console.error('Email error:', emailErr);
          res.status(500).json({ message: 'Failed to send email. Please try again.' });
        }
      });
    });
  });
};

// RESET PASSWORD
const resetPassword = (req, res) => {
  const { token, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const query = `
    SELECT * FROM password_reset_tokens 
    WHERE token = ? AND used = 0 AND expires_at > NOW()
  `;
  db.query(query, [token], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' });
    }

    const resetToken = results[0];
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(updateQuery, [hashedPassword, resetToken.user_id], (err) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      const markUsedQuery = 'UPDATE password_reset_tokens SET used = 1 WHERE id = ?';
      db.query(markUsedQuery, [resetToken.id], (err) => {
        if (err) console.error('Mark used error:', err);
        res.status(200).json({ message: 'Password reset successfully' });
      });
    });
  });
};

module.exports = { register, login, getProfile, updateProfile, forgotPassword, resetPassword };