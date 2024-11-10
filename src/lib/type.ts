import { participant_type } from "@prisma/client";

interface BaseUser {
  id: string;
  created_at: Date;
  email: string;
}

interface Participant {
  participant_id: string;
  first_name: string;
  last_name?: string | null;
  type: participant_type;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
}

interface Organiser {
  organiser_id: string;
  first_name: string;
  last_name?: string | null;
  role: string;
  department?: string | null;
}

interface Speaker {
  speaker_id: string;
  first_name: string;
  last_name?: string | null;
  bio?: string | null;
}

export interface UserTypeData {
  participant?: Participant;
  organiser?: Organiser;
  speaker?: Speaker;
}

export interface UserData extends BaseUser {
  participant?: Participant;
  organiser?: Organiser;
  speaker?: Speaker;
}
