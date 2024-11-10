import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { formatRelativeDate, formatTime } from "@/lib/utils";
import { Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

async function EventsList() {
  const events = await prisma.$queryRaw<
    {
      id: string;
      title: string;
      date: object;
      time: object;
      agenda: string;
    }[]
  >`
      SELECT id, title, date, time, agenda FROM Event
      ORDER BY date ASC, time ASC;
    `;

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div
          key={index}
          className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-0"
        >
          <div className="flex-1">
            <Link href={`/events/${event.id}`}>
              <h3 className="font-bold">{event.title}</h3>
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

export default function AllEvents() {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          All Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EventsList />
      </CardContent>
    </Card>
  );
}
