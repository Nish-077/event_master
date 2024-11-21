"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { submitFeedback } from "@/app/(main)/events/[event_id]/action";
import { useToast } from "@/hooks/use-toast";

interface FeedbackDialogProps {
  registrationId: string;
}

export function FeedbackDialog({ registrationId }: FeedbackDialogProps) {
  const [rating, setRating] = useState<number>(5);
  const [comments, setComments] = useState<string>("");
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      const result = await submitFeedback({
        registrationId,
        rating,
        comments,
      });

      if (result.error) {
        // toast.error(result.error);
      } else {
        // toast.success("Feedback submitted successfully!");
        setOpen(false);
      }
    } catch (error) {
    //   toast.error("Failed to submit feedback");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Provide Feedback</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Event Feedback</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="rating">Rating (1-5)</Label>
            <Input
              id="rating"
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Share your thoughts about the event..."
            />
          </div>
        </div>
        <Button onClick={handleSubmit}>Submit Feedback</Button>
      </DialogContent>
    </Dialog>
  );
}
