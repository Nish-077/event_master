import { z } from "zod";

const reqString = z.string().trim().min(1, "Required");

export const logInSchema = z.object({
  email: reqString.email("Invalid email address"),
  type: z.enum(["Participant", "Organiser", "Speaker"] as const, {
    required_error: "Please select a user type",
  }),
  password: reqString,
});

export type LogInValues = z.infer<typeof logInSchema>;

export const signUpSchema = z.object({
  email: reqString.email("Invalid email address"),
  firstName: reqString.regex(
    /^[a-zA-Z0-9_-]+$/,
    "Only letters, numbers, - and _ allowed"
  ),
  lastName: reqString.regex(
    /^[a-zA-Z0-9_-]+$/,
    "Only letters, numbers, - and _ allowed"
  ),
  type: z.enum(["Participant", "Organiser", "Speaker"] as const, {
    required_error: "Please select a user type",
  }),
  password: reqString
    .min(8, "Password must be minimum 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).*$/,
      "Must contain at least 1 lowercase letter, 1 uppercase letter and 1 special character"
    ),
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const newEventSchema = z.object({
  title: reqString,
  date: z.string(),
  time: z.string(),
  budget: z.number().min(0, "Budget must be a positive number"),
  description: z.string(),
  sessions: z.array(z.any()),
  agendaItems: z.array(z.string().trim().min(1, "Agenda item cannot be empty")),
});

export type NewEventValues = z.infer<typeof newEventSchema>;
