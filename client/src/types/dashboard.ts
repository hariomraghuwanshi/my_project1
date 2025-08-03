export interface TimeRange {
  start: Date;
  end: Date;
}

export interface Polygon {
  id: string;
  name: string;
  points: [number, number][];
  dataSourceId: string;
  color: string;
  currentValue?: number;
  centroid: [number, number];
}

export interface ColorRule {
  id: string;
  operator: '<' | '>' | '<=' | '>=';
  value: number;
  color: string;
  label?: string;
}

export interface DataSource {
  id: string;
  name: string;
  active: boolean;
  field: string;
  unit: string;
  colorRules: ColorRule[];
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
}

export interface DashboardState {
  // Time management
  timeRange: TimeRange;
  isPlaying: boolean;
  
  // Map and drawing
  mapCenter: [number, number];
  mapZoom: number;
  isDrawing: boolean;
  currentDrawingPoints: [number, number][];
  
  // Polygons
  polygons: Polygon[];
  selectedPolygonId: string | null;
  
  // Data sources
  dataSources: DataSource[];
  
  // UI state
  sidebarOpen: boolean;
  loading: boolean;
  error: string | null;
}

export interface DashboardActions {
  // Time management
  setTimeRange: (range: TimeRange) => void;
  togglePlay: () => void;
  moveTimeForward: () => void;
  moveTimeBackward: () => void;
  resetToNow: () => void;
  
  // Map and drawing
  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;
  startDrawing: () => void;
  addDrawingPoint: (point: [number, number]) => void;
  finishDrawing: () => void;
  cancelDrawing: () => void;
  
  // Polygons
  addPolygon: (polygon: Omit<Polygon, 'id'>) => void;
  deletePolygon: (id: string) => void;
  selectPolygon: (id: string | null) => void;
  updatePolygonValue: (id: string, value: number) => void;
  
  // Data sources
  addDataSource: (dataSource: Omit<DataSource, 'id'>) => void;
  updateDataSource: (id: string, updates: Partial<DataSource>) => void;
  deleteDataSource: (id: string) => void;
  addColorRule: (dataSourceId: string, rule: Omit<ColorRule, 'id'>) => void;
  updateColorRule: (dataSourceId: string, ruleId: string, updates: Partial<ColorRule>) => void;
  deleteColorRule: (dataSourceId: string, ruleId: string) => void;
  
  // UI state
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export type DashboardStore = DashboardState & DashboardActions;
