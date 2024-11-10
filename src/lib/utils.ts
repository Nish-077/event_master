import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDate, formatDistanceToNowStrict } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time: Date) {
  return formatDate(time, "h:mm a");
}

export function formatRelativeDate(date: Date) {
  const currentDate = new Date();
  const eventDate = new Date(date);

  if (currentDate.getFullYear() === eventDate.getFullYear()) {
    return formatDate(eventDate, "d MMM");
  } else {
    return formatDate(eventDate, "d MMM, yyyy");
  }
}
