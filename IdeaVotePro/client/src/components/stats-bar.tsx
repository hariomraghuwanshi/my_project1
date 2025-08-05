interface StatsBarProps {
  stats?: {
    totalIdeas: number;
    totalVotes: number;
    avgRating: number;
  };
}

export function StatsBar({ stats }: StatsBarProps) {
  if (!stats) {
    return (
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4">
        <div className="grid grid-cols-3 gap-4 text-center animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-8 bg-white bg-opacity-20 rounded mb-1"></div>
              <div className="h-4 bg-white bg-opacity-10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold">{stats.totalIdeas}</div>
          <div className="text-indigo-200 text-sm">Total Ideas</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{stats.totalVotes}</div>
          <div className="text-indigo-200 text-sm">Total Votes</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{stats.avgRating}</div>
          <div className="text-indigo-200 text-sm">Avg Rating</div>
        </div>
      </div>
    </div>
  );
}
