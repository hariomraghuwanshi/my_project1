import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIdeaSchema, type InsertIdea } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Send, Bot } from "lucide-react";

interface IdeaSubmissionFormProps {
  onSuccess: () => void;
}

export function IdeaSubmissionForm({ onSuccess }: IdeaSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertIdea>({
    resolver: zodResolver(insertIdeaSchema),
    defaultValues: {
      name: "",
      tagline: "",
      description: "",
    },
  });

  const createIdeaMutation = useMutation({
    mutationFn: async (data: InsertIdea) => {
      const response = await apiRequest("POST", "/api/ideas", data);
      return response.json();
    },
    onSuccess: (newIdea) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "Idea submitted successfully!",
        description: `"${newIdea.name}" received an AI rating of ${newIdea.aiRating}/100`,
      });
      
      form.reset();
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: InsertIdea) => {
    setIsSubmitting(true);
    
    // Show processing toast
    toast({
      title: "Processing your idea...",
      description: "Our AI is evaluating your startup concept",
    });

    // Simulate AI processing delay for better UX
    setTimeout(() => {
      createIdeaMutation.mutate(data);
      setIsSubmitting(false);
    }, 1500);
  };

  const description = form.watch("description");
  const characterCount = description?.length || 0;

  return (
    <div className="p-4">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="bg-primary bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Share Your Idea</h2>
            <p className="text-muted-foreground">Tell us about your innovative startup concept</p>
          </div>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Startup Name *
              </Label>
              <Input
                id="name"
                placeholder="Enter your startup name"
                className="mt-2"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-destructive text-sm mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="tagline" className="text-sm font-medium text-foreground">
                Tagline *
              </Label>
              <Input
                id="tagline"
                placeholder="One-line description of your idea"
                className="mt-2"
                {...form.register("tagline")}
              />
              {form.formState.errors.tagline && (
                <p className="text-destructive text-sm mt-1">{form.formState.errors.tagline.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                Description *
              </Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Describe your startup idea in detail..."
                className="mt-2 resize-none"
                {...form.register("description")}
              />
              <div className="flex justify-between items-center mt-1">
                {form.formState.errors.description && (
                  <p className="text-destructive text-sm">{form.formState.errors.description.message}</p>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {characterCount}/500
                </span>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Bot className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm font-medium text-foreground">AI Evaluation Preview</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Our AI will analyze your idea based on market potential, feasibility, and innovation factor.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || createIdeaMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting || createIdeaMutation.isPending ? "Processing..." : "Submit Idea"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
