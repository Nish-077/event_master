"use client";

import { LogOut, User } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { logout } from "@/app/(auth)/action";
import Link from "next/link";
import { useSession } from "@/app/(main)/SessionProvider";

export default function NavBar() {
  async function handler() {
    await logout();
  }

  const { user } = useSession();

  function getUserInitials() {
    const participant = user.participant;
    const organiser = user.organiser;
    const speaker = user.speaker;

    if (participant) {
      return participant.last_name
        ? participant.first_name.slice(0, 1) + participant.last_name.slice(0, 1)
        : participant.first_name.slice(0, 2);
    } else if (organiser) {
      return organiser.last_name
        ? organiser.first_name.slice(0, 1) + organiser.last_name.slice(0, 1)
        : organiser.first_name.slice(0, 2);
    } else if (speaker) {
      return speaker.last_name
        ? speaker.first_name.slice(0, 1) + speaker.last_name.slice(0, 1)
        : speaker.first_name.slice(0, 2);
    } else {
      return "";
    }
  }

  return (
    <header>
      <div className="sticky bg-card px-5 py-6 shadow-lg mb-2 top-0 z-10 flex items-center justify-between">
        <Link href={"/"}>
          <h1 className="font-bold text-3xl">EventMaster</h1>
        </Link>
        <div className="flex gap-6">
          <Link href={"/events"}>
            <Button variant="secondary" className="text-sm font-semibold">
              Events
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <Button onClick={handler} variant="ghost" className="pl-0">
                    Log Out
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
