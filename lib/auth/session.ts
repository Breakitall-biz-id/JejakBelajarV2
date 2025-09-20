import { headers } from "next/headers"
import { cache } from "react"
import { eq } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { db } from "@/db"
import { user } from "@/db/schema/auth"
import type { UserRole } from "@/db/schema/auth"

export type CurrentUser = {
  id: string
  email: string
  name: string | null
  image: string | null
  role: UserRole
}

export type ServerAuthSession = {
  session: {
    id: string
    token: string
    userId: string
    expiresAt: string
  }
  user: CurrentUser
}

export class AuthError extends Error {}
export class UnauthorizedError extends AuthError {
  constructor(message = "User is not authenticated.") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends AuthError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message)
    this.name = "ForbiddenError"
  }
}

const getRequestHeaders = () => {
  return (async () => {
    const headerStore = await headers();
    const requestHeaders = new Headers();
    headerStore.forEach((value, key) => {
      requestHeaders.append(key, value);
    });
    return requestHeaders;
  })();
}

const fetchServerSession = cache(async (): Promise<ServerAuthSession | null> => {
  const result = await auth.api.getSession({
    headers: await getRequestHeaders(),
  })

  if (!result) {
    return null
  }

  const baseUser = {
    id: result.user.id,
    email: result.user.email,
    name: result.user.name ?? null,
    image: result.user.image ?? null,
  }

  let role = (result.user as { role?: UserRole }).role

  if (!role) {
    const dbUser = await db
      .select({
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      })
      .from(user)
      .where(eq(user.id, result.user.id))
      .limit(1)

    if (!dbUser.length) {
      return null
    }

    const [record] = dbUser
    role = record.role

    return {
      session: {
        id: result.session.id,
        token: result.session.token,
        userId: result.session.userId,
        expiresAt: result.session.expiresAt.toISOString(),
      },
      user: {
        id: record.id,
        email: record.email,
        name: record.name,
        image: record.image,
        role: record.role,
      },
    }
  }

  return {
    session: {
      id: result.session.id,
      token: result.session.token,
      userId: result.session.userId,
      expiresAt: result.session.expiresAt.toISOString(),
    },
    user: {
      ...baseUser,
      role,
    },
  }
})

export async function getServerAuthSession(): Promise<ServerAuthSession | null> {
  return fetchServerSession()
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getServerAuthSession()
  return session?.user ?? null
}

export async function requireAuthenticatedUser(): Promise<ServerAuthSession> {
  const session = await getServerAuthSession()

  if (!session) {
    throw new UnauthorizedError()
  }

  return session
}

export async function requireAdminUser(): Promise<ServerAuthSession> {
  const session = await requireAuthenticatedUser()

  if (session.user.role !== "ADMIN") {
    throw new ForbiddenError()
  }

  return session
}

const assertRole = async (
  role: UserRole,
): Promise<ServerAuthSession> => {
  const session = await requireAuthenticatedUser()

  if (session.user.role !== role) {
    throw new ForbiddenError()
  }

  return session
}

export async function requireTeacherUser(): Promise<ServerAuthSession> {
  return assertRole("TEACHER")
}

export async function requireStudentUser(): Promise<ServerAuthSession> {
  return assertRole("STUDENT")
}

export function resolveDashboardPath(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin"
    case "TEACHER":
      return "/dashboard/teacher"
    case "STUDENT":
      return "/dashboard/student"
    default:
      return "/dashboard"
  }
}
