import { Metadata } from "next";
import SignUpForm from "./SignUpForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignUpPage() {
  return (
    <div className="bg-gray-300 h-screen w-full flex justify-center items-center">
      <div className="bg-card h-full w-full max-h-[32rem] max-w-[24rem] flex flex-col items-center justify-center shadow-2xl rounded-2xl gap-6">
        <div className="font-bold text-3xl">Sign Up</div>
        <div className="space-y-5">
          <SignUpForm />
          <Link href={"/login"} className="block text-center hover:underline">
            Already have an account? Log In.
          </Link>
        </div>
      </div>
    </div>
  );
}
