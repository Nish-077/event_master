import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavBar from "@/components/NavBar";
import { validateRequest } from "@/auth";
import UpComingEvents from "@/components/UpComingEvents";

export default async function HomePage() {
  const { user } = await validateRequest();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return (
    <div className="min-h-screen bg-gray-100 px-8">
      <NavBar />

      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold">
            Welcome back, {user.participant?.first_name}! 👋
          </h2>
          <p className="text-gray-600 mt-2">Here's what's happening today</p>
        </CardContent>
      </Card>

      <UpComingEvents />
    </div>
  );
}
