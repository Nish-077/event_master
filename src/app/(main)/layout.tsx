import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import SessionProvider from "./SessionProvider";
import NavBar from "@/app/(main)/NavBar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  if (!session.user) redirect("/login");

  return (
    <SessionProvider value={session}>
      <div className="flex min-h-screen flex-col bg-gray-200">
        <NavBar />
        <div className="flex w-full grow gap-5 p-5">{children}</div>
      </div>
    </SessionProvider>
  );
}
