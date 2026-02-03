import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, TrendingDown, TrendingUp, Minus } from "lucide-react";

interface BodyCompositionProps {
  bodyFat?: number;
  muscleMass?: number;
  waist?: number;
  hips?: number;
  chest?: number;
  onUpdate?: (data: {
    bodyFat?: number;
    muscleMass?: number;
    waist?: number;
    hips?: number;
    chest?: number;
  }) => void;
}

export const BodyComposition = ({ 
  bodyFat = 0, 
  muscleMass = 0, 
  waist = 0,
  hips = 0,
  chest = 0,
  onUpdate 
}: BodyCompositionProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newBodyFat, setNewBodyFat] = useState(bodyFat.toString());
  const [newMuscleMass, setNewMuscleMass] = useState(muscleMass.toString());
  const [newWaist, setNewWaist] = useState(waist.toString());
  const [newHips, setNewHips] = useState(hips.toString());
  const [newChest, setNewChest] = useState(chest.toString());

  const handleSave = () => {
    onUpdate?.({
      bodyFat: parseFloat(newBodyFat) || 0,
      muscleMass: parseFloat(newMuscleMass) || 0,
      waist: parseFloat(newWaist) || 0,
      hips: parseFloat(newHips) || 0,
      chest: parseFloat(newChest) || 0,
    });
    setDialogOpen(false);
  };

  const stats = [
    { label: 'Body Fat', value: bodyFat, unit: '%', trend: 'down' },
    { label: 'Muscle Mass', value: muscleMass, unit: 'lbs', trend: 'up' },
    { label: 'Waist', value: waist, unit: 'in', trend: 'down' },
    { label: 'Hips', value: hips, unit: 'in', trend: 'neutral' },
    { label: 'Chest', value: chest, unit: 'in', trend: 'neutral' },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Body Composition</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Update
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Body Composition</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Body Fat (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newBodyFat}
                    onChange={(e) => setNewBodyFat(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Muscle Mass (lbs)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newMuscleMass}
                    onChange={(e) => setNewMuscleMass(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Waist (in)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newWaist}
                    onChange={(e) => setNewWaist(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Hips (in)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newHips}
                    onChange={(e) => setNewHips(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Chest (in)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newChest}
                    onChange={(e) => setNewChest(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">Save Measurements</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-xl font-bold">{stat.value || '-'}</span>
                <span className="text-sm text-muted-foreground">{stat.unit}</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                {stat.value > 0 && getTrendIcon(stat.trend)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
