"use client";

import { CalendarIcon, PlusIcon, MinusIcon, ClockIcon } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newEventSchema, NewEventValues } from "@/lib/validation";
import { Input } from "./ui/input";
import { useState } from "react";
import { Popover } from "./ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { format as formatTime } from "date-fns"; // Add this import
import { Calendar } from "./ui/calendar";
import submitNewEvent from "@/app/(main)/events/action";
import { useToast } from "@/hooks/use-toast";

export default function CreateEvent() {
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date>();
  const [sessions, setSessions] = useState([{ topic: '', building: '', roomNo: '', startTime: '', endTime: '' }]);
  const [agendaItems, setAgendaItems] = useState(['']);

  const { toast } = useToast();

  const form = useForm<NewEventValues>({
    resolver: zodResolver(newEventSchema),
    defaultValues: {
      title: "",
      date: "",
      time: "",
      budget: 0,
      description: "",
      sessions: [],
      agendaItems: [],
    },
  });

  const onDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      form.setValue("date", format(selectedDate, "yyyy-MM-dd"));
    }
  };

  const onTimeSelect = (selectedTime: string) => {
    form.setValue("time", selectedTime);
  };

  const addSession = () => {
    setSessions([...sessions, { topic: '', building: '', roomNo: '', startTime: '', endTime: '' }]);
  };

  const removeSession = (index: number) => {
    const newSessions = [...sessions];
    newSessions.splice(index, 1);
    setSessions(newSessions);
  };

  const addAgendaItem = () => {
    setAgendaItems([...agendaItems, '']);
  };

  const removeAgendaItem = (index: number) => {
    const newItems = [...agendaItems];
    newItems.splice(index, 1);
    setAgendaItems(newItems);
  };

  async function handler(values: NewEventValues) {
    setError(null);

    const formattedTime = formatTime(
      new Date(`1970-01-01T${values.time}`),
      "HH:mm"
    );
    values.time = formattedTime;

    const eventData = {
      ...values,
      sessions,
      agendaItems,
    };

    const result = await submitNewEvent(eventData);

    if (result.error) {
      toast({
        title: "Error Creating an Event",
        description: error,
        variant: "destructive",
      });
      return;
    }

    form.reset();
    setDate(undefined);
    window.location.reload();
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="flex gap-2 fixed bottom-10 right-10 h-fit w-fit p-4 bg-black rounded-2xl">
          <PlusIcon size={30} color="white" strokeWidth={2} />
          <button className="text-white text-lg font-semibold">Create Event</button>
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <div className="w-full mx-auto max-w-lg overflow-y-auto max-h-[90vh]">
          <DrawerHeader className="flex flex-col justify-center items-center">
            <DrawerTitle>Create Event</DrawerTitle>
            <DrawerDescription>Enter event details</DrawerDescription>
          </DrawerHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handler)}
              className="w-full space-y-4 p-4"
            >
              {/* Event Details Section */}
              <div className="space-y-2 border-b pb-4">
                <h3 className="font-semibold">Event Details</h3>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter title" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Date <br />
                      </FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon />
                              {date ? (
                                format(date, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent>
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={onDateSelect}
                              initialFocus
                              className="bg-black text-white"
                              {...field}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          onChange={(e) => onTimeSelect(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter budget"
                          {...field}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event description" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Sessions Section */}
              <div className="space-y-2 border-b pb-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Sessions</h3>
                  <Button type="button" onClick={addSession} variant="outline" size="sm">
                    <PlusIcon className="w-4 h-4" /> Add Session
                  </Button>
                </div>
                {sessions.map((session, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded">
                    <div className="flex justify-end">
                      <Button type="button" onClick={() => removeSession(index)} variant="ghost" size="sm">
                        <MinusIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <FormField
                      control={form.control}
                      name={`sessions.${index}.topic`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Topic</FormLabel>
                          <FormControl>
                            <Input {...field} value={session.topic} placeholder="Enter topic to be discussed in the session" onChange={e => {
                              const newSessions = [...sessions];
                              newSessions[index].topic = e.target.value;
                              setSessions(newSessions);
                            }} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`sessions.${index}.building`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Building</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter building" {...field} value={session.building} onChange={e => {
                              const newSessions = [...sessions];
                              newSessions[index].building = e.target.value;
                              setSessions(newSessions);
                            }} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`sessions.${index}.roomNo`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter room number" {...field} value={session.roomNo} onChange={e => {
                              const newSessions = [...sessions];
                              newSessions[index].roomNo = e.target.value;
                              setSessions(newSessions);
                            }} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`sessions.${index}.startTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} value={session.startTime} onChange={e => {
                              const newSessions = [...sessions];
                              newSessions[index].startTime = e.target.value;
                              setSessions(newSessions);
                            }} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`sessions.${index}.endTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} value={session.endTime} onChange={e => {
                              const newSessions = [...sessions];
                              newSessions[index].endTime = e.target.value;
                              setSessions(newSessions);
                            }} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>

              {/* Agenda Items Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Agenda</h3>
                  <Button type="button" onClick={addAgendaItem} variant="outline" size="sm">
                    <PlusIcon className="w-4 h-4" /> Add Item
                  </Button>
                </div>
                {agendaItems.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={e => {
                        const newItems = [...agendaItems];
                        newItems[index] = e.target.value;
                        setAgendaItems(newItems);
                      }}
                      placeholder="Enter agenda item"
                    />
                    <Button type="button" onClick={() => removeAgendaItem(index)} variant="ghost" size="sm">
                      <MinusIcon className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <DrawerFooter>
                <Button type="submit" className="w-full">
                  Submit
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full">
                    Close
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
