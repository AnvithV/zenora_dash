import type { NextAuthConfig } from 'next-auth'
import type { UserRole } from '@prisma/client'

/**
 * Lightweight auth config for middleware (no Prisma/bcrypt imports).
 * Full auth config with providers is in auth.ts.
 */
export const authConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  providers: [], // Providers are added in auth.ts
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!
        token.role = user.role
        token.organizationId = user.organizationId ?? null
      }
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name
        if (session.role) token.role = session.role
        if (session.organizationId !== undefined) token.organizationId = session.organizationId
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as UserRole
      session.user.organizationId = (token.organizationId as string) ?? null
      return session
    },
  },
} satisfies NextAuthConfig
