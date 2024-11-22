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
import {
  formatRelativeDate,
  formatTime,
  isSpeakerAssignedToEvent,
} from "@/lib/utils";
import { notFound } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { validateRequest } from "@/auth";
import RegisterEvent from "./RegisterEvent";
import { Badge } from "@/components/ui/badge";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { updateAttendanceStatus } from "./action";

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
  const { event_id } = (await params);
  const { user, session } = await validateRequest();

  // Add this check for speaker assignment
  const isSpeakerAssigned =
    session?.type === "Speaker" && user?.speaker?.speaker_id
      ? await isSpeakerAssignedToEvent(user.speaker.speaker_id, event_id)
      : false;

  const event_details = await prisma.$queryRaw<Array<any>>`
    CALL GetEventDetails(${event_id})
  `;

  console.log(event_details)

  if (!event_details || event_details.length === 0) {
    return notFound();
  }

  const event = {
    title: event_details[0].f0,
    date: event_details[0].f1,
    time: event_details[0].f2,
    budget: event_details[0].f3,
    description: event_details[0].f4,
    sessions: event_details[0].f5 || [],
    agendas: event_details[0].f6 || []
  };

  // Add this code to properly handle the time
  const eventTime = event.time instanceof Date 
    ? event.time 
    : new Date(event.time);

  const eventDateTime = new Date(event.date);
  eventDateTime.setHours(eventTime.getHours(), eventTime.getMinutes());

  const sessions = event.sessions;
  const agendas = event.agendas;

  const uniqueSessions = sessions.filter(
    (session: any, index: number, self: any[]) =>
      index === self.findIndex((s) => s.topic === session.topic)
  );

  const uniqueAgendas = agendas.filter(
    (agenda: any, index: number, self: any[]) =>
      index === self.findIndex((a) => a.item === agenda.item)
  );

  const isRegistered = await prisma.$queryRaw<Array<RegistrationResult>>`
    SELECT * FROM registration 
    WHERE participant_id = ${user?.participant?.participant_id} 
    AND event_id = ${event_id} 
    LIMIT 1
  `;

  // Add check for speaker participation in event
  const wasSpeakerAtEvent = session?.type === "Speaker" && user?.speaker?.speaker_id
    ? await prisma.$queryRaw<Array<{ was_speaker: number }>>`
        SELECT 1 as was_speaker
        FROM speaker_for_session sfs
        JOIN event_session es ON sfs.session_id = es.event_session_id 
        WHERE sfs.speaker_id = ${user.speaker.speaker_id}
        AND es.event_id = ${event_id}
        LIMIT 1
      `
    : [];

  const isUpcoming = eventDateTime > new Date();

  const registration = isRegistered?.[0] as any;

  const canProvideFeedback =
    (!isUpcoming && ((registration && registration.attendance_status === "Attended") || wasSpeakerAtEvent.length > 0)) &&
    !(
      await prisma.$queryRaw<Array<{ 1: number }>>`
      SELECT 1 FROM feedback
      WHERE registration_id = ${registration?.registration_id ?? null}
      LIMIT 1
    `
    )[0]?.[1];

  const isPastEvent = !isUpcoming;
  const showAttendanceButton = registration && isPastEvent;

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
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold">{event.title}</h1>
              {isSpeakerAssigned && (
                <Badge className="bg-green-100 text-green-800 text-sm">
                  You're Speaking at This Event
                </Badge>
              )}
            </div>
            <div className="flex flex-col gap-2 items-center justify-center">
              {isUpcoming && session && session.type === "Participant" && (
                <RegisterEvent event_id={event_id} />
              )}
              {showAttendanceButton && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm">
                    Status: {registration.attendance_status || "Not Marked"}
                  </p>
                  {registration.attendance_status !== "Attended" && (
                    <form
                      action={async () => {
                        "use server";
                        await updateAttendanceStatus(
                          registration.registration_id,
                          "Attended"
                        );
                      }}
                    >
                      <Button type="submit" variant="default">
                        Mark as Attended
                      </Button>
                    </form>
                  )}
                </div>
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
              <span>{eventTime instanceof Date ? formatTime(eventTime) : 'Time not set'}</span>
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
                          {session.start_time} - {session.end_time}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Speaker: {session.speaker_name}
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
