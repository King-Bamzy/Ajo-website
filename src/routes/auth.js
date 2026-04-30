const crypto = require("crypto");
const express = require("express");

const Session = require("../models/Session");
const User = require("../models/User");
const { hashPassword, verifyPassword } = require("../utils/passwords");
const { clearCookie, setCookie } = require("../utils/authCookies");
const { SESSION_COOKIE, tokenToHash } = require("../middleware/auth");

const router = express.Router();

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function randomToken() {
  return crypto.randomBytes(32).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createSession(res, req, userId) {
  const secret = process.env.AUTH_SECRET || "dev-insecure-secret-change-me";
  const token = randomToken();
  const tokenHash = tokenToHash(token, secret);

  const maxAgeSeconds = Number(process.env.AUTH_SESSION_MAX_AGE_SECONDS || 60 * 60 * 24 * 7);
  const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000);

  await Session.create({ tokenHash, userId, expiresAt });

  const secure = res.locals?.isSecure || false;
  setCookie(res, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    secure,
    maxAge: maxAgeSeconds
  });
}

router.get("/login", (req, res) => {
  res.render("auth/login", {
    next: req.query.next || "/account",
    error: null
  });
});

router.get("/signup", (req, res) => {
  res.render("auth/signup", {
    next: req.query.next || "/account",
    error: null
  });
});

router.post("/logout", async (req, res, next) => {
  try {
    if (req.auth?.sessionId) {
      await Session.findByIdAndDelete(req.auth.sessionId);
    }
    clearCookie(res, SESSION_COOKIE, { path: "/" });
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

router.post("/signup", async (req, res, next) => {
  const nextUrl = req.body.next || "/account";
  const name = String(req.body.name || "").trim();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  if (!name || !email) {
    return res.status(400).render("auth/signup", { next: nextUrl, error: "Name and email are required." });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).render("auth/signup", { next: nextUrl, error: "Email is already registered." });
    }

    const passwordHash = hashPassword(password);
    const user = await User.create({ name, email, passwordHash, role: "user" });

    await createSession(res, req, user._id);
    res.redirect(nextUrl);
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const nextUrl = req.body.next || "/account";
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  try {
    const user = await User.findOne({ email });
    const ok = user && !user.disabled && verifyPassword(password, user.passwordHash);

    if (!ok) {
      return res.status(401).render("auth/login", { next: nextUrl, error: "Invalid email or password." });
    }

    await createSession(res, req, user._id);
    res.redirect(nextUrl);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
