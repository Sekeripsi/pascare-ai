import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3003'

export const { handlers, auth, signIn, signOut } = NextAuth({
  // 24h parity with the hand-rolled cookie this replaces.
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 },
  trustHost: true,
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (credentials) => {
        const username =
          typeof credentials?.username === 'string' ? credentials.username : ''
        const password =
          typeof credentials?.password === 'string' ? credentials.password : ''
        if (!username || !password) return null

        const res = await fetch(`${BACKEND_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        })

        if (!res.ok) return null

        const data = await res.json()
        if (!data?.token || !data?.user?.id) return null

        // accessToken rides inside the encrypted JWT only — it is deliberately
        // NOT copied into the session below, so the browser can never read it.
        return {
          id: String(data.user.id),
          name: data.user.name,
          username: data.user.username,
          role: data.user.role,
          accessToken: data.token,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Runs on sign-in (user present) and on every subsequent request.
      if (user) {
        token.accessToken = user.accessToken
        token.id = user.id
        token.username = user.username
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      // Profile fields only. Keeping accessToken out of here is what makes the
      // token server-only; server routes read it via getBackendToken() instead.
      session.user.id = token.id as string
      session.user.username = token.username as string
      session.user.role = token.role as 'ADMIN' | 'DOCTOR' | 'STAFF'
      return session
    },
    // Access policy for everything the proxy matcher covers (/dashboard,
    // /api/tokens*). Reference implementation below — adjust the policy to taste:
    // e.g. role-based branches (`auth?.user.role !== 'ADMIN' → 403`) or gating
    // /api/chat for staff contexts belong here if you ever want them.
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl

      // Any valid session may pass everywhere the matcher covers.
      if (auth) return true

      // API callers get a machine-readable rejection instead of a redirect…
      if (pathname.startsWith('/api')) {
        return Response.json(
          { success: false, message: 'Unauthenticated' },
          { status: 401 }
        )
      }

      // …while page requests are sent to the login screen, preserving the
      // deep link so the post-login router.push() lands where the user meant.
      const loginUrl = new URL('/login', request.nextUrl.origin)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    },
  },
})
