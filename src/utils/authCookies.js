function parseCookieHeader(headerValue) {
  const cookies = {};
  if (!headerValue) return cookies;

  headerValue.split(";").forEach((part) => {
    const [rawKey, ...rawValueParts] = part.split("=");
    const key = rawKey ? rawKey.trim() : "";
    if (!key) return;
    const value = rawValueParts.join("=").trim();
    cookies[key] = decodeURIComponent(value || "");
  });

  return cookies;
}

function setCookie(res, name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge != null) parts.push(`Max-Age=${options.maxAge}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.secure) parts.push("Secure");

  const existing = res.getHeader("Set-Cookie");
  const next = parts.join("; ");

  if (!existing) {
    res.setHeader("Set-Cookie", next);
    return;
  }

  if (Array.isArray(existing)) {
    res.setHeader("Set-Cookie", [...existing, next]);
    return;
  }

  res.setHeader("Set-Cookie", [existing, next]);
}

function clearCookie(res, name, options = {}) {
  setCookie(res, name, "", { ...options, maxAge: 0 });
}

module.exports = { parseCookieHeader, setCookie, clearCookie };

