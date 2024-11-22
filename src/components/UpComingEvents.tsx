import { Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import prisma from "@/lib/prisma";
import { formatRelativeDate, formatTime } from "@/lib/utils";
import Link from "next/link";
import { validateRequest } from "@/auth";
import { isSpeakerAssignedToEvent } from "@/lib/utils";
import { Badge } from "./ui/badge";

async function EventsList() {
  const { user, session } = await validateRequest();
  const events = await prisma.$queryRaw<
    {
      id: string;
      title: string;
      date: object;
      time: object;
      agenda: string;
    }[]
  >`
    SELECT e.id, e.title, e.date, e.time,
           (SELECT ea.item FROM event_agenda ea WHERE ea.event_id = e.id ORDER BY ea.agenda_id ASC LIMIT 1) as agenda
    FROM event e
    WHERE (e.date = CURDATE() AND e.time > CURTIME())
    OR (e.date > CURDATE())
    ORDER BY e.date ASC, e.time ASC;
  `;

  const eventsWithAssignments = await Promise.all(
    events.map(async (event) => ({
      ...event,
      isAssigned:
        session?.type === "Speaker" && user?.speaker?.speaker_id
          ? await isSpeakerAssignedToEvent(user.speaker.speaker_id, event.id)
          : false,
    }))
  );

  return (
    <div className="space-y-4">
      {eventsWithAssignments.map((event, index) => (
        <div
          key={index}
          className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-0"
        >
          <div className="flex-1">
            <Link href={`/events/${event.id}`}>
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{event.title}</h3>
                {event.isAssigned && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    You're Speaking
                  </Badge>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-600">
                On {formatRelativeDate(event.date as Date)} at{" "}
                {formatTime(event.time as Date)}
              </p>
            </Link>
            <p className="text-sm text-gray-600">{event.agenda}</p>
          </div>
          <Link href={`/events/${event.id}`}>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        </div>
      ))}
    </div>
  );
}

export default function UpComingEvents() {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EventsList />
      </CardContent>
    </Card>
  );
}
