import User from '../models/User.model.js';
import { generateToken } from '../config/jwt.js';
import { generateVerificationToken, sendVerificationEmail } from '../utils/email.js';

const isEmailVerificationSkipped = () => process.env.SKIP_EMAIL_VERIFICATION === 'true';
const hasSmtpConfig = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const shouldRequireEmailVerification = () => !isEmailVerificationSkipped() && hasSmtpConfig();

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'org';
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const {
      name,
      pronouns,
      username,
      email,
      password,
      role,
      location,
      age,
      skills,
      interests,
      neededSkills,
      neededInterests,
      organizationDescription,
      website,
      matchingProfile
    } = req.body;

    const effectiveUsername = role === 'nonprofit' ? slugify(name) + '-' + Date.now().toString(36) : username;
    if (role === 'volunteer' && !username?.trim()) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const userExists = await User.findOne({
      $or: [{ email: email?.toLowerCase() }, ...(effectiveUsername ? [{ username: effectiveUsername.toLowerCase() }] : [])]
    });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const requireEmailVerification = shouldRequireEmailVerification();
    const verificationToken = requireEmailVerification ? generateVerificationToken() : undefined;
    const verificationExpires = requireEmailVerification ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined;

    const user = await User.create({
      name,
      pronouns,
      username: effectiveUsername || undefined,
      email,
      password,
      role,
      location,
      age: role === 'volunteer' ? age : undefined,
      skills: role === 'volunteer' ? skills : undefined,
      interests: role === 'volunteer' ? interests : undefined,
      neededSkills: role === 'nonprofit' ? neededSkills : undefined,
      neededInterests: role === 'nonprofit' ? neededInterests : undefined,
      organizationDescription: role === 'nonprofit' ? organizationDescription : undefined,
      website: role === 'nonprofit' ? website : undefined,
      matchingProfile,
      emailVerified: !requireEmailVerification,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid user data' });
    }

    if (!requireEmailVerification) {
      const token = generateToken(user._id);
      const message = isEmailVerificationSkipped()
        ? 'Account created (email verification skipped in dev)'
        : 'Account created (email verification disabled because SMTP is not configured)';
      return res.status(201).json({
        message,
        token,
        user: user.toPublicJSON()
      });
    }

    const emailResult = await sendVerificationEmail(email, verificationToken);
    res.status(201).json({
      message: 'Please check your email to verify your account',
      requiresVerification: true,
      devLink: emailResult?.devLink || undefined,
      user: user.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify email with token
// @route   GET /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const jwtToken = generateToken(user._id);
    res.json({
      message: 'Email verified successfully',
      token: jwtToken,
      user: user.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.emailVerified === false && shouldRequireEmailVerification()) {
      return res.status(403).json({
        message: 'Please verify your email before signing in. Check your inbox for the verification link.'
      });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
