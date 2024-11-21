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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signup } from "./action";
import { useToast } from "@/hooks/use-toast";

export default function SignUpForm() {
  const { toast } = useToast();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignUpValues) => {
    const { error } = await signup(values);

    if (error) {
      toast({
        title: "User already exists",
        description: error,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: `Welcome ${values.firstName}`,
      description: `You are signed in as a ${values.type}`,
    });

    setTimeout(() => {}, 3000);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-[20rem] space-y-4"
      >
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-semibold text-slate-700">Email</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email" 
                    placeholder="Enter Email"
                    className="rounded-lg border-slate-200 bg-slate-50 px-4 py-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold text-slate-700">Firstname</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter Firstname"
                      className="rounded-lg border-slate-200 bg-slate-50 px-4 py-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold text-slate-700">Lastname</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter Lastname"
                      className="rounded-lg border-slate-200 bg-slate-50 px-4 py-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
          
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
                    {...field} 
                    placeholder="Enter Password"
                    className="rounded-lg border-slate-200 bg-slate-50 px-4 py-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 py-6 text-lg font-semibold tracking-wide hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
        >
          Create Account
        </Button>
      </form>
    </Form>
  );
}
