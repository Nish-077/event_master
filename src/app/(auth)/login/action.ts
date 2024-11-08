"use server";

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import { logInSchema, LogInValues } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(
  credentials: LogInValues
): Promise<{ error: string }> {
  try {
    const { email, type, password } = logInSchema.parse(credentials);

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (!existingUser) {
      return { error: "Invalid email or password" };
    }

    const inputHash = await hash(password);
    const inputHashTrimmed = Buffer.from(inputHash)
      .toString("base64")
      .replace(/[/+=]/g, "")
      .substring(0, 32);

    const validPassword = inputHashTrimmed === existingUser.password;

    if (!validPassword) {
      return {
        error: "Invalid email or password",
      };
    }

    if (
      (type === "Participant" && !existingUser.participant_id) ||
      (type === "Organiser" && !existingUser.organiser_id) ||
      (type === "Speaker" && !existingUser.speaker_id)
    ) {
      return {
        error: `${email} is not registered as a ${type}`,
      };
    }

    const session = await lucia.createSession(existingUser.id, {});

    const sessionCookie = lucia.createSessionCookie(session.id);

    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    redirect("/");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error(error);

    return {
      error: "Something went wrong! Please try again",
    };
  }
}
