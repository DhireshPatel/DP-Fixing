import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "dev_only_insecure_secret";
const COOKIE_NAME = "dpfixing_admin_token";
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

export function signAdminToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_MAX_AGE_SECONDS });
}

export function verifyAdminToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE_SECONDS,
  };
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;

/**
 * Reads and verifies the admin token from a Next.js Request object's cookies.
 * Returns the decoded payload, or null if not authenticated.
 */
export function getAdminFromRequest(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
