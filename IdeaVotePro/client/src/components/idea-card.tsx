import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Idea } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Eye } from "lucide-react";

interface IdeaCardProps {
  idea: Idea;
  onVoteSuccess: () => void;
}

export function IdeaCard({ idea, onVoteSuccess }: IdeaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [votedIdeas, setVotedIdeas] = useLocalStorage<string[]>("votedIdeas", []);
  const { toast } = useToast();
  
  const hasVoted = votedIdeas.includes(idea.id);

  const voteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/ideas/${idea.id}/vote`);
      return response.json();
    },
    onSuccess: () => {
      setVotedIdeas([...votedIdeas, idea.id]);
      toast({
        title: "Vote recorded!",
        description: "Thanks for your feedback.",
      });
      onVoteSuccess();
    },
    onError: () => {
      toast({
        title: "Vote failed",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  const viewMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/ideas/${idea.id}/view`);
      return response.json();
    },
  });

  const handleVote = () => {
    if (hasVoted) {
      toast({
        title: "Already voted",
        description: "You have already voted for this idea!",
        variant: "destructive",
      });
      return;
    }
    voteMutation.mutate();
  };

  const handleReadMore = () => {
    if (!isExpanded) {
      viewMutation.mutate();
    }
    setIsExpanded(!isExpanded);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 90) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (rating >= 80) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (rating >= 70) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg">{idea.name}</h3>
            <p className="text-muted-foreground text-sm">{idea.tagline}</p>
          </div>
          <div className="ml-4">
            <Badge className={`text-xs font-medium ${getRatingColor(idea.aiRating)}`}>
              {idea.aiRating}/100
            </Badge>
          </div>
        </div>

        <p className={`text-foreground text-sm mb-4 ${isExpanded ? "" : "line-clamp-2"}`}>
          {idea.description}
        </p>

        <div className="flex items-center justify-between">
          <Button
            variant="link"
            size="sm"
            onClick={handleReadMore}
            className="text-primary p-0 h-auto font-medium"
          >
            {isExpanded ? "Read less" : "Read more"}
          </Button>

          <div className="flex items-center space-x-4">
            <div className="flex items-center text-muted-foreground">
              <Eye className="h-4 w-4 mr-1" />
              <span className="text-sm">{idea.views}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleVote}
              disabled={hasVoted || voteMutation.isPending}
              className={`flex items-center space-x-1 transition-colors ${
                hasVoted 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800" 
                  : "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="font-medium">{idea.votes}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
