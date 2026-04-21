const crypto = require("crypto");
const Session = require("../models/Session");
const User = require("../models/User");
const { parseCookieHeader } = require("../utils/authCookies");

const SESSION_COOKIE = "ajo_session";

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function tokenToHash(token, secret) {
  return sha256(`${secret}:${token}`);
}

function isSecureRequest(req) {
  // In production behind a proxy, honor X-Forwarded-Proto.
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (forwardedProto) return forwardedProto === "https";
  return Boolean(req.secure);
}

async function attachUser(req, res, next) {
  const secret = process.env.AUTH_SECRET || "dev-insecure-secret-change-me";
  res.locals.isSecure = isSecureRequest(req);
  const cookies = parseCookieHeader(req.headers.cookie || "");
  const token = cookies[SESSION_COOKIE];

  req.auth = { user: null, sessionId: null };

  if (!token) {
    res.locals.user = null;
    return next();
  }

  try {
    const tokenHash = tokenToHash(token, secret);
    const session = await Session.findOne({ tokenHash, expiresAt: { $gt: new Date() } });
    if (!session) {
      res.locals.user = null;
      return next();
    }

    const user = await User.findById(session.userId);
    if (!user || user.disabled) {
      res.locals.user = null;
      return next();
    }

    req.auth = { user, sessionId: session._id };
    res.locals.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role
    };
    return next();
  } catch (error) {
    return next(error);
  }
}

function requireAuth(req, res, next) {
  if (req.auth?.user) return next();
  return res.redirect(`/auth/login?next=${encodeURIComponent(req.originalUrl || "/")}`);
}

function requireAdmin(req, res, next) {
  if (!req.auth?.user) {
    return res.redirect(`/auth/login?next=${encodeURIComponent(req.originalUrl || "/admin")}`);
  }
  if (req.auth.user.role !== "admin") {
    return res.status(403).render("errors/403", { message: "Admin access required." });
  }
  return next();
}

function requireAdminApi(req, res, next) {
  if (!req.auth?.user) return res.status(401).json({ message: "Authentication required" });
  if (req.auth.user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  return next();
}

function requireAuthApi(req, res, next) {
  if (!req.auth?.user) return res.status(401).json({ message: "Authentication required" });
  return next();
}

module.exports = {
  SESSION_COOKIE,
  tokenToHash,
  attachUser,
  requireAuth,
  requireAdmin,
  requireAdminApi,
  requireAuthApi
};
