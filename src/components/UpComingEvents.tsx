import { Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import prisma from "@/lib/prisma";
import { formatRelativeDate, formatTime } from "@/lib/utils";

async function EventsList() {
  const events = await prisma.$queryRaw<
    {
      title: string;
      date: object;
      time: object;
      agenda: string;
    }[]
  >`
    SELECT title, date, time, agenda FROM Event
    WHERE (date = CURDATE() AND time > CURTIME())
    OR (date > CURDATE())
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
            <h3 className="font-bold">{event.title}</h3>
            <p className="text-sm font-semibold text-gray-600">
              On{" "} {formatRelativeDate(event.date as Date)} at{" "}
              {formatTime(event.time as Date)}
            </p>
            <p className="text-sm text-gray-600">{event.agenda}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      ))}
    </div>
  );
}

export default function UpComingEvents() {
  return (
    <Card>
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
