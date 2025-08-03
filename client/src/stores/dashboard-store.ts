import { create } from 'zustand';
import { DashboardStore, TimeRange, Polygon, DataSource, ColorRule } from '@/types/dashboard';

const initialTimeRange: TimeRange = {
  start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
  end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
};

const defaultDataSource: DataSource = {
  id: 'open-meteo',
  name: 'Open-Meteo',
  active: true,
  field: 'temperature_2m',
  unit: '°C',
  colorRules: [
    {
      id: 'cold',
      operator: '<',
      value: 10,
      color: '#ef4444',
      label: '< 10°C'
    },
    {
      id: 'medium',
      operator: '>=',
      value: 10,
      color: '#3b82f6',
      label: '10-25°C'
    },
    {
      id: 'warm',
      operator: '>=',
      value: 25,
      color: '#22c55e',
      label: '>= 25°C'
    }
  ]
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Initial state
  timeRange: {
    start: new Date(),
    end: new Date(Date.now() + 3600000) // 1 hour from now
  },
  isPlaying: false,
  mapCenter: [52.52, 13.41], // Berlin coordinates
  mapZoom: 10,
  isDrawing: false,
  currentDrawingPoints: [],
  polygons: [],
  selectedPolygonId: null,
  dataSources: [defaultDataSource],
  sidebarOpen: true,
  loading: false,
  error: null,

  // Time management actions
  setTimeRange: (range: TimeRange) => set({ timeRange: range }),
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  moveTimeForward: () => set((state) => ({
    timeRange: {
      start: new Date(state.timeRange.start.getTime() + 3600000),
      end: new Date(state.timeRange.end.getTime() + 3600000)
    }
  })),
  
  moveTimeBackward: () => set((state) => ({
    timeRange: {
      start: new Date(state.timeRange.start.getTime() - 3600000),
      end: new Date(state.timeRange.end.getTime() - 3600000)
    }
  })),
  
  resetToNow: () => set({
    timeRange: {
      start: new Date(),
      end: new Date(Date.now() + 3600000)
    }
  }),

  // Map and drawing actions
  setMapCenter: (center: [number, number]) => set({ mapCenter: center }),
  
  setMapZoom: (zoom: number) => set({ mapZoom: zoom }),
  
  startDrawing: () => set({ 
    isDrawing: true, 
    currentDrawingPoints: [],
    selectedPolygonId: null 
  }),
  
  addDrawingPoint: (point: [number, number]) => set((state) => ({
    currentDrawingPoints: [...state.currentDrawingPoints, point]
  })),
  
  finishDrawing: () => {
    const state = get();
    if (state.currentDrawingPoints.length >= 3) {
      const centroid = calculateCentroid(state.currentDrawingPoints);
      const newPolygon: Polygon = {
        id: generateId(),
        name: `Polygon ${state.polygons.length + 1}`,
        points: state.currentDrawingPoints,
        dataSourceId: state.dataSources[0]?.id || '',
        color: state.dataSources[0]?.colorRules[0]?.color || '#3b82f6',
        centroid
      };
      
      set((state) => ({
        polygons: [...state.polygons, newPolygon],
        isDrawing: false,
        currentDrawingPoints: []
      }));
    }
  },
  
  cancelDrawing: () => set({ 
    isDrawing: false, 
    currentDrawingPoints: [] 
  }),

  // Polygon actions
  addPolygon: (polygon: Omit<Polygon, 'id'>) => set((state) => ({
    polygons: [...state.polygons, { ...polygon, id: generateId() }]
  })),
  
  deletePolygon: (id: string) => set((state) => ({
    polygons: state.polygons.filter(p => p.id !== id),
    selectedPolygonId: state.selectedPolygonId === id ? null : state.selectedPolygonId
  })),
  
  selectPolygon: (id: string | null) => set({ selectedPolygonId: id }),
  
  updatePolygonValue: (id: string, value: number) => set((state) => ({
    polygons: state.polygons.map(p => 
      p.id === id ? { ...p, currentValue: value } : p
    )
  })),

  // Data source actions
  addDataSource: (dataSource: Omit<DataSource, 'id'>) => set((state) => ({
    dataSources: [...state.dataSources, { ...dataSource, id: generateId() }]
  })),
  
  updateDataSource: (id: string, updates: Partial<DataSource>) => set((state) => ({
    dataSources: state.dataSources.map(ds => 
      ds.id === id ? { ...ds, ...updates } : ds
    )
  })),
  
  deleteDataSource: (id: string) => set((state) => ({
    dataSources: state.dataSources.filter(ds => ds.id !== id)
  })),
  
  addColorRule: (dataSourceId: string, rule: Omit<ColorRule, 'id'>) => set((state) => ({
    dataSources: state.dataSources.map(ds => 
      ds.id === dataSourceId 
        ? { ...ds, colorRules: [...ds.colorRules, { ...rule, id: generateId() }] }
        : ds
    )
  })),
  
  updateColorRule: (dataSourceId: string, ruleId: string, updates: Partial<ColorRule>) => set((state) => ({
    dataSources: state.dataSources.map(ds => 
      ds.id === dataSourceId 
        ? { 
            ...ds, 
            colorRules: ds.colorRules.map(rule => 
              rule.id === ruleId ? { ...rule, ...updates } : rule
            ) 
          }
        : ds
    )
  })),
  
  deleteColorRule: (dataSourceId: string, ruleId: string) => set((state) => ({
    dataSources: state.dataSources.map(ds => 
      ds.id === dataSourceId 
        ? { ...ds, colorRules: ds.colorRules.filter(rule => rule.id !== ruleId) }
        : ds
    )
  })),

  // UI state actions
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error })
}));

// Helper functions
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function calculateCentroid(points: [number, number][]): [number, number] {
  const lat = points.reduce((sum, point) => sum + point[0], 0) / points.length;
  const lng = points.reduce((sum, point) => sum + point[1], 0) / points.length;
  return [lat, lng];
}
