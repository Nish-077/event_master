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
): Promise<{ error: string }> {
  try {
    const { email, firstName, lastName, type, password } =
      signUpSchema.parse(credentials);

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      if (
        (type === "Participant" && existingUser.participant_id) ||
        (type === "Organiser" && existingUser.organiser_id) ||
        (type === "Speaker" && existingUser.speaker_id)
      ) {
        return {
          error: `User of type ${type} for email ${email} already exists`,
        };
      }
    }

    let userId = null;
    if (existingUser) {
      userId = existingUser.id;
    } else {
      userId = generateIdFromEntropySize(10);
    }

    const userTypeId = generateIdFromEntropySize(10);

    if (!existingUser) {
      const rawHash = await hash(password);
      const passwordHash = Buffer.from(rawHash)
        .toString("base64")
        .replace(/[/+=]/g, "")
        .substring(0, 32);

      await prisma.$transaction(async (tx) => {
        switch (type) {
          case "Participant":
            await tx.participant.create({
              data: {
                participant_id: userTypeId,
                first_name: firstName,
                last_name: lastName,
                email,
                type: "Student",
              },
            });

            await tx.user.create({
              data: {
                id: userId,
                participant_id: userTypeId,
                email,
                password: passwordHash,
              },
            });
            break;

          case "Organiser":
            await tx.organiser.create({
              data: {
                organiser_id: userTypeId,
                first_name: firstName,
                last_name: lastName,
                email,
                role: "General",
              },
            });

            await tx.user.create({
              data: {
                id: userId,
                organiser_id: userTypeId,
                email,
                password: passwordHash,
              },
            });
            break;

          case "Speaker":
            await tx.speaker.create({
              data: {
                speaker_id: userTypeId,
                first_name: firstName,
                last_name: lastName,
                email,
              },
            });

            await tx.user.create({
              data: {
                id: userId,
                speaker_id: userTypeId,
                email,
                password: passwordHash,
              },
            });
            break;
        }
      });
    } else {
      await prisma.$transaction(async (tx) => {
        switch (type) {
          case "Participant":
            await tx.user.update({
              where: { id: userId },
              data: { participant_id: userTypeId },
            });

            await tx.participant.create({
              data: {
                participant_id: userTypeId,
                first_name: firstName,
                last_name: lastName,
                email,
                type: "Student",
              },
            });
            break;

          case "Organiser":
            await tx.user.update({
              where: { id: userId },
              data: { organiser_id: userTypeId },
            });

            await tx.organiser.create({
              data: {
                organiser_id: userTypeId,
                first_name: firstName,
                last_name: lastName,
                email,
                role: "General",
              },
            });
            break;

          case "Speaker":
            await tx.user.update({
              where: { id: userId },
              data: { speaker_id: userTypeId },
            });

            await tx.speaker.create({
              data: {
                speaker_id: userTypeId,
                first_name: firstName,
                last_name: lastName,
                email,
              },
            });
            break;
        }
      });
    }

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
