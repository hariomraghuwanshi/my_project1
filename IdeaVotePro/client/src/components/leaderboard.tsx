import { type Idea } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardProps {
  ideas: Idea[];
}

export function Leaderboard({ ideas }: LeaderboardProps) {
  // Get top 5 ideas sorted by votes
  const topIdeas = ideas
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-orange-400" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">{index + 1}</span>;
    }
  };

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400 dark:from-yellow-950 dark:to-yellow-900 dark:border-yellow-600";
      case 1:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-gray-400 dark:from-gray-950 dark:to-gray-900 dark:border-gray-600";
      case 2:
        return "bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-400 dark:from-orange-950 dark:to-orange-900 dark:border-orange-600";
      default:
        return "bg-card border border-border";
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 90) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (rating >= 80) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (rating >= 70) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
  };

  if (topIdeas.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No ideas to rank yet</h3>
          <p className="text-muted-foreground">Submit some ideas to see the leaderboard!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Top Ideas</h2>
        <p className="text-muted-foreground">Most popular startup concepts</p>
      </div>

      {/* Leaderboard */}
      <div className="space-y-4">
        {topIdeas.map((idea, index) => (
          <Card key={idea.id} className={`overflow-hidden ${getRankStyle(index)}`}>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background mr-4 shadow-sm">
                  {getRankIcon(index)}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">{idea.name}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{idea.tagline}</p>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={`text-xs ${getRatingColor(idea.aiRating)}`}>
                      Rating: {idea.aiRating}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Votes: {idea.votes}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Views: {idea.views}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
