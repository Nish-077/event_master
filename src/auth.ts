import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import prisma from "./lib/prisma";
import { Lucia, Session, User } from "lucia";
import { cache } from "react";
import { cookies } from "next/headers";
import { UserData, UserTypeData } from "./lib/type";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

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
      email: databaseUserAttributes.email,
      participant_id: databaseUserAttributes.participant_id,
      organiser_id: databaseUserAttributes.organiser_id,
      speaker_id: databaseUserAttributes.speaker_id,
    };
  },
  getSessionAttributes(databaseSessionAttributes) {
    return {
      type: databaseSessionAttributes.type,
    };
  },
});

interface DatabaseUserAttributes {
  id: string;
  created_at: Date;
  email: string;
  participant_id?: string;
  organiser_id?: string;
  speaker_id?: string;
}

interface DatabaseSessionAttributes {
  type: string;
}

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
  }
}

async function enrichUserWithTypeData(
  user: DatabaseUserAttributes
): Promise<UserData> {
  const userTypesData: UserTypeData = {};

  if (user.participant_id) {
    const participant = await prisma.participant.findUnique({
      where: { participant_id: user.participant_id },
    });
    if (participant) userTypesData.participant = participant;
  }

  if (user.organiser_id) {
    const organiser = await prisma.organiser.findUnique({
      where: { organiser_id: user.organiser_id },
    });
    if (organiser) userTypesData.organiser = organiser;
  }

  if (user.speaker_id) {
    const speaker = await prisma.speaker.findUnique({
      where: { speaker_id: user.speaker_id },
    });
    if (speaker) userTypesData.speaker = speaker;
  }

  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    ...userTypesData,
  };
}

export const validateRequest = cache(
  async (): Promise<
    { user: UserData; session: Session } | { user: null; session: null }
  > => {
    const sessionId =
      (await cookies()).get(lucia.sessionCookieName)?.value ?? null;

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
        (await cookies()).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        (await cookies()).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch (error) {
      console.error("Error setting session cookie:", error);
    }

    if (result.user) {
      const enrichedUser = await enrichUserWithTypeData(result.user);
      return {
        user: enrichedUser,
        session: result.session,
      };
    }

    return result as { user: null; session: null };
  }
);
