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
  sessions: SessionQueryResult[];
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

interface FeedbackQueryResult {
  feedback_id: string;
  feedback_date: Date;
  rating: number;
  comments: string;
  participant_name: string;
  participant_email: string;
}

interface SessionQueryResult {
  session_id: string;
  title: string;
  start_time: Date;
  end_time: Date;
  speaker: string;
  location: string;
}

export async function getDashboardData() {
  try {
    const dashboards = await prisma.$queryRaw<DashboardQueryResult[]>`
      SELECT 
        d.dashboard_id,
        d.feedback_score,
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

    // Fetch demographics separately for each dashboard
    const formattedDashboards = await Promise.all(dashboards.map(async (d: any) => {
      const demographics = await prisma.$queryRaw`
        SELECT category, value, count
        FROM demographic_data
        WHERE dashboard_id = ${d.dashboard_id}
      `;

      return {
        ...d,
        feedback_score: Number(d.feedback_score),
        demographics: demographics,
        event: {
          id: d.event_id,
          title: d.event_title,
          date: d.event_date,
          time: d.event_time,
          description: d.event_description,
        },
        total_attendees: Number(d.total_attendees),
        average_rating: d.average_rating ? Number(d.average_rating) : null,
      };
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

    // Fetch demographics data separately
    const demographics = await prisma.$queryRaw`
      SELECT category, value, count
      FROM demographic_data
      WHERE dashboard_id = ${id}
    `;

    // Update session query to match the schema
    const sessions = await prisma.$queryRaw<SessionQueryResult[]>`
      SELECT 
        es.event_session_id as session_id,
        es.topic as title,
        es.start_time,
        es.end_time,
        COALESCE(
          (SELECT GROUP_CONCAT(s.first_name, ' ', COALESCE(s.last_name, ''))
           FROM speaker_for_session sfs
           JOIN speaker s ON sfs.speaker_id = s.speaker_id
           WHERE sfs.session_id = es.event_session_id
           AND sfs.event_id = es.event_id),
          'TBA'
        ) as speaker,
        CONCAT(es.building, ' - ', es.room_no) as location
      FROM event_session es
      WHERE es.event_id = ${dashboard[0].event_id}
      ORDER BY es.start_time ASC
    `;

    const formattedDashboard = {
      ...dashboard[0],
      feedback_score: Number(dashboard[0].feedback_score),
      demographics: demographics,
      event: {
        id: dashboard[0].event_id,
        title: dashboard[0].title,
        date: dashboard[0].date.toISOString(),
        time: dashboard[0].time.toISOString(),
        budget: dashboard[0].budget,
        description: dashboard[0].description,
        sessions: sessions.map(s => ({
          ...s,
          start_time: s.start_time.toISOString(),
          end_time: s.end_time.toISOString()
        }))
      },
      total_attendees: Number(dashboard[0].total_attendees),
      average_rating: dashboard[0].average_rating
        ? Number(dashboard[0].average_rating)
        : null
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

export async function updateSession(sessionId: string, sessionData: any) {
  try {
    await prisma.$executeRaw`
      UPDATE session 
      SET 
        title = ${sessionData.title},
        start_time = ${new Date(sessionData.start_time)},
        end_time = ${new Date(sessionData.end_time)},
        speaker = ${sessionData.speaker},
        location = ${sessionData.location}
      WHERE session_id = ${sessionId}
    `;

    const updatedSession = await prisma.$queryRaw<SessionQueryResult[]>`
      SELECT session_id, title, start_time, end_time, speaker, location
      FROM session
      WHERE session_id = ${sessionId}
    `;

    return { data: updatedSession[0], error: null };
  } catch (error) {
    console.error("Error updating session:", error);
    return { data: null, error: "Failed to update session" };
  }
}

export async function getEventParticipants(eventId: string) {
  try {
    const participants = await prisma.$queryRaw<{
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string;
      registration_date: Date;
      attendance_status: string;
      type: string;
    }[]>`
      SELECT 
        p.first_name,
        p.last_name,
        p.email,
        pph.phone_number,
        r.registration_date,
        r.attendance_status,
        r.type
      FROM registration r
      JOIN participant p ON r.participant_id = p.participant_id
      LEFT JOIN participant_phone_no pph ON p.participant_id = pph.participant_id
      WHERE r.event_id = ${eventId}
      ORDER BY r.registration_date DESC
    `;

    return {
      data: participants.map((p) => ({
        name: `${p.first_name} ${p.last_name || ''}`,
        email: p.email,
        phone: p.phone_number,
        registration_date: p.registration_date,
        attendance_status: p.attendance_status,
        registration_type: p.type,
      })),
    };
  } catch (error) {
    console.error("Error fetching participants:", error);
    return { error: "Failed to fetch participants" };
  }
}

export async function getEventFeedback(eventId: string) {
  try {
    const feedbacks = await prisma.$queryRaw<FeedbackQueryResult[]>`
      SELECT 
        f.feedback_id,
        f.feedback_date,
        f.rating,
        f.comments,
        CONCAT(p.first_name, ' ', COALESCE(p.last_name, '')) as participant_name,
        p.email as participant_email
      FROM feedback f
      JOIN registration r ON f.registration_id = r.registration_id
      JOIN participant p ON r.participant_id = p.participant_id
      WHERE r.event_id = ${eventId}
      ORDER BY f.feedback_date DESC
    `;

    return { data: feedbacks, error: null };
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return { data: null, error: "Failed to fetch feedback" };
  }
}
