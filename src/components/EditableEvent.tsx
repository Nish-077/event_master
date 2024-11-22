"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeDate, formatTime } from "@/lib/utils";
import {
  updateEventDetails,
  getAllSpeakers,
  updateEventSession,
} from "@/app/(main)/dashboard/action";
import { useToast } from "@/hooks/use-toast";
import {
  Pencil,
  Save,
  X,
  Calendar,
  Clock,
  IndianRupee,
  Plus,
  Trash2,
} from "lucide-react";
import { useSession } from "@/app/(main)/SessionProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Session {
  session_id: string;
  title: string;
  start_time: string;
  end_time: string;
  speaker: string;
  location: string;
  speaker_id?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  budget?: number;
  description?: string;
  sessions: Session[];
}

interface EditableEventProps {
  event: Event;
}

interface Speaker {
  speaker_id: string;
  name: string;
}

export default function EditableEvent({ event }: EditableEventProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(event);
  const [isSaving, setIsSaving] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const { toast } = useToast();
  const { user } = useSession();
  const [speakers, setSpeakers] = useState<Speaker[]>([]);

  useEffect(() => {
    const checkEditPermission = async () => {
      if (!user?.organiser?.organiser_id) {
        setCanEdit(false);
        return;
      }

      // Check if current organiser is assigned to this event
      const response = await fetch(`/api/events/${event.id}/organizers`);
      const { organizers } = await response.json();

      setCanEdit(
        organizers.some(
          (org: any) => org.organiser_id === user.organiser?.organiser_id
        )
      );
    };

    checkEditPermission();
  }, [event.id]);

  useEffect(() => {
    const fetchSpeakers = async () => {
      const result = await getAllSpeakers();
      if (result.data) {
        setSpeakers(result.data);
      }
    };
    fetchSpeakers();
  }, []);

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      // Update event details
      const eventResult = await updateEventDetails(event.id, editedEvent);
      if (eventResult.error) {
        throw new Error(eventResult.error);
      }

      // Update sessions
      const sessionResult = await updateEventSession(
        event.id,
        editedEvent.sessions
      );
      if (sessionResult.error) {
        throw new Error(sessionResult.error);
      }

      toast({
        title: "Success",
        description: "Event details updated successfully",
      });
      setIsEditing(false);

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event details",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="col-span-2 transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row justify-between items-center border-b pb-4">
        <CardTitle className="text-xl font-bold">Event Details</CardTitle>
        {canEdit && (
          <Button
            variant="ghost"
            onClick={() => setIsEditing(!isEditing)}
            className="hover:bg-secondary"
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-2" /> Cancel
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {isEditing ? (
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveChanges();
              }}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editedEvent.title}
                  onChange={(e) =>
                    setEditedEvent({ ...editedEvent, title: e.target.value })
                  }
                  className="transition-all duration-200 focus:ring-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editedEvent.description || ""}
                  onChange={(e) =>
                    setEditedEvent({
                      ...editedEvent,
                      description: e.target.value,
                    })
                  }
                  className="min-h-[100px] transition-all duration-200 focus:ring-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Date
                  </label>
                  <Input
                    type="date"
                    value={editedEvent.date.split("T")[0]}
                    onChange={(e) =>
                      setEditedEvent({
                        ...editedEvent,
                        date: new Date(e.target.value).toISOString(),
                      })
                    }
                    className="transition-all duration-200 focus:ring-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Time
                  </label>
                  <Input
                    type="time"
                    value={editedEvent.time.split("T")[1].substring(0, 5)}
                    onChange={(e) =>
                      setEditedEvent({
                        ...editedEvent,
                        time: `1970-01-01T${e.target.value}:00.000Z`,
                      })
                    }
                    className="transition-all duration-200 focus:ring-2"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" /> Budget
                </label>
                <Input
                  type="number"
                  value={editedEvent.budget || 0}
                  onChange={(e) =>
                    setEditedEvent({
                      ...editedEvent,
                      budget: parseInt(e.target.value),
                    })
                  }
                  className="transition-all duration-200 focus:ring-2"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Sessions</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditedEvent({
                        ...editedEvent,
                        sessions: [
                          ...editedEvent.sessions,
                          {
                            session_id: `new-${Date.now()}`,
                            title: "",
                            start_time: "",
                            end_time: "",
                            speaker: "",
                            location: "",
                          },
                        ],
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Session
                  </Button>
                </div>
                {editedEvent.sessions.map((session, index) => (
                  <Card key={session.session_id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <Input
                          placeholder="Session Title"
                          value={session.title}
                          onChange={(e) => {
                            const newSessions = [...editedEvent.sessions];
                            newSessions[index].title = e.target.value;
                            setEditedEvent({
                              ...editedEvent,
                              sessions: newSessions,
                            });
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2"
                          onClick={() => {
                            const newSessions = editedEvent.sessions.filter(
                              (_, i) => i !== index
                            );
                            setEditedEvent({
                              ...editedEvent,
                              sessions: newSessions,
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="time"
                          value={
                            session.start_time.split("T")[1]?.substring(0, 5) ||
                            ""
                          }
                          onChange={(e) => {
                            const newSessions = [...editedEvent.sessions];
                            newSessions[index].start_time =
                              `1970-01-01T${e.target.value}:00.000Z`;
                            setEditedEvent({
                              ...editedEvent,
                              sessions: newSessions,
                            });
                          }}
                          placeholder="Start Time"
                        />
                        <Input
                          type="time"
                          value={
                            session.end_time.split("T")[1]?.substring(0, 5) ||
                            ""
                          }
                          onChange={(e) => {
                            const newSessions = [...editedEvent.sessions];
                            newSessions[index].end_time =
                              `1970-01-01T${e.target.value}:00.000Z`;
                            setEditedEvent({
                              ...editedEvent,
                              sessions: newSessions,
                            });
                          }}
                          placeholder="End Time"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Select
                          value={session.speaker_id}
                          onValueChange={(value) => {
                            const newSessions = [...editedEvent.sessions];
                            newSessions[index].speaker_id = value;
                            newSessions[index].speaker =
                              speakers.find((s) => s.speaker_id === value)
                                ?.name || "";
                            setEditedEvent({
                              ...editedEvent,
                              sessions: newSessions,
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Speaker" />
                          </SelectTrigger>
                          <SelectContent>
                            {speakers.map((speaker) => (
                              <SelectItem
                                key={speaker.speaker_id}
                                value={speaker.speaker_id}
                              >
                                {speaker.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Location"
                          value={session.location}
                          onChange={(e) => {
                            const newSessions = [...editedEvent.sessions];
                            newSessions[index].location = e.target.value;
                            setEditedEvent({
                              ...editedEvent,
                              sessions: newSessions,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <Button
                type="submit"
                className="w-full transition-all duration-200 hover:scale-[1.02]"
                disabled={isSaving}
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save Changes
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-[100px_1fr] items-center">
                <span className="font-medium text-muted-foreground">
                  Title:
                </span>
                <span className="font-semibold">{event.title}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr]">
                <span className="font-medium text-muted-foreground">
                  Description:
                </span>
                <span>{event.description || "No description provided"}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] items-center">
                <span className="font-medium text-muted-foreground">Date:</span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatRelativeDate(new Date(event.date))}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] items-center">
                <span className="font-medium text-muted-foreground">Time:</span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatTime(new Date(event.time))}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] items-center">
                <span className="font-medium text-muted-foreground">
                  Budget:
                </span>
                <span className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  {event.budget || "0"}
                </span>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Sessions</h3>
                <div className="space-y-4">
                  {event.sessions.map((session) => (
                    <Card key={session.session_id} className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{session.title}</h4>
                        <div className="grid grid-cols-2 gap-x-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Time:{" "}
                            </span>
                            {formatTime(new Date(session.start_time))} -{" "}
                            {formatTime(new Date(session.end_time))}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Speaker:{" "}
                            </span>
                            {session.speaker}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Location:{" "}
                            </span>
                            {session.location}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
