"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogTrigger, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

interface RegisterEventProps {
  event_id: string;
}

const RegisterEvent: React.FC<RegisterEventProps> = ({ event_id }) => {
  const { toast } = useToast();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRegistration = async () => {
      const response = await fetch(`/api/event_register?event_id=${event_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setIsRegistered(data.registered);
      } else {
        console.error("Failed to check registration status:", response.statusText);
        setIsRegistered(false); // Optionally handle as unauthenticated
      }
      setIsLoading(false);
    };
    checkRegistration();
  }, [event_id]);

  const handleRegister = async () => {
    const response = await fetch(`/api/event_register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event_id }),
    });

    if (response.ok) {
      setIsRegistered(true);
      toast({
        title: "Success",
        description: "Registration successful!",
      });
    } else {
      toast({
        title: "Error",
        description: "Registration failed.",
        variant: "destructive",
      });
    }
  };

  const handleUnregister = async () => {
    const response = await fetch(`/api/event_register`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event_id }),
    });

    if (response.ok) {
      setIsRegistered(false);
      toast({
        title: "Success",
        description: "Unregistered successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Unregistration failed.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return null;

  return (
    <div className="w-full max-w-[10rem]">
      {!isRegistered ? (
        <Button className="h-14 text-lg px-6 font-semibold" onClick={handleRegister}>
           Register
        </Button>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="h-14 px-6 bg-blue-400 text-lg font-semibold" variant='outline'>Registered</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unregister from Event</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to unregister from this event?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleUnregister}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default RegisterEvent;