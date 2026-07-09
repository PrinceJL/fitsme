import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const SALT_ROUNDS = 12;

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export const AuthService = {
  async register({ email, password, fullName }) {
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      throw new ApiError(409, 'An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await UserModel.create({ email, passwordHash, fullName });
    const token = signToken(user);

    return { user, token };
  },

  async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const token = signToken(user);
    const { password_hash: _omit, ...safeUser } = user;

    return { user: safeUser, token };
  },
};
