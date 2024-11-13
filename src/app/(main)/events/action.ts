"use server";

import prisma from "@/lib/prisma";
import { NewEventValues } from "@/lib/validation";
import { randomBytes } from "crypto";
import { generateIdFromEntropySize } from "lucia";

export default async function submitNewEvent(
  values: NewEventValues
): Promise<{ error: string | null }> {
  try {
    const { title, date, time, agenda, budget, description } = values;

    const eventDateTime = new Date(`${date}T${time}`);
    const currentDateTime = new Date();

    if (eventDateTime < currentDateTime) {
      return { error: "Event date must be in the future" };
    }

    const event_id = randomBytes(16).toString("hex").slice(0, 16);
    await prisma.$queryRaw`
      INSERT INTO event
        (id, title, date, time, agenda, budget, description)
      VALUES (${event_id}, ${title}, ${date}, ${time}, ${agenda || null}, ${budget || null}, ${description || null})
    `;

    return { error: null };
  } catch (error) {
    console.error("Failed to create event:", error);
    return { error: "Failed to create event. Please try again." };
  }
}
