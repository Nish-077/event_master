import React, { useState } from "react"; // Import useState
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
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatRelativeDate, formatTime } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { validateRequest } from "@/auth";
import RegisterEvent from "./RegisterEvent";
import { Badge } from "@/components/ui/badge";
import { FeedbackDialog } from "@/components/FeedbackDialog";

interface PageProps {
  params: { event_id: string };
}

interface RegistrationResult {
  registration_id: number;
  participant_id: number;
  event_id: number;
  attendance_status: string;
  registration_time: Date;
}

export default async function EventDetailsPage({ params }: PageProps) {
  const { event_id } = await params;

  const event_details = await prisma.$queryRaw<
    Array<{
      title: string;
      date: Date;
      time: Date;
      budget?: number;
      description: string;
      sessions: object[];
      agendas: object[];
    }>
  >`
    SELECT
      e.title, e.date, e.time, e.budget, e.description,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'topic', s.topic,
          'building', s.building,
          'room_no', s.room_no,
          'start_time', s.start_time,
          'end_time', s.end_time
        )
      ) AS sessions,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'agenda_id', ea.agenda_id,
          'item', ea.item
        )
      ) AS agendas
    FROM event e
    LEFT JOIN event_session s ON e.id = s.event_id
    LEFT JOIN event_agenda ea ON e.id = ea.event_id
    WHERE e.id = ${event_id}
    GROUP BY e.id
  `;

  if (!event_details || event_details.length === 0) {
    return notFound();
  }

  const event = event_details[0];

  const sessions = event.sessions || [];
  const agendas = event.agendas || [];

  const uniqueSessions = sessions.filter(
    (session: any, index: number, self: any[]) =>
      index === self.findIndex((s) => s.topic === session.topic)
  );

  const uniqueAgendas = agendas.filter(
    (agenda: any, index: number, self: any[]) =>
      index === self.findIndex((a) => a.item === agenda.item)
  );

  const { user, session } = await validateRequest();

  const isRegistered = await prisma.$queryRaw<Array<RegistrationResult>>`
    SELECT * FROM registration 
    WHERE participant_id = ${user?.participant?.participant_id} 
    AND event_id = ${event_id} 
    LIMIT 1
  `;

  const eventDateTime = new Date(event.date);
  eventDateTime.setHours(event.time.getHours(), event.time.getMinutes());

  const isUpcoming = eventDateTime > new Date();

  const registration = isRegistered?.[0] as any;

  const canProvideFeedback = registration &&
    !isUpcoming &&
    registration.attendance_status === 'Attended' &&
    !(await prisma.$queryRaw<Array<{ 1: number }>>`
      SELECT 1 FROM feedback
      WHERE registration_id = ${registration.registration_id}
      LIMIT 1
    `)[0]?.[1];

  return (
    <div className="min-h-screen w-full">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-b-lg shadow-lg">
        <Link href="/events">
          <Button
            variant="ghost"
            className="text-white hover:text-white/80 my-2 text-lg font-semibold flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
        </Link>

        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold">{event.title}</h1>
            <div className="flex flex-col gap-2 items-center justify-center">
              {isUpcoming && session && session.type === "Participant" && (
                <RegisterEvent event_id={event_id} />
              )}
              {canProvideFeedback && (
                <FeedbackDialog registrationId={registration.registration_id} />
              )}
            </div>
          </div>

          <div className="flex gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{formatRelativeDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{formatTime(event.time)}</span>
            </div>
            <Badge variant={isUpcoming ? "default" : "secondary"}>
              {isUpcoming ? "Upcoming" : "Past Event"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <Card className="md:col-span-2 shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Description
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {event.description}
                </p>
              </div>

              {session?.type === "Organiser" && (
                <>
                  <Separator />

                  <div>
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <IndianRupee className="h-5 w-5 text-green-500" />
                      Event Budget
                    </h2>
                    <p className="text-2xl font-bold text-green-600">
                      {event.budget?.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                      })}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Sidebar */}
          <Card className="h-fit shadow-xl hover:shadow-2xl transition-shadow">
            <Tabs className="w-full" defaultValue="Agenda">
              <TabsList className="w-full h-12 grid grid-cols-2">
                <TabsTrigger value="Agenda">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Agenda
                  </span>
                </TabsTrigger>
                <TabsTrigger value="Sessions">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Sessions
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="Agenda" className="mt-4">
                <CardContent>
                  <div className="space-y-3">
                    {uniqueAgendas.map((agendaItem: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        {agendaItem.item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="Sessions" className="mt-4">
                <CardContent>
                  <div className="space-y-4">
                    {uniqueSessions.map((session: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <h3 className="font-semibold text-lg text-blue-600">
                          {session.topic}
                        </h3>
                        <p className="text-gray-600">
                          {session.building}, Room {session.room_no}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatTime(session.start_time)} -{" "}
                          {formatTime(session.end_time)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
