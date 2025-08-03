import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Polygon as LeafletPolygon } from 'react-leaflet';
import { Map as LeafletMap, LatLng } from 'leaflet';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Pen, 
  Check, 
  X, 
  Crosshair,
  Loader2 
} from 'lucide-react';
import { fetchWeatherData, formatDateForAPI, getAverageValueInRange } from '@/services/open-meteo';
import { useQuery } from '@tanstack/react-query';

function MapEvents() {
  const {
    isDrawing,
    currentDrawingPoints,
    addDrawingPoint,
    finishDrawing,
    setMapCenter
  } = useDashboardStore();

  const map = useMapEvents({
    click: (e) => {
      if (isDrawing) {
        addDrawingPoint([e.latlng.lat, e.latlng.lng]);
      }
    },
    moveend: () => {
      setMapCenter([map.getCenter().lat, map.getCenter().lng]);
    }
  });

  // Apply drawing cursor when in drawing mode
  useEffect(() => {
    if (isDrawing) {
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.getContainer().style.cursor = '';
    }
  }, [isDrawing, map]);

  return null;
}

function PolygonLayer() {
  const { polygons, dataSources, timeRange, updatePolygonValue } = useDashboardStore();
  const { toast } = useToast();

  // Fetch weather data for all polygons
  const polygonQueries = useQuery({
    queryKey: ['weather-data', polygons.map(p => p.id), timeRange.start, timeRange.end],
    queryFn: async () => {
      const results = await Promise.allSettled(
        polygons.map(async (polygon) => {
          try {
            const data = await fetchWeatherData({
              latitude: polygon.centroid[0],
              longitude: polygon.centroid[1],
              startDate: formatDateForAPI(timeRange.start),
              endDate: formatDateForAPI(timeRange.end),
              hourly: ['temperature_2m']
            });

            const averageValue = getAverageValueInRange(
              data,
              timeRange.start,
              timeRange.end,
              'temperature_2m'
            );

            if (averageValue !== null) {
              updatePolygonValue(polygon.id, averageValue);
            }

            return { polygonId: polygon.id, value: averageValue, data };
          } catch (error) {
            console.error(`Failed to fetch data for polygon ${polygon.id}:`, error);
            return { polygonId: polygon.id, value: null, error };
          }
        })
      );

      return results;
    },
    enabled: polygons.length > 0 && !!timeRange.start && !!timeRange.end,
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getPolygonColor = (polygon: any) => {
    const dataSource = dataSources.find(ds => ds.id === polygon.dataSourceId);
    
    if (!dataSource || polygon.currentValue === undefined) {
      return '#94a3b8'; // Default gray
    }

    // Find the appropriate color rule
    const sortedRules = [...dataSource.colorRules].sort((a, b) => {
      if (a.operator.includes('<') && b.operator.includes('>')) return -1;
      if (a.operator.includes('>') && b.operator.includes('<')) return 1;
      return a.value - b.value;
    });

    for (const rule of sortedRules) {
      const value = polygon.currentValue;
      
      switch (rule.operator) {
        case '<':
          if (value < rule.value) return rule.color;
          break;
        case '<=':
          if (value <= rule.value) return rule.color;
          break;
        case '>':
          if (value > rule.value) return rule.color;
          break;
        case '>=':
          if (value >= rule.value) return rule.color;
          break;
      }
    }

    return dataSource.colorRules[0]?.color || '#94a3b8';
  };

  return (
    <>
      {polygons.map((polygon) => (
        <LeafletPolygon
          key={polygon.id}
          positions={polygon.points}
          pathOptions={{
            fillColor: getPolygonColor(polygon),
            fillOpacity: 0.4,
            color: getPolygonColor(polygon),
            weight: 2,
          }}
        />
      ))}
    </>
  );
}

function CurrentDrawing() {
  const { currentDrawingPoints } = useDashboardStore();

  if (currentDrawingPoints.length < 2) return null;

  return (
    <LeafletPolygon
      positions={currentDrawingPoints}
      pathOptions={{
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        color: '#3b82f6',
        weight: 2,
        dashArray: '5, 5'
      }}
    />
  );
}

export function InteractiveMap() {
  const {
    mapCenter,
    mapZoom,
    isDrawing,
    currentDrawingPoints,
    startDrawing,
    finishDrawing,
    cancelDrawing,
    setMapCenter,
    dataSources,
    loading
  } = useDashboardStore();

  const { toast } = useToast();
  const mapRef = useRef<LeafletMap>(null);

  const handleStartDrawing = () => {
    startDrawing();
    toast({
      title: "Drawing Mode Active",
      description: "Click on the map to add points. Minimum 3 points, maximum 12 points.",
    });
  };

  const handleFinishDrawing = () => {
    if (currentDrawingPoints.length < 3) {
      toast({
        title: "Invalid Polygon",
        description: "A polygon must have at least 3 points.",
        variant: "destructive",
      });
      return;
    }

    if (currentDrawingPoints.length > 12) {
      toast({
        title: "Too Many Points",
        description: "A polygon can have at most 12 points.",
        variant: "destructive",
      });
      return;
    }

    finishDrawing();
    toast({
      title: "Polygon Created",
      description: "Your polygon has been successfully created.",
    });
  };

  const handleCancelDrawing = () => {
    cancelDrawing();
    toast({
      title: "Drawing Cancelled",
      description: "Polygon drawing has been cancelled.",
    });
  };

  const handleCenterMap = () => {
    if (mapRef.current) {
      mapRef.current.setView(mapCenter, mapZoom);
    }
  };

  // Get active data source for legend
  const activeDataSource = dataSources.find(ds => ds.active);

  return (
    <div className="flex-1 relative">
      {/* Map Tools Overlay */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
        {/* Drawing Tools */}
        <Card className="p-2">
          <div className="flex flex-col space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartDrawing}
              disabled={isDrawing}
              title="Draw Polygon"
            >
              <Pen className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFinishDrawing}
              disabled={!isDrawing || currentDrawingPoints.length < 3}
              title="Finish Drawing"
            >
              <Check className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelDrawing}
              disabled={!isDrawing}
              title="Cancel Drawing"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="h-px bg-slate-200 my-1" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCenterMap}
              title="Center Map"
            >
              <Crosshair className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Map Legend */}
        {activeDataSource && (
          <Card className="p-3">
            <div className="text-sm font-medium text-slate-900 mb-2">
              {activeDataSource.field} ({activeDataSource.unit})
            </div>
            <div className="space-y-1 text-xs">
              {activeDataSource.colorRules.map((rule) => (
                <div key={rule.id} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded mr-2"
                    style={{ backgroundColor: rule.color }}
                  />
                  <span>{rule.label || `${rule.operator} ${rule.value}${activeDataSource.unit}`}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Drawing Instructions */}
      {isDrawing && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-black bg-opacity-75 text-white p-3 rounded-lg text-sm max-w-xs">
          <div className="font-medium mb-1">Drawing Mode Active</div>
          <div className="text-xs text-gray-300">
            Click to add points ({currentDrawingPoints.length}/12 max)<br />
            {currentDrawingPoints.length >= 3 && "Click finish or press Enter to complete"}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[1000]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
            <div className="text-sm text-slate-600">Loading map data...</div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <MapContainer
        ref={mapRef}
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapEvents />
        <PolygonLayer />
        <CurrentDrawing />
      </MapContainer>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 z-[1000]">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6 text-slate-600">
            <div>
              <span className="font-medium">Map Center:</span>
              <span className="ml-2">
                {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}
              </span>
            </div>
            <div>
              <span className="font-medium">Data Source:</span>
              <span className="ml-2">{activeDataSource?.name || 'None'}</span>
            </div>
            <div>
              <span className="font-medium">Mode:</span>
              <span className="ml-2">{isDrawing ? 'Drawing' : 'Navigation'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <span className="text-xs">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
