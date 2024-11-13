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
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatRelativeDate, formatTime } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";

interface PageProps {
  params: { event_id: string };
}

export default async function EventDetailsPage({ params }: PageProps) {
  const { event_id } = await params;

  const event_details = await prisma.$queryRaw<{
    title: string;
    date: Date;
    time: Date;
    agenda: string;
    budget?: number;
    description: string;
    topic: string[];
    building: string[];
    room_no: string[];
    capacity: number[];
    start_time: Date[];
    end_time: Date[];
    first_name: string[];
    last_name?: string[];
  }>`

  `;

  if (!event) {
    return notFound();
  }

  return (
    <div className="min-h-screen w-full -translate-y-4 px-8">
      <Link href="/events">
        <Button
          variant="ghost"
          className="-translate-x-3 my-6 text-lg font-semibold flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{event_details.title}</h1>
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
                      {formatRelativeDate(event_details.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Time</p>
                    <p className="font-semibold">
                      {formatTime(event_details.time)}
                    </p>
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
                  {event_details.description}
                </p>
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" /> Budget
                </h2>
                <p className="text-gray-600 font-medium">
                  {event_details.budget?.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <Tabs className="w-full p-3" defaultValue="Agenda">
            <TabsList className="w-full h-10 flex justify-center gap-14">
              <TabsTrigger className="font-semibold text-sm" value="Agenda">
                Agenda
              </TabsTrigger>
              <TabsTrigger className="font-semibold text-sm" value="Session">
                Session
              </TabsTrigger>
              <TabsTrigger
                className="font-semibold text-sm"
                value="Particpants"
              >
                Particpants
              </TabsTrigger>
            </TabsList>
            <TabsContent value="Agenda">
              <CardHeader>
                <CardDescription>Schedule of activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {event_details.agenda?.split("\n").map((item, index) => (
                    <div key={index} className="py-2 border-b last:border-0">
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </TabsContent>
            <TabsContent value="Session">
              <CardHeader>
                <CardDescription>Session Schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {event_details.agenda?.split("\n").map((item, index) => (
                    <div key={index} className="py-2 border-b last:border-0">
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </TabsContent>
            <TabsContent value="Particpants">
              <CardHeader>
                <CardDescription>List of Participants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {event_details.agenda?.split("\n").map((item, index) => (
                    <div key={index} className="py-2 border-b last:border-0">
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
