import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TrendingUp,
  Save,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { impactApi, ImpactNumber } from "@/lib/api/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function ImpactNumbersManagement() {
  const [languageFilter, setLanguageFilter] = useState<string>("en");
  const [editingNumbers, setEditingNumbers] = useState<Partial<ImpactNumber>[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['impactNumbers', languageFilter],
    queryFn: () => impactApi.getAll(languageFilter),
    retry: 1,
  });

  // Initialize editing numbers when data loads
  useEffect(() => {
    if (data?.data && !isError) {
      setEditingNumbers(data.data);
      setHasChanges(false);
    } else if (!data?.data && !isLoading && !isError) {
      setEditingNumbers([]);
      setHasChanges(false);
    }
  }, [data, languageFilter, isError, isLoading]);

  const bulkUpdateMutation = useMutation({
    mutationFn: (impactNumbers: Partial<ImpactNumber>[]) => impactApi.bulkUpdate(impactNumbers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impactNumbers'] });
      toast.success('Impact numbers updated successfully');
      setHasChanges(false);
    },
  });

  const updateNumber = (index: number, field: string, value: any) => {
    const numbers = [...editingNumbers];
    numbers[index] = { ...numbers[index], [field]: value };
    setEditingNumbers(numbers);
    setHasChanges(true);
  };

  const addNumber = () => {
    setEditingNumbers([
      ...editingNumbers,
      {
        label: '',
        value: 0,
        suffix: '+',
        language: languageFilter as any,
        isActive: true,
        displayOrder: editingNumbers.length,
      },
    ]);
    setHasChanges(true);
  };

  const removeNumber = (index: number) => {
    const numbers = editingNumbers.filter((_, i) => i !== index);
    setEditingNumbers(numbers);
    setHasChanges(true);
  };

  const handleSave = () => {
    bulkUpdateMutation.mutate(editingNumbers);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Impact Numbers Management</h1>
            <p className="page-description">
              Manage impact statistics displayed on the homepage
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="gu">Gujarati</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={addNumber}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Number
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || bulkUpdateMutation.isPending}
            >
              {(bulkUpdateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Impact Numbers ({languageFilter.toUpperCase()})</CardTitle>
          <CardDescription>
            These numbers are displayed on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {editingNumbers.map((number, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4">
                      <Label>Label</Label>
                      <Input
                        value={number.label || ''}
                        onChange={(e) => updateNumber(index, 'label', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Value</Label>
                      <Input
                        type="number"
                        value={number.value || 0}
                        onChange={(e) => updateNumber(index, 'value', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Suffix</Label>
                      <Input
                        value={number.suffix || '+'}
                        onChange={(e) => updateNumber(index, 'suffix', e.target.value)}
                        placeholder="+"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Order</Label>
                      <Input
                        type="number"
                        value={number.displayOrder || 0}
                        onChange={(e) => updateNumber(index, 'displayOrder', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          checked={number.isActive}
                          onChange={(e) => updateNumber(index, 'isActive', e.target.checked)}
                          className="rounded"
                        />
                        <Label>Active</Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeNumber(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              <Button
                variant="outline"
                className="w-full"
                onClick={addNumber}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Impact Number
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
