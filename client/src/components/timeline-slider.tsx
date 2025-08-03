import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { format, addHours, differenceInHours } from 'date-fns';

export function TimelineSlider() {
  const {
    timeRange,
    isPlaying,
    setTimeRange,
    togglePlay,
    moveTimeForward,
    moveTimeBackward,
    resetToNow
  } = useDashboardStore();

  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  // 30-day window (15 days before and after today)
  const windowStart = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
  const windowEnd = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  const totalHours = differenceInHours(windowEnd, windowStart);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      moveTimeForward();
    }, 1000); // Move forward every second

    return () => clearInterval(interval);
  }, [isPlaying, moveTimeForward]);

  const getPositionFromTime = useCallback((time: Date): number => {
    const hoursFromStart = differenceInHours(time, windowStart);
    return (hoursFromStart / totalHours) * 100;
  }, [windowStart, totalHours]);

  const getTimeFromPosition = useCallback((position: number): Date => {
    const hoursFromStart = (position / 100) * totalHours;
    return addHours(windowStart, hoursFromStart);
  }, [windowStart, totalHours]);

  const handleMouseDown = useCallback((event: React.MouseEvent, handle: 'start' | 'end') => {
    event.preventDefault();
    setIsDragging(handle);
    setDragOffset(0);
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging) return;

    const slider = document.getElementById('timeline-slider');
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    const position = ((event.clientX - rect.left) / rect.width) * 100;
    const clampedPosition = Math.max(0, Math.min(100, position));
    
    const newTime = getTimeFromPosition(clampedPosition);

    if (isDragging === 'start') {
      if (newTime < timeRange.end) {
        setTimeRange({ start: newTime, end: timeRange.end });
      }
    } else if (isDragging === 'end') {
      if (newTime > timeRange.start) {
        setTimeRange({ start: timeRange.start, end: newTime });
      }
    }
  }, [isDragging, timeRange, setTimeRange, getTimeFromPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
    setDragOffset(0);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const startPosition = getPositionFromTime(timeRange.start);
  const endPosition = getPositionFromTime(timeRange.end);
  const duration = differenceInHours(timeRange.end, timeRange.start);

  return (
    <Card className="p-6 border-b border-slate-200 rounded-none">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Timeline Control</h2>
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <div>
              <span className="font-medium">Range:</span>
              <span className="ml-2">
                {format(timeRange.start, 'MMM dd, yyyy HH:mm')} - {format(timeRange.end, 'MMM dd, yyyy HH:mm')}
              </span>
            </div>
            <div>
              <span className="font-medium">Duration:</span>
              <span className="ml-2">{duration} hours</span>
            </div>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="relative">
          <div 
            id="timeline-slider"
            className="h-12 bg-slate-100 rounded-lg relative overflow-hidden cursor-pointer"
          >
            {/* Time Labels */}
            <div className="absolute top-0 left-0 right-0 h-6 flex justify-between items-center px-4 text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
              <span>{format(windowStart, 'MMM dd')}</span>
              <span>{format(addHours(windowStart, totalHours * 0.2), 'MMM dd')}</span>
              <span>{format(addHours(windowStart, totalHours * 0.4), 'MMM dd')}</span>
              <span>{format(addHours(windowStart, totalHours * 0.6), 'MMM dd')}</span>
              <span>{format(addHours(windowStart, totalHours * 0.8), 'MMM dd')}</span>
              <span>{format(windowEnd, 'MMM dd')}</span>
            </div>

            {/* Selected Range Highlight */}
            <div 
              className="absolute top-6 h-6 bg-blue-200 rounded"
              style={{
                left: `${startPosition}%`,
                width: `${endPosition - startPosition}%`
              }}
            />

            {/* Start Handle */}
            <div 
              className="absolute top-6 h-6 flex items-center z-10"
              style={{ left: `${startPosition}%` }}
            >
              <div 
                className="w-4 h-6 bg-blue-500 rounded cursor-pointer shadow-sm border-2 border-white hover:bg-blue-600 transition-colors"
                onMouseDown={(e) => handleMouseDown(e, 'start')}
                title="Drag to adjust start time"
              />
            </div>

            {/* End Handle */}
            <div 
              className="absolute top-6 h-6 flex items-center z-10"
              style={{ left: `${endPosition}%` }}
            >
              <div 
                className="w-4 h-6 bg-blue-500 rounded cursor-pointer shadow-sm border-2 border-white hover:bg-blue-600 transition-colors"
                onMouseDown={(e) => handleMouseDown(e, 'end')}
                title="Drag to adjust end time"
              />
            </div>
          </div>

          {/* Hour Markers */}
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </div>

        {/* Timeline Controls */}
        <div className="flex items-center justify-center space-x-4 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={moveTimeBackward}
            title="Previous Hour"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlay}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={moveTimeForward}
            title="Next Hour"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          
          <div className="h-6 w-px bg-slate-300" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToNow}
            title="Reset to Now"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Now
          </Button>
        </div>
      </div>
    </Card>
  );
}
