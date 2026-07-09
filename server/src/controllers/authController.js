import { AuthService } from '../services/authService.js';

export const AuthController = {
  async register(req, res, next) {
    try {
      const { email, password, fullName } = req.body;
      const { user, token } = await AuthService.register({ email, password, fullName });
      res.status(201).json({ user, token });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.login({ email, password });
      res.status(200).json({ user, token });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      // req.user is populated by the authenticate middleware
      res.status(200).json({ user: req.user });
    } catch (err) {
      next(err);
    }
  },
};
