"use client";

import { Button } from "@/components/ui/button";
import { logout } from "../(auth)/action";

export default function Home() {
  async function handler() {
    await logout();
  }
  return <Button onClick={handler}>Logout</Button>;
}
