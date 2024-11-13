import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { validateRequest } from "@/auth";
import UpComingEvents from "@/components/UpComingEvents";

export default async function HomePage() {
  const { user } = await validateRequest();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return (
    <div className="min-h-screen w-full">
      <Card className="mb-8 shadow-lg">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold">
            Welcome back, {user.participant?.first_name}! 👋
          </h2>
          <p className="text-gray-600 mt-2">Here's what's happening</p>
        </CardContent>
      </Card>
      <UpComingEvents />
    </div>
  );
}
