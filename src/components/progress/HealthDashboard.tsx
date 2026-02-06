import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Activity, Droplet, Flame, Scale, Edit, Save } from "lucide-react";

interface HealthDashboardProps {
  currentWeight?: number;
  height?: number;
  bodyFatPercent?: number;
  bloodGlucose?: number;
  ketoneLevel?: number;
  onSave?: (data: HealthMetrics) => void;
}

interface HealthMetrics {
  bodyFatPercent: number;
  bloodGlucose: number;
  ketoneLevel: number;
}

export const HealthDashboard = ({ 
  currentWeight = 0, 
  height = 0,
  bodyFatPercent = 0,
  bloodGlucose = 0,
  ketoneLevel = 0,
  onSave
}: HealthDashboardProps) => {
  const [editing, setEditing] = useState(false);
  const [metrics, setMetrics] = useState({
    bodyFatPercent,
    bloodGlucose,
    ketoneLevel
  });

  // Calculate BMI (weight in lbs, height in inches)
  const heightInInches = height || 68; // default 5'8"
  const bmi = currentWeight && heightInInches 
    ? ((currentWeight / (heightInInches * heightInInches)) * 703).toFixed(1)
    : '—';

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
    if (bmiValue < 25) return { label: 'Normal', color: 'text-green-500' };
    if (bmiValue < 30) return { label: 'Overweight', color: 'text-amber-500' };
    return { label: 'Obese', color: 'text-red-500' };
  };

  const getKetoneStatus = (level: number) => {
    if (level < 0.5) return { label: 'Not in ketosis', color: 'text-muted-foreground' };
    if (level < 1.5) return { label: 'Light ketosis', color: 'text-blue-500' };
    if (level < 3.0) return { label: 'Optimal ketosis', color: 'text-green-500' };
    return { label: 'Deep ketosis', color: 'text-purple-500' };
  };

  const bmiCategory = getBMICategory(parseFloat(bmi as string) || 0);
  const ketoneStatus = getKetoneStatus(metrics.ketoneLevel);

  const handleSave = () => {
    onSave?.(metrics);
    setEditing(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Health & Biometrics
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editing ? handleSave() : setEditing(true)}
          >
            {editing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* BMI */}
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <Scale className="h-6 w-6 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{bmi}</div>
            <div className="text-xs text-muted-foreground">BMI</div>
            <div className={`text-xs mt-1 ${bmiCategory.color}`}>{bmiCategory.label}</div>
          </div>

          {/* Body Fat */}
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <Activity className="h-6 w-6 mx-auto text-primary mb-2" />
            {editing ? (
              <Input
                type="number"
                value={metrics.bodyFatPercent || ''}
                onChange={(e) => setMetrics(m => ({ ...m, bodyFatPercent: parseFloat(e.target.value) || 0 }))}
                className="h-8 text-center"
                placeholder="0"
              />
            ) : (
              <div className="text-2xl font-bold">{metrics.bodyFatPercent || '—'}%</div>
            )}
            <div className="text-xs text-muted-foreground">Body Fat</div>
          </div>

          {/* Blood Glucose */}
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <Droplet className="h-6 w-6 mx-auto text-red-400 mb-2" />
            {editing ? (
              <Input
                type="number"
                value={metrics.bloodGlucose || ''}
                onChange={(e) => setMetrics(m => ({ ...m, bloodGlucose: parseFloat(e.target.value) || 0 }))}
                className="h-8 text-center"
                placeholder="0"
              />
            ) : (
              <div className="text-2xl font-bold">{metrics.bloodGlucose || '—'}</div>
            )}
            <div className="text-xs text-muted-foreground">Blood Glucose (mg/dL)</div>
          </div>

          {/* Ketone Level */}
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <Flame className="h-6 w-6 mx-auto text-orange-500 mb-2" />
            {editing ? (
              <Input
                type="number"
                step="0.1"
                value={metrics.ketoneLevel || ''}
                onChange={(e) => setMetrics(m => ({ ...m, ketoneLevel: parseFloat(e.target.value) || 0 }))}
                className="h-8 text-center"
                placeholder="0"
              />
            ) : (
              <div className="text-2xl font-bold">{metrics.ketoneLevel || '—'}</div>
            )}
            <div className="text-xs text-muted-foreground">Ketone (mmol/L)</div>
            {!editing && metrics.ketoneLevel > 0 && (
              <div className={`text-xs mt-1 ${ketoneStatus.color}`}>{ketoneStatus.label}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
