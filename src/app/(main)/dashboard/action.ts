"use server";

import prisma from "@/lib/prisma";

interface DashboardQueryResult {
  dashboard_id: string;
  demographics: object;
  attended_count: number;
  event_id: string;
  event_title: string;
  event_date: Date;
  event_time: Date;
  event_description: string;
  total_registrants: number;
  average_rating: number | null;
}

interface DashboardDetailQueryResult extends DashboardQueryResult {
  title: string;
  date: Date;
  time: Date;
  budget: number;
  description: string;
  sessions: SessionQueryResult[];
  total_registrants: number;
  attendance_count: number;
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

interface Speaker {
  speaker_id: string;
  name: string;
}

export async function getAllSpeakers() {
  try {
    const speakers = await prisma.$queryRaw<Speaker[]>`
      SELECT 
        speaker_id,
        CONCAT(first_name, ' ', COALESCE(last_name, '')) as name
      FROM speaker
      ORDER BY first_name, last_name
    `;
    return { data: speakers, error: null };
  } catch (error) {
    console.error("Error fetching speakers:", error);
    return { data: null, error: "Failed to fetch speakers" };
  }
}

export async function updateEventSession(eventId: string, sessions: any[]) {
  try {
    // First, get all existing sessions for this event
    const existingSessions = await prisma.$queryRaw<{ event_session_id: string }[]>`
      SELECT event_session_id
      FROM event_session
      WHERE event_id = ${eventId}
    `;

    // Delete sessions that are no longer in the updated list
    const updatedSessionIds = sessions.map(s => s.session_id).filter(id => !id.startsWith('new-'));
    const deletedSessionIds = existingSessions
      .map(s => s.event_session_id)
      .filter(id => !updatedSessionIds.includes(id));

    for (const sessionId of deletedSessionIds) {
      await prisma.$executeRaw`
        DELETE FROM event_session 
        WHERE event_session_id = ${sessionId} 
        AND event_id = ${eventId}
      `;
    }

    // Update or create sessions
    for (const session of sessions) {
      if (session.session_id.startsWith('new-')) {
        // Create new session
        const [newSession] = await prisma.$queryRaw<[{ event_session_id: string }]>`
          INSERT INTO event_session (
            event_session_id, event_id, topic, 
            start_time, end_time, building, room_no
          )
          VALUES (
            UUID(), ${eventId}, ${session.title},
            ${new Date(session.start_time)}, ${new Date(session.end_time)},
            ${session.location.split(' - ')[0]}, ${session.location.split(' - ')[1]}
          )
          RETURNING event_session_id
        `;

        // Insert speaker assignment if speaker is selected
        if (session.speaker_id) {
          await prisma.$executeRaw`
            INSERT INTO speaker_for_session (speaker_id, session_id, event_id)
            VALUES (${session.speaker_id}, ${newSession.event_session_id}, ${eventId})
          `;
        }
      } else {
        // Update existing session
        await prisma.$executeRaw`
          UPDATE event_session 
          SET 
            topic = ${session.title},
            start_time = ${new Date(session.start_time)},
            end_time = ${new Date(session.end_time)},
            building = ${session.location.split(' - ')[0]},
            room_no = ${session.location.split(' - ')[1]}
          WHERE event_session_id = ${session.session_id}
          AND event_id = ${eventId}
        `;

        // Update speaker assignment
        await prisma.$executeRaw`
          DELETE FROM speaker_for_session 
          WHERE session_id = ${session.session_id}
          AND event_id = ${eventId}
        `;

        if (session.speaker_id) {
          await prisma.$executeRaw`
            INSERT INTO speaker_for_session (speaker_id, session_id, event_id)
            VALUES (${session.speaker_id}, ${session.session_id}, ${eventId})
          `;
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating sessions:", error);
    return { error: "Failed to update sessions" };
  }
}

export async function getDashboardData() {
  try {
    const dashboards = await prisma.$queryRaw<DashboardQueryResult[]>`
      SELECT 
        e.id AS event_id,
        e.title AS event_title,
        e.date AS event_date,
        e.time AS event_time,
        e.description as event_description,
        COUNT(DISTINCT r.participant_id) AS total_registrants,
        d.attendance_count AS attended_count,
        (
          SELECT AVG(f.rating)
          FROM feedback f
          JOIN registration r ON f.registration_id = r.registration_id
          WHERE r.event_id = e.id
        ) as average_rating,
        d.dashboard_id
      FROM 
        event e
      LEFT JOIN 
        registration r ON e.id = r.event_id
      LEFT JOIN
        dashboard d ON e.id = d.event_id
      GROUP BY 
        e.id, e.title, e.date, e.time, e.description, d.dashboard_id, d.attendance_count
      ORDER BY 
        e.date ASC, e.time ASC
    `;

    // Fetch demographics separately for each dashboard
    const formattedDashboards = await Promise.all(
      dashboards.map(async (d: any) => {
        const demographics = await prisma.$queryRaw`
        SELECT category, value, count
        FROM demographic_data
        WHERE dashboard_id = ${d.dashboard_id}
      `;

        return {
          ...d,
          demographics: demographics,
          event: {
            id: d.event_id,
            title: d.event_title,
            date: d.event_date,
            time: d.event_time,
            description: d.event_description,
          },
          total_registrants: Number(d.total_registrants),
          attended_count: Number(d.attended_count),
          average_rating: d.average_rating ? Number(d.average_rating) : null,
        };
      })
    );

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
        e.id as event_id,
        e.title,
        e.date,
        e.time,
        e.budget,
        e.description,
        get_total_registrants(e.id) as total_registrants,
        (
          SELECT COUNT(r.registration_id)
          FROM registration r
          WHERE r.event_id = e.id AND r.attendance_status = 'Attended'
        ) as attendance_count,
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
      demographics: demographics,
      event: {
        id: dashboard[0].event_id,
        title: dashboard[0].title,
        date: dashboard[0].date.toISOString(),
        time: dashboard[0].time.toISOString(),
        budget: dashboard[0].budget,
        description: dashboard[0].description,
        sessions: sessions.map((s) => ({
          ...s,
          start_time: s.start_time.toISOString(),
          end_time: s.end_time.toISOString(),
        })),
      },
      attended_count: Number(dashboard[0].attendance_count) || 0,
      average_rating: dashboard[0].average_rating
        ? Number(dashboard[0].average_rating)
        : null,
      total_registrants: Number(dashboard[0].total_registrants),
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
    const participants = await prisma.$queryRaw<
      {
        first_name: string;
        last_name: string;
        email: string;
        phone_number: string;
        registration_date: Date;
        attendance_status: string;
        type: string;
      }[]
    >`
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
        name: `${p.first_name} ${p.last_name || ""}`,
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

export async function getAverageFeedback(eventId: string) {
  try {
    const [result] = await prisma.$queryRaw<[{ average: number }]>`
      SELECT get_average_feedback(${eventId}) as average
    `;
    return { data: result.average, error: null };
  } catch (error) {
    console.error("Error getting average feedback:", error);
    return { data: null, error: "Failed to get average feedback" };
  }
}