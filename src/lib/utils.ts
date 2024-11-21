import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time: Date | string) {
  const date = new Date(time);
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "UTC",
  });
}

export function formatRelativeDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  };

  const currentDate = new Date();
  const eventDate = new Date(date);

  if (currentDate.getFullYear() === eventDate.getFullYear()) {
    delete options.year;
  }

  return eventDate.toLocaleString("en-IN", options);
}
