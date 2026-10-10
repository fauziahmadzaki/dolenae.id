import type { RequestHandler } from "express";
import { authService } from "../services/auth.service";
import { UnauthorizedError } from "../utils/errors";
import { ok } from "../utils/response";
import { getValidated } from "../middleware/validate";
import type {
  ForgotPasswordInput,
  GoogleInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "./auth.schema";

export const authController = {
  /** POST /api/auth/register */
  register: (async (req, res) => {
    const body = getValidated<RegisterInput>(req, "body");
    const result = await authService.register(body);
    ok(res, result, undefined, 201);
  }) satisfies RequestHandler,

  /** POST /api/auth/login */
  login: (async (req, res) => {
    const body = getValidated<LoginInput>(req, "body");
    ok(res, await authService.login(body));
  }) satisfies RequestHandler,

  /** POST /api/auth/google */
  google: (async (req, res) => {
    const body = getValidated<GoogleInput>(req, "body");
    ok(res, await authService.googleLogin(body));
  }) satisfies RequestHandler,

  /** POST /api/auth/forgot-password */
  forgotPassword: (async (req, res) => {
    const body = getValidated<ForgotPasswordInput>(req, "body");
    ok(res, await authService.forgotPassword(body));
  }) satisfies RequestHandler,

  /** POST /api/auth/reset-password */
  resetPassword: (async (req, res) => {
    const body = getValidated<ResetPasswordInput>(req, "body");
    ok(res, await authService.resetPassword(body));
  }) satisfies RequestHandler,

  /** GET /api/auth/me (protected) */
  me: (async (req, res) => {
    if (!req.user) throw new UnauthorizedError();
    ok(res, { user: await authService.getMe(req.user.id) });
  }) satisfies RequestHandler,
};
