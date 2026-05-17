import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { OAuth2Client } from "google-auth-library";
import { generateToken } from "../utils/jwt.js";
import { sendSuccess } from "../utils/response.js";
import { createError } from "../middleware/errorHandler.js";

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw createError("Username, email, and password are required.", 400);
    }

    if (password.length < 6) {
      throw createError("Password must be at least 6 characters.", 400);
    }

    // Hash the password — NEVER store plain text passwords
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
      select: { id: true, username: true, email: true, createdAt: true },
    });

    const token = generateToken({ id: user.id, email: user.email });

    sendSuccess(res, { user, token }, "Account created successfully.", 201);
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError("Email and password are required.", 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Intentionally vague to prevent user enumeration
      throw createError("Invalid credentials.", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw createError("Invalid credentials.", 401);
    }

    const token = generateToken({ id: user.id, email: user.email });

    const { password: _, ...userWithoutPassword } = user;
    sendSuccess(res, { user: userWithoutPassword, token }, "Logged in successfully.");
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me  (protected)
export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, email: true, createdAt: true },
    });

    if (!user) throw createError("User not found.", 404);

    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/google
export const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw createError("Google token is required.", 400);

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create a new user with a random placeholder password
      const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), 12);
      user = await prisma.user.create({
        data: { username: name || email.split("@")[0], email, password: hashedPassword },
        select: { id: true, username: true, email: true, createdAt: true },
      });
    }

    const jwtToken = generateToken({ id: user.id, email: user.email });

    // Strip password if user was found from db
    const { password: _, ...userWithoutPassword } = user;

    sendSuccess(res, { user: userWithoutPassword, token: jwtToken }, "Google login successful.");
  } catch (error) {
    next(error);
  }
};