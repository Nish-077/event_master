import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { validateRequest } from "@/auth";
import UpComingEvents from "@/components/UpComingEvents";
import { CalendarDays, Users, Trophy } from "lucide-react";

export default async function HomePage() {
  const { user } = await validateRequest();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return (
    <div className="min-h-screen w-full p-4 md:p-6 space-y-6">
      <Card className="shadow-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
        <CardContent className="pt-6 p-6">
          <h2 className="text-3xl font-bold">
            Welcome back, {user.participant?.first_name}! 👋
          </h2>
          <p className="text-gray-600 mt-2 text-lg">
            Stay updated with your latest events and activities
          </p>
        </CardContent>
      </Card>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Your Registered Upcoming Events</p>
                <h3 className="text-2xl font-bold">5</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Participations</p>
                <h3 className="text-2xl font-bold">12</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}
      <UpComingEvents />
    </div>
  );
}
