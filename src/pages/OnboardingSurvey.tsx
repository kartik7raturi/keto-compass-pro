import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SurveyData {
  current_weight: string;
  goal_weight: string;
  height: string;
  age: string;
  gender: string;
  activity_level: string;
  diet_experience: string;
  exercise_frequency: string;
  health_conditions: string;
  motivation: string;
  email: string;
}

const STEPS = [
  { key: 'gender', q: 'What is your gender?', type: 'select', options: ['Male', 'Female', 'Other', 'Prefer not to say'] },
  { key: 'age', q: 'How old are you?', type: 'number', placeholder: 'Your age' },
  { key: 'height', q: 'What is your height (inches)?', type: 'number', placeholder: 'e.g. 68' },
  { key: 'current_weight', q: 'What is your current weight (lbs)?', type: 'number', placeholder: 'e.g. 180' },
  { key: 'goal_weight', q: 'What is your goal weight (lbs)?', type: 'number', placeholder: 'e.g. 150' },
  { key: 'activity_level', q: 'How active are you?', type: 'select', options: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extra Active'] },
  { key: 'exercise_frequency', q: 'How often do you exercise?', type: 'select', options: ['Never', '1-2 times/week', '3-4 times/week', '5-6 times/week', 'Daily'] },
  { key: 'diet_experience', q: 'Have you tried keto before?', type: 'select', options: ['Never', 'Tried briefly', 'A few months', 'Over a year', 'Currently on keto'] },
  { key: 'health_conditions', q: 'Any health conditions? (optional)', type: 'text', placeholder: 'e.g. Diabetes, PCOS, None' },
  { key: 'motivation', q: 'What motivates you most?', type: 'select', options: ['Lose Weight', 'More Energy', 'Better Health', 'Mental Clarity', 'Athletic Performance'] },
  { key: 'email', q: 'Enter your email to get personalized results', type: 'email', placeholder: 'your@email.com' },
];

const OnboardingSurvey = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SurveyData>({
    current_weight: '', goal_weight: '', height: '', age: '',
    gender: '', activity_level: '', diet_experience: '',
    exercise_frequency: '', health_conditions: '', motivation: '',
    email: user?.email || '',
  });
  const [submitting, setSubmitting] = useState(false);

  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const setValue = (val: string) => {
    setData({ ...data, [currentStep.key]: val });
  };

  const calcTargets = () => {
    const weight = parseFloat(data.current_weight) || 150;
    const height = parseFloat(data.height) || 68;
    const age = parseInt(data.age) || 30;
    const isMale = data.gender === 'Male';

    const bmr = isMale
      ? 10 * (weight * 0.453592) + 6.25 * (height * 2.54) - 5 * age + 5
      : 10 * (weight * 0.453592) + 6.25 * (height * 2.54) - 5 * age - 161;

    const activityMultipliers: Record<string, number> = {
      'Sedentary': 1.2, 'Lightly Active': 1.375, 'Moderately Active': 1.55,
      'Very Active': 1.725, 'Extra Active': 1.9,
    };
    const multiplier = activityMultipliers[data.activity_level] || 1.2;
    const tdee = Math.round(bmr * multiplier);
    const calories = tdee - 500;

    return {
      daily_calorie_target: Math.max(1200, calories),
      daily_carb_target: 25,
      daily_protein_target: Math.round(weight * 0.8),
      daily_fat_target: Math.round(((calories - 25 * 4 - weight * 0.8 * 4)) / 9),
    };
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    const targets = calcTargets();

    try {
      await supabase.from('user_survey_responses').upsert({
        user_id: user.id,
        current_weight: parseFloat(data.current_weight) || null,
        goal_weight: parseFloat(data.goal_weight) || null,
        height: parseFloat(data.height) || null,
        age: parseInt(data.age) || null,
        gender: data.gender,
        activity_level: data.activity_level,
        diet_experience: data.diet_experience,
        exercise_frequency: data.exercise_frequency,
        health_conditions: data.health_conditions ? data.health_conditions.split(',').map(s => s.trim()) : [],
        motivation: data.motivation,
        ...targets,
      }, { onConflict: 'user_id' });

      await supabase.from('profiles').update({
        current_weight: parseFloat(data.current_weight) || null,
        goal_weight: parseFloat(data.goal_weight) || null,
        height: parseFloat(data.height) || null,
        age: parseInt(data.age) || null,
        activity_level: data.activity_level,
      }).eq('user_id', user.id);

      toast({ title: 'Profile setup complete! 🎉' });
      // After survey, redirect to pricing page
      navigate('/pricing');
    } catch {
      toast({ title: 'Error saving survey', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = currentStep.key === 'health_conditions' || !!data[currentStep.key as keyof SurveyData];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mb-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{step + 1} of {STEPS.length}</p>
          </div>
          <CardTitle className="text-xl">{currentStep.q}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep.type === 'select' ? (
            <Select value={data[currentStep.key as keyof SurveyData]} onValueChange={setValue}>
              <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
              <SelectContent>
                {currentStep.options?.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div>
              <Label className="sr-only">{currentStep.q}</Label>
              <Input
                type={currentStep.type === 'email' ? 'email' : currentStep.type}
                placeholder={currentStep.placeholder}
                value={data[currentStep.key as keyof SurveyData]}
                onChange={(e) => setValue(e.target.value)}
                className="text-lg py-6"
              />
            </div>
          )}

          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed || submitting}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80"
              >
                {submitting ? 'Saving...' : 'See My Plan ✓'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingSurvey;
