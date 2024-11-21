import { Metadata } from "next";
import SignUpForm from "./SignUpForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignUpPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
      <div className="flex h-full w-full max-h-[42rem] max-w-[26rem] flex-col items-center justify-center gap-8 rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all hover:shadow-xl">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-slate-500">Sign up to get started</p>
        </div>
        
        <div className="flex flex-col justify-center items-center w-full space-y-6">
          <SignUpForm />
          <Link 
            href={"/login"} 
            className="block text-center text-slate-600 transition-colors hover:text-blue-600 hover:underline"
          >
            Already have an account? Log In.
          </Link>
        </div>
      </div>
    </div>
  );
}
