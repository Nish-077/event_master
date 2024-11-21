
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const { event_id } = body;

  const { user, session } = await validateRequest();

  if (!session || session.type !== "Participant" || !user.participant?.participant_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.$queryRaw`
      INSERT INTO registration (registration_id, participant_id, event_id, registration_date, type, registration_time, attendance_status)
      VALUES (UUID(), ${user.participant.participant_id}, ${event_id}, NOW(), 'Standard', NOW(), 'Absent')
    `;
    return NextResponse.json({ message: "Registration successful" }, { status: 200 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}