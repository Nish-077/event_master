import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import prisma from "./lib/prisma";
import { Lucia, Session, User } from "lucia";
import { cache } from "react";
import { cookies } from "next/headers";
import { user_type } from "@prisma/client";

const adapter = new PrismaAdapter(prisma.user_session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "event_master_session",
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes(databaseUserAttributes) {
    return {
      id: databaseUserAttributes.id,
      created_at: databaseUserAttributes.created_at,
      type: databaseUserAttributes.type,
    };
  },
});

interface DatabaseUserAttributes {
  id: string;
  created_at: Date;
  type: user_type;
}

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId =
      (await cookies()).get(lucia.sessionCookieName)?.value ?? null;

    // console.log("cookie found", sessionId);
    // console.log("sessionCookieName", lucia.sessionCookieName);

    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const result = await lucia.validateSession(sessionId);

    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        // console.log("Created session cookie:", sessionCookie);
        (await cookies()).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        // console.log("Created blank session cookie:", sessionCookie);
        (await cookies()).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch (error) {
      console.error("Error setting session cookie:", error);
    }

    return result;
  }
);
