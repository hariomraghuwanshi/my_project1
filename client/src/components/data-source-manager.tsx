import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDashboardStore } from '@/stores/dashboard-store';
import { DataSource, ColorRule } from '@/types/dashboard';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const OPERATORS = [
  { value: '<', label: '<' },
  { value: '<=', label: '≤' },
  { value: '>', label: '>' },
  { value: '>=', label: '≥' },
] as const;

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6b7280', // gray
];

interface ColorRuleEditorProps {
  rule: ColorRule;
  onUpdate: (updates: Partial<ColorRule>) => void;
  onDelete: () => void;
}

function ColorRuleEditor({ rule, onUpdate, onDelete }: ColorRuleEditorProps) {
  return (
    <div className="flex items-center space-x-2 bg-white p-2 rounded border">
      {/* Color indicator */}
      <div 
        className="w-4 h-4 rounded cursor-pointer border border-slate-300"
        style={{ backgroundColor: rule.color }}
        title="Click to change color"
      />
      
      {/* Operator selector */}
      <Select value={rule.operator} onValueChange={(value: any) => onUpdate({ operator: value })}>
        <SelectTrigger className="w-16 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPERATORS.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Value input */}
      <Input
        type="number"
        value={rule.value}
        onChange={(e) => onUpdate({ value: parseFloat(e.target.value) || 0 })}
        className="w-16 h-8 text-xs"
        step="0.1"
      />
      
      <span className="text-xs text-slate-500">°C</span>
      
      {/* Color picker */}
      <div className="flex space-x-1">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            className="w-4 h-4 rounded border border-slate-300 hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            onClick={() => onUpdate({ color })}
            title={color}
          />
        ))}
      </div>
      
      {/* Delete button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="h-6 w-6 p-0 text-slate-400 hover:text-red-600"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

interface DataSourceCardProps {
  dataSource: DataSource;
}

function DataSourceCard({ dataSource }: DataSourceCardProps) {
  const { 
    updateDataSource, 
    deleteDataSource, 
    addColorRule, 
    updateColorRule, 
    deleteColorRule 
  } = useDashboardStore();
  
  const { toast } = useToast();

  const handleAddColorRule = () => {
    const newRule: Omit<ColorRule, 'id'> = {
      operator: '>',
      value: 20,
      color: PRESET_COLORS[dataSource.colorRules.length % PRESET_COLORS.length],
      label: ''
    };
    
    addColorRule(dataSource.id, newRule);
  };

  const handleUpdateColorRule = (ruleId: string, updates: Partial<ColorRule>) => {
    updateColorRule(dataSource.id, ruleId, updates);
  };

  const handleDeleteColorRule = (ruleId: string) => {
    if (dataSource.colorRules.length <= 1) {
      toast({
        title: "Cannot Delete Rule",
        description: "A data source must have at least one color rule.",
        variant: "destructive",
      });
      return;
    }
    
    deleteColorRule(dataSource.id, ruleId);
  };

  const handleToggleActive = () => {
    updateDataSource(dataSource.id, { active: !dataSource.active });
  };

  const handleUpdateField = (field: string) => {
    updateDataSource(dataSource.id, { field });
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${dataSource.active ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="font-medium text-slate-900">{dataSource.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={dataSource.active ? "default" : "secondary"}>
            {dataSource.active ? "Active" : "Inactive"}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleActive}
            className="h-6 px-2 text-xs"
          >
            {dataSource.active ? "Disable" : "Enable"}
          </Button>
        </div>
      </div>
      
      {/* Field Selection */}
      <div className="mb-3">
        <Label className="text-sm font-medium text-slate-700 block mb-2">Data Field</Label>
        <Select value={dataSource.field} onValueChange={handleUpdateField}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="temperature_2m">Temperature (2m)</SelectItem>
            <SelectItem value="relative_humidity_2m">Relative Humidity (2m)</SelectItem>
            <SelectItem value="surface_pressure">Surface Pressure</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Color Rules */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700 block">Color Thresholds</Label>
        
        {dataSource.colorRules.map((rule) => (
          <ColorRuleEditor
            key={rule.id}
            rule={rule}
            onUpdate={(updates) => handleUpdateColorRule(rule.id, updates)}
            onDelete={() => handleDeleteColorRule(rule.id)}
          />
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddColorRule}
          className="w-full text-xs text-blue-600 hover:text-blue-700 mt-2 p-1"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Rule
        </Button>
      </div>
    </Card>
  );
}

function AddDataSourceDialog() {
  const { addDataSource } = useDashboardStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    field: 'temperature_2m',
    unit: '°C'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a data source name.",
        variant: "destructive",
      });
      return;
    }

    const newDataSource: Omit<DataSource, 'id'> = {
      name: formData.name.trim(),
      active: true,
      field: formData.field,
      unit: formData.unit,
      colorRules: [
        {
          id: 'default',
          operator: '>=',
          value: 0,
          color: '#3b82f6',
          label: 'Default'
        }
      ]
    };

    addDataSource(newDataSource);
    setOpen(false);
    setFormData({ name: '', field: 'temperature_2m', unit: '°C' });
    
    toast({
      title: "Data Source Added",
      description: "Your data source has been successfully added.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-2 border-dashed border-slate-300 rounded-lg p-4 text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Data Source
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Data Source</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Source Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Custom Weather API"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="field">Data Field</Label>
            <Select value={formData.field} onValueChange={(field) => setFormData({ ...formData, field })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="temperature_2m">Temperature (2m)</SelectItem>
                <SelectItem value="relative_humidity_2m">Relative Humidity (2m)</SelectItem>
                <SelectItem value="surface_pressure">Surface Pressure</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="unit">Unit</Label>
            <Input
              id="unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="°C"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Source</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DataSourceManager() {
  const { dataSources } = useDashboardStore();

  return (
    <div className="p-6 border-b border-slate-200">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Data Sources</h2>
      
      {dataSources.map((dataSource) => (
        <DataSourceCard key={dataSource.id} dataSource={dataSource} />
      ))}
      
      <AddDataSourceDialog />
    </div>
  );
}
