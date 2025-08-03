import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDashboardStore } from '@/stores/dashboard-store';
import { DataSourceManager } from './data-source-manager';
import { PolygonManager } from './polygon-manager';
import { BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useDashboardStore();

  return (
    <>
      {/* Sidebar Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        className={`fixed top-4 z-[1001] transition-all duration-300 ${
          sidebarOpen ? 'left-[304px]' : 'left-4'
        }`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white border-r border-slate-200 transition-transform duration-300 z-[1000]
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ width: '320px' }}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-200">
            <h1 className="text-xl font-bold text-slate-900 flex items-center">
              <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
              GeoData Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">Spatial-temporal analysis</p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <DataSourceManager />
            <PolygonManager />
          </div>
        </div>
      </div>

      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-[999] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
