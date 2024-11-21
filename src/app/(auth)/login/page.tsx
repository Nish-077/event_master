import Link from "next/link";
import LogInForm from "./LogInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LogInPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
      <div className="flex h-full w-full max-h-[35rem] max-w-[26rem] flex-col items-center justify-center gap-8 rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all hover:shadow-xl">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-slate-500">Sign in to continue</p>
        </div>
        
        <div className="w-full flex flex-col justify-center items-center space-y-6">
          <LogInForm />
          <Link 
            href={"/signup"} 
            className="block text-center text-slate-600 transition-colors hover:text-blue-600 hover:underline"
          >
            Don&apos;t have an account? Sign Up.
          </Link>
        </div>
      </div>
    </div>
  );
}
