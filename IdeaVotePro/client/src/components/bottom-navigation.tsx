import { Button } from "@/components/ui/button";
import { List, Trophy, Plus } from "lucide-react";

type Screen = "ideas" | "leaderboard" | "submit";

interface BottomNavigationProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export function BottomNavigation({ currentScreen, onScreenChange }: BottomNavigationProps) {
  const navItems = [
    {
      id: "ideas" as const,
      label: "Ideas",
      icon: List,
    },
    {
      id: "leaderboard" as const,
      label: "Leaderboard",
      icon: Trophy,
    },
    {
      id: "submit" as const,
      label: "Submit",
      icon: Plus,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-background border-t border-border shadow-lg">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onScreenChange(item.id)}
              className={`flex flex-col items-center py-2 px-4 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
