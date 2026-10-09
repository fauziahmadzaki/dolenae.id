# AGENTS.md — middleware/

Middleware Express murni `(req, res, next)`.

- `request-id.ts`: beri/pantulkan `x-request-id`.
- `validate.ts`: validation pipe Zod → hasil di `req.validated`.
- `error-handler.ts`: `notFoundHandler` + `errorHandler` (envelope seragam);
  **registrasikan error handler paling akhir** di `app.ts`.
- Jangan taruh logika bisnis di sini.
