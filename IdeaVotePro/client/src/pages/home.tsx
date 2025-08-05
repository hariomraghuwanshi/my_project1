import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { IdeaSubmissionForm } from "@/components/idea-submission-form";
import { IdeaCard } from "@/components/idea-card";
import { Leaderboard } from "@/components/leaderboard";
import { BottomNavigation } from "@/components/bottom-navigation";
import { StatsBar } from "@/components/stats-bar";
import { Button } from "@/components/ui/button";
import { type Idea } from "@shared/schema";
import { Plus, Moon, Sun, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Screen = "ideas" | "leaderboard" | "submit";
type SortBy = "rating" | "votes" | "newest";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("ideas");
  const [sortBy, setSortBy] = useState<SortBy>("rating");
  const [isDarkMode, setIsDarkMode] = useLocalStorage("darkMode", false);
  const isMobile = useIsMobile();

  const { data: ideas = [], isLoading, refetch } = useQuery<Idea[]>({
    queryKey: ["/api/ideas"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Sort ideas based on current sort preference
  const sortedIdeas = [...ideas].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.aiRating - a.aiRating;
      case "votes":
        return b.votes - a.votes;
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark", !isDarkMode);
  };

  const handleIdeaSubmitted = () => {
    setCurrentScreen("ideas");
    refetch();
  };

  const getScreenConfig = () => {
    switch (currentScreen) {
      case "ideas":
        return {
          title: "Startup Ideas",
          subtitle: "Discover & evaluate innovative ideas",
        };
      case "leaderboard":
        return {
          title: "Leaderboard",
          subtitle: "Top-rated startup concepts",
        };
      case "submit":
        return {
          title: "Submit Idea",
          subtitle: "Share your innovative concept",
        };
    }
  };

  const screenConfig = getScreenConfig();

  return (
    <div className={`max-w-md mx-auto bg-background min-h-screen shadow-xl relative ${isDarkMode ? "dark" : ""}`}>
      {/* Status Bar */}
      <div className="bg-primary h-6"></div>
      
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{screenConfig.title}</h1>
            <p className="text-primary-foreground/80 text-sm">{screenConfig.subtitle}</p>
          </div>
          <div className="flex space-x-3">
            {currentScreen === "ideas" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy("rating")}>
                    Sort by Rating
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("votes")}>
                    Sort by Votes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("newest")}>
                    Sort by Newest
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button variant="secondary" size="sm" onClick={toggleDarkMode} className="bg-indigo-600 hover:bg-indigo-700">
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {currentScreen === "ideas" && (
          <div className="fade-in">
            <StatsBar stats={stats} />
            
            {/* Sort Tabs */}
            <div className="bg-background border-b border-border px-4 py-3">
              <div className="flex space-x-1">
                <Button
                  variant={sortBy === "rating" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("rating")}
                  className="text-sm"
                >
                  By Rating
                </Button>
                <Button
                  variant={sortBy === "votes" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("votes")}
                  className="text-sm"
                >
                  By Votes
                </Button>
                <Button
                  variant={sortBy === "newest" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("newest")}
                  className="text-sm"
                >
                  Newest
                </Button>
              </div>
            </div>

            {/* Ideas List */}
            <div className="p-4 space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-card rounded-lg border p-4 animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mb-3"></div>
                      <div className="h-3 bg-muted rounded w-full mb-1"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : sortedIdeas.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-primary bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No ideas yet</h3>
                  <p className="text-muted-foreground mb-4">Be the first to share your innovative startup concept!</p>
                  <Button onClick={() => setCurrentScreen("submit")}>
                    Submit First Idea
                  </Button>
                </div>
              ) : (
                sortedIdeas.map((idea) => (
                  <IdeaCard key={idea.id} idea={idea} onVoteSuccess={refetch} />
                ))
              )}
            </div>
          </div>
        )}

        {currentScreen === "leaderboard" && (
          <div className="fade-in">
            <Leaderboard ideas={sortedIdeas} />
          </div>
        )}

        {currentScreen === "submit" && (
          <div className="fade-in">
            <IdeaSubmissionForm onSuccess={handleIdeaSubmitted} />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation currentScreen={currentScreen} onScreenChange={setCurrentScreen} />

      {/* Floating Action Button */}
      {currentScreen !== "submit" && (
        <Button
          onClick={() => setCurrentScreen("submit")}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
