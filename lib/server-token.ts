import { getToken } from 'next-auth/jwt'

/**
 * Reads the SIMPUS access token stashed inside the signed NextAuth JWT.
 * Server-side only: route handlers call this to attach an Authorization
 * header on upstream backend calls. The browser never sees this value —
 * the public session endpoint exposes profile fields only (see lib/auth.ts).
 */
export async function getBackendToken(req: Request): Promise<string | null> {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    return typeof token?.accessToken === 'string' ? token.accessToken : null
  } catch {
    // Malformed/expired cookie — treat exactly like "no token".
    return null
  }
}
