"use client";

import { CalendarIcon, PlusIcon } from "lucide-react";
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

  const { toast } = useToast();

  const form = useForm<NewEventValues>({
    resolver: zodResolver(newEventSchema),
    defaultValues: {
      title: "",
      date: "",
      time: "",
      agenda: "",
      budget: 0,
      description: "",
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

  async function handler(values: NewEventValues) {
    setError(null);

    const formattedTime = formatTime(
      new Date(`1970-01-01T${values.time}`),
      "HH:mm"
    );
    values.time = formattedTime;

    const result = await submitNewEvent(values);

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
          <PlusIcon size={30} color="white" strokeWidth={3} />
          <button className="text-white text-lg font-semibold">Create</button>
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <div className="w-full mx-auto max-w-lg">
          <DrawerHeader className="flex flex-col justify-center items-center">
            <DrawerTitle>Create Event</DrawerTitle>
            <DrawerDescription>Enter event details</DrawerDescription>
          </DrawerHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handler)}
              className="w-full space-y-2"
            >
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
                              "w-[280px] justify-start text-left font-normal",
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
                name="agenda"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agenda</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter agenda" {...field} />
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
                      <Input placeholder="Enter budget" {...field} />
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
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button type="submit" className="w-full">
                    Submit
                  </Button>
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
