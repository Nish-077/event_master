
"use server";

import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

export default async function submitNewEvent(values: any): Promise<{ error: string | null }> {
  try {
    const { title, date, time, budget, description, sessions, agendaItems } = values;
    
    const event_id = randomBytes(16).toString("hex").slice(0, 16);
    
    // Insert event
    await prisma.$queryRaw`
      INSERT INTO event (id, title, date, time, budget, description)
      VALUES (${event_id}, ${title}, ${date}, ${time}, ${budget}, ${description || null})
    `;

    // Insert sessions
    for (const session of sessions) {
      const session_id = randomBytes(16).toString("hex").slice(0, 16);
      const formattedStartTime = `${session.startTime}:00`;
      const formattedEndTime = `${session.endTime}:00`;
      await prisma.$queryRaw`
        INSERT INTO event_session (
          event_session_id, event_id, topic, building, room_no,
          start_time, end_time
        )
        VALUES (
          ${session_id}, ${event_id}, ${session.topic}, ${session.building},
          ${session.roomNo},
          ${formattedStartTime}, ${formattedEndTime}
        )
      `;
    }

    // Insert agenda items
    for (const item of agendaItems) {
      if (item.trim()) {
        const agenda_id = randomBytes(16).toString("hex").slice(0, 16);
        await prisma.$queryRaw`
          INSERT INTO event_agenda (agenda_id, event_id, item)
          VALUES (${agenda_id}, ${event_id}, ${item})
        `;
      }
    }

    return { error: null };
  } catch (error) {
    console.error("Failed to create event:", error);
    return { error: "Failed to create event. Please try again." };
  }
}

export async function submitFeedback(values: {
  registrationId: string;
  rating: number;
  comments: string;
}): Promise<{ error: string | null }> {
  try {
    const { registrationId, rating, comments } = values;
    const feedback_id = randomBytes(16).toString("hex").slice(0, 16);
    const feedback_date = new Date();

    await prisma.$queryRaw`
      INSERT INTO feedback (
        feedback_id, registration_id, feedback_date,
        rating, comments
      )
      VALUES (
        ${feedback_id}, ${registrationId}, ${feedback_date},
        ${rating}, ${comments}
      )
    `;

    return { error: null };
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return { error: "Failed to submit feedback. Please try again." };
  }
}