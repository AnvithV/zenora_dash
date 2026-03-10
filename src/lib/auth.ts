import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import type { UserRole } from '@prisma/client'
import { authConfig } from '@/lib/auth.config'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      image: string | null
      role: UserRole
      organizationId: string | null
    }
  }

  interface User {
    role: UserRole
    organizationId?: string | null
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            memberships: {
              take: 1,
              orderBy: { joinedAt: 'desc' },
            },
          },
        })

        if (!user || !user.password) return null
        if (user.status !== 'ACTIVE') return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          organizationId: user.memberships[0]?.organizationId ?? null,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
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
      session.user.organizationId = token.organizationId as string | null
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { memberships: { take: 1 } },
        })
        if (dbUser) {
          // Ensure role and status are set
          if (!dbUser.role || dbUser.role === 'TENANT') {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { role: 'TENANT', status: 'ACTIVE' },
            })
          }
          // Ensure organization membership exists
          if (dbUser.memberships.length === 0) {
            let org = await prisma.organization.findFirst({ where: { slug: 'default' } })
            if (!org) {
              org = await prisma.organization.create({
                data: { name: 'Default Organization', slug: 'default' },
              })
            }
            await prisma.organizationMembership.create({
              data: {
                userId: dbUser.id,
                organizationId: org.id,
                role: 'TENANT',
              },
            })
          }
        }
      }
      return true
    },
  },
})
