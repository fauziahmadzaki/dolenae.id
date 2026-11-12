import type { RequestHandler } from "express";
import { authService } from "../services/AuthService";
import { UnauthorizedError } from "../utils/errors";
import { ok } from "../utils/response";
import { getValidated } from "../middleware/validate";
import type {
  ForgotPasswordInput,
  GoogleInput,
  LoginInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "../types/auth";

class AuthController {
  /** POST /api/auth/register */
  register: RequestHandler = async (req, res) => {
    const body = getValidated<RegisterInput>(req, "body");
    const result = await authService.register(body);
    ok(res, result, undefined, 201);
  };

  /** POST /api/auth/login */
  login: RequestHandler = async (req, res) => {
    const body = getValidated<LoginInput>(req, "body");
    ok(res, await authService.login(body));
  };

  /** POST /api/auth/google */
  google: RequestHandler = async (req, res) => {
    const body = getValidated<GoogleInput>(req, "body");
    ok(res, await authService.googleLogin(body));
  };

  /** POST /api/auth/forgot-password */
  forgotPassword: RequestHandler = async (req, res) => {
    const body = getValidated<ForgotPasswordInput>(req, "body");
    ok(res, await authService.forgotPassword(body));
  };

  /** POST /api/auth/reset-password */
  resetPassword: RequestHandler = async (req, res) => {
    const body = getValidated<ResetPasswordInput>(req, "body");
    ok(res, await authService.resetPassword(body));
  };

  /** POST /api/auth/verify-email */
  verifyEmail: RequestHandler = async (req, res) => {
    const body = getValidated<VerifyEmailInput>(req, "body");
    ok(res, await authService.verifyEmail(body));
  };

  /** POST /api/auth/resend-verification */
  resendVerification: RequestHandler = async (req, res) => {
    const body = getValidated<ResendVerificationInput>(req, "body");
    ok(res, await authService.resendVerification(body));
  };

  /** GET /api/auth/me (protected) */
  me: RequestHandler = async (req, res) => {
    if (!req.user) throw new UnauthorizedError();
    ok(res, { user: await authService.getMe(req.user.id) });
  };
}

export const authController = new AuthController();
