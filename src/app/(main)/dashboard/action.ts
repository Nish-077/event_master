"use server";

import prisma from "@/lib/prisma";

interface DashboardQueryResult {
  dashboard_id: string;
  feedback_score: number;
  demographics: object;
  attendance_count: number;
  event_id: string;
  event_title: string;
  event_date: Date;
  event_time: Date;
  event_description: string;
  total_attendees: number;
  average_rating: number | null;
}

interface DashboardDetailQueryResult extends DashboardQueryResult {
  title: string;
  date: Date;
  time: Date;
  budget: number;
  description: string;
}

interface UpdatedEventResult {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: Date;
  budget: number;
}

interface ParticipantQueryResult {
  participant_id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  type: string;
  registration_date: Date;
  attendance_status: string;
}

export async function getDashboardData() {
  try {
    const dashboards = await prisma.$queryRaw<DashboardQueryResult[]>`
      SELECT 
        d.dashboard_id,
        d.feedback_score,
        d.demographics,
        d.attendance_count,
        e.id as event_id,
        e.title as event_title,
        e.date as event_date,
        e.time as event_time,
        e.description as event_description,
        (
          SELECT COUNT(r.registration_id)
          FROM registration r
          WHERE r.event_id = e.id AND r.attendance_status = 'Attended'
        ) as total_attendees,
        (
          SELECT AVG(f.rating)
          FROM feedback f
          JOIN registration r ON f.registration_id = r.registration_id
          WHERE r.event_id = e.id
        ) as average_rating
      FROM dashboard d
      JOIN event e ON d.event_id = e.id
      ORDER BY e.date DESC
    `;

    const formattedDashboards = dashboards.map((d: any) => ({
      ...d,
      feedback_score: Number(d.feedback_score),
      demographics: d.demographics
        ? JSON.parse(d.demographics.toString())
        : null,
      event: {
        id: d.event_id,
        title: d.event_title,
        date: d.event_date,
        time: d.event_time,
        description: d.event_description,
      },
      total_attendees: Number(d.total_attendees),
      average_rating: d.average_rating ? Number(d.average_rating) : null,
    }));

    return { success: true, data: formattedDashboards };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return { success: false, error: "Failed to fetch dashboard data" };
  }
}

export async function getDashboardById(id: string) {
  try {
    const dashboard = await prisma.$queryRaw<DashboardDetailQueryResult[]>`
      SELECT 
        d.dashboard_id,
        d.feedback_score,
        d.demographics,
        d.attendance_count,
        e.id as event_id,
        e.title,
        e.date,
        e.time,
        e.budget,
        e.description,
        (
          SELECT COUNT(r.registration_id)
          FROM registration r
          WHERE r.event_id = e.id AND r.attendance_status = 'Attended'
        ) as total_attendees,
        (
          SELECT AVG(f.rating)
          FROM feedback f
          JOIN registration r ON f.registration_id = r.registration_id
          WHERE r.event_id = e.id
        ) as average_rating
      FROM dashboard d
      JOIN event e ON d.event_id = e.id
      WHERE d.dashboard_id = ${id}
    `;

    if (!dashboard || !dashboard[0]) {
      return { data: null, error: "Dashboard not found" };
    }

    const formattedDashboard = {
      ...dashboard[0],
      feedback_score: Number(dashboard[0].feedback_score),
      demographics: dashboard[0].demographics
        ? JSON.parse(dashboard[0].demographics.toString())
        : null,
      event: {
        id: dashboard[0].event_id,
        title: dashboard[0].title,
        date: dashboard[0].date.toISOString(),
        time: dashboard[0].time.toISOString(),
        budget: dashboard[0].budget,
        description: dashboard[0].description,
      },
      total_attendees: Number(dashboard[0].total_attendees),
      average_rating: dashboard[0].average_rating
        ? Number(dashboard[0].average_rating)
        : null,
    };

    return { data: formattedDashboard, error: null };
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return { data: null, error: "Failed to fetch dashboard" };
  }
}

export async function updateEventDetails(eventId: string, eventData: any) {
  try {
    await prisma.$executeRaw`
      UPDATE event 
      SET 
        title = ${eventData.title},
        description = ${eventData.description},
        date = ${new Date(eventData.date)},
        time = ${new Date(eventData.time)},
        budget = ${eventData.budget}
      WHERE id = ${eventId}
    `;

    const updatedEvent = await prisma.$queryRaw<UpdatedEventResult[]>`
      SELECT id, title, description, date, time, budget
      FROM event
      WHERE id = ${eventId}
    `;

    return { data: updatedEvent[0], error: null };
  } catch (error) {
    console.error("Error updating event:", error);
    return { data: null, error: "Failed to update event" };
  }
}

export async function getEventParticipants(eventId: string) {
  try {
    const participants = await prisma.registration.findMany({
      where: {
        event_id: eventId,
      },
      select: {
        participant: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            participant_phone_no: {
              select: {
                phone_number: true,
              },
            },
          },
        },
        registration_date: true,
        attendance_status: true,
        type: true,
      },
    });

    return {
      data: participants.map((p) => ({
        name: `${p.participant?.first_name} ${p.participant?.last_name || ''}`,
        email: p.participant?.email,
        phone: p.participant?.participant_phone_no[0]?.phone_number,
        registration_date: p.registration_date,
        attendance_status: p.attendance_status,
        registration_type: p.type,
      })),
    };
  } catch (error) {
    return { error };
  }
}
