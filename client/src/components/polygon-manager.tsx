import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PolygonManager() {
  const { 
    polygons, 
    selectedPolygonId, 
    selectPolygon, 
    deletePolygon,
    dataSources 
  } = useDashboardStore();
  
  const { toast } = useToast();

  const handleDeletePolygon = (id: string, name: string) => {
    deletePolygon(id);
    toast({
      title: "Polygon Deleted",
      description: `${name} has been removed from the map.`,
    });
  };

  const getPolygonDataSource = (dataSourceId: string) => {
    return dataSources.find(ds => ds.id === dataSourceId);
  };

  const formatValue = (value: number | undefined, unit: string) => {
    if (value === undefined) return 'Loading...';
    return `${value.toFixed(1)}${unit}`;
  };

  return (
    <div className="p-6 flex-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Polygons</h2>
        <Badge variant="secondary" className="text-sm">
          {polygons.length}
        </Badge>
      </div>

      {polygons.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <div className="text-sm">No polygons created yet</div>
          <div className="text-xs mt-1">Use the drawing tool to create polygons on the map</div>
        </div>
      ) : (
        <div className="space-y-2">
          {polygons.map((polygon) => {
            const dataSource = getPolygonDataSource(polygon.dataSourceId);
            const isSelected = selectedPolygonId === polygon.id;
            
            return (
              <div
                key={polygon.id}
                className={`bg-white border rounded-lg p-3 transition-colors cursor-pointer ${
                  isSelected 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-slate-200 hover:border-blue-300'
                }`}
                onClick={() => selectPolygon(isSelected ? null : polygon.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3 border border-white shadow-sm"
                      style={{ backgroundColor: polygon.color }}
                    />
                    <div>
                      <div className="font-medium text-slate-900 text-sm">
                        {polygon.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {polygon.points.length} points
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-slate-400 hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectPolygon(isSelected ? null : polygon.id);
                      }}
                      title={isSelected ? "Hide polygon" : "Show polygon"}
                    >
                      {isSelected ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-slate-400 hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement polygon editing
                        toast({
                          title: "Feature Coming Soon",
                          description: "Polygon editing will be available in a future update.",
                        });
                      }}
                      title="Edit polygon"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-slate-400 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePolygon(polygon.id, polygon.name);
                      }}
                      title="Delete polygon"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {/* Current value display */}
                <div className="mt-2 text-xs">
                  <span className="text-slate-500">Current value:</span>
                  <span className="font-medium text-slate-900 ml-1">
                    {formatValue(polygon.currentValue, dataSource?.unit || '')}
                  </span>
                </div>
                
                {/* Data source info */}
                {dataSource && (
                  <div className="mt-1 text-xs text-slate-500">
                    Source: {dataSource.name} ({dataSource.field})
                  </div>
                )}
                
                {/* Polygon coordinates summary */}
                <div className="mt-1 text-xs text-slate-400">
                  Center: {polygon.centroid[0].toFixed(4)}, {polygon.centroid[1].toFixed(4)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
