"use server";

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signup(
  credentials: SignUpValues
): Promise<{ error?: string }> {
  try {
    const { email, userName, type, password } = signUpSchema.parse(credentials);

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return {
        error: `User of type ${type} for email ${email} already exists`,
      };
    }

    const rawHash = await hash(password);
    const passwordHash = Buffer.from(rawHash)
      .toString("base64")
      .replace(/[/+=]/g, "")
      .substring(0, 32);

    const userId = generateIdFromEntropySize(10);

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          email,
          password: passwordHash,
        },
      });

      switch (type) {
        case "Participant":
          await tx.participant.create({
            data: {
              participant_id: userId,
              first_name: userName,
              email,
              type: "Student",
            },
          });
          break;
        case "Organiser":
          await tx.organiser.create({
            data: {
              organiser_id: userId,
              first_name: userName,
              email,
              role: "General",
            },
          });
          break;
        case "Speaker":
          await tx.speaker.create({
            data: {
              speaker_id: userId,
              first_name: userName,
              email,
            },
          });
          break;
      }
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return redirect("/");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Signup error:", error);
    return { error: "Something went wrong! Please try again." };
  }
}
