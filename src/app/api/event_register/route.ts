import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  const body = await request.json();
  const { event_id } = body;

  const { user, session } = await validateRequest();

  if (
    !session ||
    session.type !== "Participant" ||
    !user.participant?.participant_id
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const registration_id = randomBytes(16).toString("hex").slice(0, 16);

  try {
    await prisma.$queryRaw`
      INSERT INTO registration (registration_id, participant_id, event_id, registration_date, type, registration_time, attendance_status)
      VALUES (${registration_id}, ${user.participant.participant_id}, ${event_id}, NOW(), 'Standard', NOW(), 'Absent')
    `;
    return NextResponse.json(
      { message: "Registration successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const { event_id } = body;

  const { user, session } = await validateRequest();

  if (
    !session ||
    session.type !== "Participant" ||
    !user.participant?.participant_id
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.$queryRaw`
      DELETE FROM registration
      WHERE participant_id = ${user.participant.participant_id} AND event_id = ${event_id}
    `;
    return NextResponse.json(
      { message: "Unregistration successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unregistration error:", error);
    return NextResponse.json({ error: "Unregistration failed" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const event_id = searchParams.get("event_id");

  if (!event_id) {
    return NextResponse.json({ error: "event_id is required" }, { status: 400 });
  }

  const { user, session } = await validateRequest();

  if (
    !session ||
    session.type !== "Participant" ||
    !user.participant?.participant_id
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result: { count: number }[] = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM registration
      WHERE participant_id = ${user.participant.participant_id} AND event_id = ${event_id}
    `;
    const isRegistered = result[0].count > 0;
    console.log(`Registration status for participant ${user.participant.participant_id} and event ${event_id}: ${isRegistered}`);
    return NextResponse.json({ registered: isRegistered }, { status: 200 });
  } catch (error) {
    console.error("Check registration error:", error);
    return NextResponse.json({ error: "Failed to check registration" }, { status: 500 });
  }
}
