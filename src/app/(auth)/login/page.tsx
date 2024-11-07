import Link from "next/link";
import LogInForm from "./LogInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LogInPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-300">
      <div className="flex h-full w-full max-h-[28rem] max-w-[24rem] flex-col items-center justify-center gap-6 rounded-2xl bg-card shadow-2xl">
        <div className="text-3xl font-bold">Sign In</div>
        <div className="space-y-5">
          <LogInForm />
          <Link href={"/signup"} className="block text-center hover:underline">
            Don&apos;t have an account? Sign Up.
          </Link>
        </div>
      </div>
    </div>
  );
}
