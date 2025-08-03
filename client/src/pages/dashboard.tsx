import { useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { TimelineSlider } from '@/components/timeline-slider';
import { InteractiveMap } from '@/components/interactive-map';
import { useDashboardStore } from '@/stores/dashboard-store';

export default function Dashboard() {
  const { sidebarOpen } = useDashboardStore();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC key cancels drawing
      if (event.key === 'Escape') {
        const { isDrawing, cancelDrawing } = useDashboardStore.getState();
        if (isDrawing) {
          cancelDrawing();
        }
      }
      
      // Enter key finishes drawing
      if (event.key === 'Enter') {
        const { isDrawing, finishDrawing } = useDashboardStore.getState();
        if (isDrawing) {
          finishDrawing();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'ml-80' : 'ml-0'
      }`}>
        <TimelineSlider />
        <InteractiveMap />
      </div>
    </div>
  );
}
