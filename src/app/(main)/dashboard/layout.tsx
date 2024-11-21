import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import NavBar from "@/app/(main)/NavBar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = await validateRequest();

  if (session?.type != "Organiser") redirect("/");

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-200">
      <div className="w-full grow">{children}</div>
    </div>
  );
}
