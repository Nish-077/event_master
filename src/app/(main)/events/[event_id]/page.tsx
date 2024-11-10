import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Calendar,
  Clock,
  FileText,
  ArrowLeft,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatRelativeDate, formatTime } from "@/lib/utils";
import { notFound } from "next/navigation";

interface PageProps {
  params: { event_id: string };
}

export default async function EventDetailsPage({ params }: PageProps) {

  const { event_id } = await params;

  const event = await prisma.event.findFirst({
    where: {
      id: event_id,
    },
  });

  if (!event) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-200 p-8">
      <Link href="/events">
        <Button variant="ghost" className="mb-6 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
        <Badge  variant="secondary">Event ID: {event.id}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="font-semibold">
                      {formatRelativeDate(event.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Time</p>
                    <p className="font-semibold">{formatTime(event.time)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Description
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {event.description}
                </p>
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" />   Budget
                </h2>
                <p className="text-gray-600 font-medium">
                  {event.budget?.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Agenda</CardTitle>
            <CardDescription>Schedule of activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {event.agenda?.split("\n").map((item, index) => (
                <div key={index} className="py-2 border-b last:border-0">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
