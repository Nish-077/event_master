"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeDate, formatTime } from "@/lib/utils";
import { updateEventDetails } from "@/app/(main)/dashboard/action";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Save, X, Calendar, Clock, IndianRupee } from "lucide-react";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  budget?: number;
  description?: string;
}

interface EditableEventProps {
  event: Event;
}

export default function EditableEvent({ event }: EditableEventProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(event);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const result = await updateEventDetails(event.id, editedEvent);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Event details updated successfully",
      });
      setIsEditing(false);
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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
