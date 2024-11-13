import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UpComingEvents from "@/components/UpComingEvents";
import CompletedEvents from "./CompletedEvents";
import AllEvents from "./AllEvents";
import { Metadata } from "next";
import CreateEvent from "@/components/CreateEvent";

export const metadata: Metadata = {
  title: "Events",
};

export default function EventsPage() {
  return (
    <div className="w-full">
      <main className="min-h-screen w-full flex justify-center -translate-y-4">
        <Tabs defaultValue="Upcoming" className="w-full max-w-4xl p-4">
          <TabsList className="w-full h-12 shadow-lg flex justify-center gap-14">
            <TabsTrigger className="font-semibold text-lg" value="Upcoming">
              Upcoming Events
            </TabsTrigger>
            <TabsTrigger className="font-semibold text-lg" value="Completed">
              Completed Events
            </TabsTrigger>
            <TabsTrigger className="font-semibold text-lg" value="All">
              All Events
            </TabsTrigger>
          </TabsList>
          <TabsContent value="Upcoming">
            <UpComingEvents />
          </TabsContent>
          <TabsContent value="Completed">
            <CompletedEvents />
          </TabsContent>
          <TabsContent value="All">
            <AllEvents />
          </TabsContent>
        </Tabs>
      </main>
      <CreateEvent />
    </div>
  );
}
