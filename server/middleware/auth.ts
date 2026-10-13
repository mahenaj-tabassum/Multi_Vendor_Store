import { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { findNeonUser } from "../services/neonUser.js";
import { prisma } from "../config/prisma.js";

// Defines the user information available after authentication
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "merchant" | "customer";
  store_id?: number | null;
}

// Extends Express Request to include the authenticated user.
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}
const NEON_AUTH_JWKS_URL = process.env.NEON_AUTH_JWKS_URL;
const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL;

// Stores the remote public keys used to verify JWT token
let neonJWKS: ReturnType<typeof createRemoteJWKSet> | null = null;

// Stores the expected issuer of the authentication token.
let neonIssuer = "";

try {
  // Initializes the remote JWKS client when its URL is configured.
  if (NEON_AUTH_JWKS_URL) {
    neonJWKS = createRemoteJWKSet(new URL(NEON_AUTH_JWKS_URL));
  }

  // Extracts the issuer origin from the Neon Auth base URL.
  if (NEON_AUTH_BASE_URL) {
    neonIssuer = new URL(NEON_AUTH_BASE_URL).origin;
  }
} catch (e) {
  // Logs configuration errors without crashing the application.
  console.warn("Neon Auth JWkS Initialization Warning:", e);
}

// Verifies the JWT token using Neon Auth JWKS (jose jwtVerify) and returns the authenticated user's information.
// verifyAuthToken()-এর মূল কাজ হলো একটি JWT token যাচাই করে সংশ্লিষ্ট ব্যবহারকারীর পরিচয় এবং application-level role নির্ধারণ করা।
export const verifyAuthToken = async (
  token: string,
): Promise<AuthUser | null> => {
  // Rejects authentication when the token or required configuration is missing.
  if (!token || !neonJWKS || !neonIssuer) {
    return null;
  }
  try {
    // Verifies the token's signature and checks that its issuer is trusted.
    const { payload } = await jwtVerify(token, neonJWKS, {
      issuer: neonIssuer,
    });

    // Rejects tokens that do not contain a user ID or email.
    if (!payload || (!payload.sub && !payload.email)) {
      return null;
    }

    // Normalizes the email address for consistent database lookups.
    const userEmail = String(payload.email || "").toLowerCase();

    // Gets the user ID from the token's subject or ID claim.
    const userId = String(payload.sub || payload.id || "");

    // Looks up the user in the application's database using the available identifiers.
    const u = await findNeonUser({
      ...(userId ? { id: userId } : {}),
      ...(userEmail ? { email: userEmail } : {}),
    });

    // Uses the database ID when available, otherwise falls back to the token ID
    const effectiveId = u?.id || userId;

    // Uses the database name, token name, or email prefix as a fallback
    const effectiveName =
      u?.name || String(payload.name || userEmail.split("@")[0]);

    // Uses the database email when available, otherwise falls back to the token email.
    const effectiveEmail = u?.email || userEmail;

    // Finds the store associated with this user as a merchant.
    const store = await prisma.stores.findFirst({
      where: { merchant_id: effectiveId },
    });

    // Treats users as customers by default.
    let role: "admin" | "merchant" | "customer" = "customer";

    // Checks whether the user matches the current admin identification rules.
    if (
      u?.role === "admin" ||
      payload.role === "admin" ||
      effectiveEmail.includes("admin@")
    ) {
      role = "admin";

      // Assigns the merchant role when a store or merchant role is found.
    } else if (store || u?.role === "merchant" || payload.role === "merchant") {
      role = "merchant";
    }

    // Returns the normalized user information for the authentication middleware.
    return {
      id: effectiveId,
      name: effectiveName,
      email: effectiveEmail,
      role,
      store_id: role === "admin" ? null : store?.id || null,
    };
  } catch {
    // Returns null when token verification or a related operation fails.
    return null;
  }
};

// We will add this middleware function on some APIs where the authentication is required
// Protects API routes by requiring a valid authentication token.
// This middleware runs before the route controller.
export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // Read the Authorization header from the incoming request.
  const authHeader = req.headers.authorization;

  // Reject the request if the Authorization header is missing
  // or does not use the Bearer token format.
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided" });
    return;
  }

  // Extract the token from the Authorization header.
  const token = authHeader.split(" ")[1];

  // Verify the token and retrieve the authenticated user's information.
  const user = await verifyAuthToken(token);

  // Reject the request if the token is invalid or expired.
  if (!user) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
    return;
  }

  // Attach the authenticated user to the request for later middleware
  // and controllers to access.
  req.user = user;

  // Pass control to the next middleware or route controller.
  next();
};

// এই optionalAuth middleware-এর কাজ হলো token থাকলে user-কে authenticate করা, কিন্তু token না থাকলেও request চলতে দেওয়া।
// Allows requests with or without authentication.
export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    // Verify the token and retrieve the user.
    const user = await verifyAuthToken(token);

    // Attach the user to the request if the token is valid.
    if (user) {
      req.user = user;
    }
  }

  // Continue even if no valid token is provided.
  next();
};

// Checks whether the authenticated user has an allowed role.
// এই function-এর কাজ হলো user-এর role check করে সে নির্দিষ্ট API access করতে পারবে কি না, তা নির্ধারণ করা। 🔐
export const requireRole = async (
  roles: Array<"admin" | "merchant" | "customer">,
) => {
  // Returns middleware that checks the user's role.
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    // Deny access if the user is not authenticated
    // or their role is not in the allowed roles list.
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Forbidden: Access denied",
      });
      return;
    }

    // Allow the request to continue if the role is permitted.
    next();
  };
};
