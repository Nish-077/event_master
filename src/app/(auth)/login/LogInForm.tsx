"use client";

import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { logInSchema, LogInValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { login } from "./action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function LogInForm() {
  const form = useForm<LogInValues>({
    resolver: zodResolver(logInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { toast } = useToast();

  async function handler(values: LogInValues) {
    const { error } = await login(values);
    if (error) {
      toast({
        title: "User doesn't exist",
        description: error,
        variant: "destructive",
      });
      return;
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handler)}
        className="w-full max-w-[20rem] space-y-5"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-semibold text-slate-700">Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter email" 
                  {...field} 
                  className="rounded-lg border-slate-200 bg-slate-50 px-4 py-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-semibold text-slate-700">User Type</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="rounded-lg border-slate-200 bg-slate-50 px-4 py-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-slate-200">
                    <SelectItem value="Participant" className="hover:bg-slate-50">Participant</SelectItem>
                    <SelectItem value="Speaker" className="hover:bg-slate-50">Speaker</SelectItem>
                    <SelectItem value="Organiser" className="hover:bg-slate-50">Organiser</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-semibold text-slate-700">Password</FormLabel>
              <FormControl>
                <PasswordInput 
                  placeholder="Enter Password" 
                  {...field} 
                  className="rounded-lg border-slate-200 bg-slate-50 px-4 py-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 py-6 text-lg font-semibold tracking-wide hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
        >
          Sign in
        </Button>
      </form>
    </Form>
  );
}
