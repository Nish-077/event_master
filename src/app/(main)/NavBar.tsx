"use client";

import { LogOut, User, Menu, Search } from "lucide-react";
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
import { useState, useEffect } from "react";

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function handler() {
    await logout();
  }

  const { user, session } = useSession();

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
      <div className={`sticky px-5 py-4 top-0 z-10 backdrop-blur-sm transition-all duration-300 
        ${isScrolled ? 'bg-card/80 shadow-lg' : 'bg-card'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href={"/"}>
            <h1 className="font-bold text-3xl hover:text-primary transition-colors">EventMaster</h1>
          </Link>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden">
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop Navigation */}
          <div className={`flex-1 items-center justify-end gap-6 md:flex
            ${isMobileMenuOpen ? 'flex flex-col absolute top-16 left-0 right-0 bg-card p-4 shadow-lg' : 'hidden'}`}>

            {session.type === "Organiser" && (
              <Link href={"/dashboard"}>
                <Button variant="ghost" className="text-sm font-semibold hover:bg-primary hover:text-primary-foreground">
                  Dashboard
                </Button>
              </Link>
            )}
            
            <Link href={"/events"}>
              <Button variant="ghost" className="text-sm font-semibold hover:bg-primary hover:text-primary-foreground">
                Events
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-primary/10">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20 transition-all hover:ring-primary">
                    <AvatarImage />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem className="hover:bg-primary/10 cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-destructive/10 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <button onClick={handler} className="w-full text-left">
                    Log Out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
