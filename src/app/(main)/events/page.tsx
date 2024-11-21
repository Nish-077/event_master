import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UpComingEvents from "@/components/UpComingEvents";
import CompletedEvents from "./CompletedEvents";
import AllEvents from "./AllEvents";
import { Metadata } from "next";
import CreateEvent from "@/components/CreateEvent";
import { validateRequest } from "@/auth";

export const metadata: Metadata = {
  title: "Events",
};

export default async function EventsPage() {
  const { session } = await validateRequest();

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Events Dashboard
          </h1>
          <p className="text-muted-foreground">
            Discover and manage all your events in one place
          </p>
        </header>

        <main className="w-full flex justify-center">
          <Tabs defaultValue="Upcoming" className="w-full max-w-4xl">
            <TabsList className="w-full h-14 mb-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-xl rounded-xl">
              <TabsTrigger
                className="font-semibold text-lg transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                value="Upcoming"
              >
                Upcoming Events
              </TabsTrigger>
              <TabsTrigger
                className="font-semibold text-lg transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                value="Completed"
              >
                Completed Events
              </TabsTrigger>
              <TabsTrigger
                className="font-semibold text-lg transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                value="All"
              >
                All Events
              </TabsTrigger>
            </TabsList>

            <TabsContent value="Upcoming" className="mt-0">
              <UpComingEvents />
            </TabsContent>
            <TabsContent value="Completed" className="mt-0">
              <CompletedEvents />
            </TabsContent>
            <TabsContent value="All" className="mt-0">
              <AllEvents />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {session && session.type === "Organiser" && (
        <div className="fixed bottom-6 right-6">
          <CreateEvent />
        </div>
      )}
    </div>
  );
}
