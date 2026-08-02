import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, ChevronLeft, Loader2, Leaf, Beef, Salad, DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { trackLead } from '@/lib/tracking';
import { generateWeeklyPlan, seedFromString, type DayPlan, type DietPreference, type BudgetPreference } from '@/lib/mealPlanGenerator';

interface SurveyData {
  diet_preference: DietPreference | '';
  budget_preference: BudgetPreference | '';
  current_weight: string;
  goal_weight: string;
  height: string;
  age: string;
  gender: string;
  activity_level: string;
  email: string;
  password: string;
}

const QUIZ_STEPS = [
  { key: 'diet_preference', q: 'What do you eat?', type: 'diet' },
  { key: 'gender', q: 'What is your gender?', type: 'select', options: ['Male', 'Female', 'Other', 'Prefer not to say'] },
  { key: 'age', q: 'How old are you?', type: 'number', placeholder: 'Your age' },
  { key: 'height', q: 'What is your height (inches)?', type: 'number', placeholder: 'e.g. 68' },
  { key: 'weight', q: 'Your current & goal weight (lbs)', type: 'weight_pair' },
  { key: 'activity_level', q: 'How active are you?', type: 'select', options: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extra Active'] },
  { key: 'budget_preference', q: 'What is your weekly grocery budget?', type: 'budget' },
];

const SIGNUP_STEP = QUIZ_STEPS.length;
const REPORT_STEP = SIGNUP_STEP + 1;
const TOTAL_STEPS = REPORT_STEP + 1;

const DIET_OPTIONS: { value: DietPreference; label: string; icon: typeof Leaf }[] = [
  { value: 'non_vegetarian', label: 'Non-Vegetarian', icon: Beef },
  { value: 'vegetarian', label: 'Vegetarian', icon: Salad },
  { value: 'vegan', label: 'Vegan', icon: Leaf },
];

const BUDGET_OPTIONS: { value: BudgetPreference; label: string; sub: string }[] = [
  { value: 'budget', label: 'Under $75/week', sub: 'Budget-friendly staples' },
  { value: 'moderate', label: '$75–150/week', sub: 'A good balance' },
  { value: 'premium', label: '$150+/week', sub: 'No limits — premium ingredients ok' },
];

const OnboardingSurvey = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SurveyData>({
    diet_preference: '', budget_preference: '', current_weight: '', goal_weight: '', height: '', age: '',
    gender: '', activity_level: '', email: '', password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [signupDone, setSignupDone] = useState(false);
  const [mealPlan, setMealPlan] = useState<DayPlan[]>([]);
  const [planLoading, setPlanLoading] = useState(false);

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  const setValue = (key: string, val: string) => {
    setData({ ...data, [key]: val });
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
    const daily_calorie_target = Math.max(1200, calories);
    const daily_carb_target = 25;
    const daily_protein_target = Math.round(weight * 0.8);
    return {
      bmr: Math.round(bmr),
      tdee,
      daily_calorie_target,
      daily_carb_target,
      daily_protein_target,
      daily_fat_target: Math.round((daily_calorie_target - daily_carb_target * 4 - daily_protein_target * 4) / 9),
    };
  };

  const calcBMI = () => {
    const weight = parseFloat(data.current_weight) || 150;
    const height = parseFloat(data.height) || 68;
    const heightM = height * 0.0254;
    const weightKg = weight * 0.453592;
    return (weightKg / (heightM * heightM)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-500' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-500' };
    return { label: 'Obese', color: 'text-red-500' };
  };

  const handleSignup = async () => {
    if (!data.email || !data.password) return;
    setSubmitting(true);
    try {
      const { error } = await signUp(data.email, data.password, data.email.split('@')[0]);
      if (error) {
        toast({ title: 'Signup Error', description: error.message, variant: 'destructive' });
      } else {
        setSignupDone(true);
        trackLead('onboarding_survey', { diet_preference: data.diet_preference });
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          const targets = calcTargets();
          const userId = sessionData.session.user.id;
          await supabase.from('user_survey_responses').upsert({
            user_id: userId,
            current_weight: parseFloat(data.current_weight) || null,
            goal_weight: parseFloat(data.goal_weight) || null,
            height: parseFloat(data.height) || null,
            age: parseInt(data.age) || null,
            gender: data.gender,
            activity_level: data.activity_level,
            diet_preference: data.diet_preference || null,
            budget_preference: data.budget_preference || null,
            daily_calorie_target: targets.daily_calorie_target,
            daily_carb_target: targets.daily_carb_target,
            daily_protein_target: targets.daily_protein_target,
            daily_fat_target: targets.daily_fat_target,
          }, { onConflict: 'user_id' });

          await supabase.from('profiles').update({
            current_weight: parseFloat(data.current_weight) || null,
            goal_weight: parseFloat(data.goal_weight) || null,
            height: parseFloat(data.height) || null,
            age: parseInt(data.age) || null,
            activity_level: data.activity_level,
            diet_preference: data.diet_preference || null,
            budget_preference: data.budget_preference || null,
          }).eq('user_id', userId);
        }
        toast({ title: 'Account created!' });
        setStep(REPORT_STEP);
      }
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if ((step === REPORT_STEP || signupDone) && data.diet_preference && mealPlan.length === 0) {
      setPlanLoading(true);
      generateWeeklyPlan(data.diet_preference as DietPreference, seedFromString(data.email || 'guest'), data.budget_preference || null)
        .then(setMealPlan)
        .finally(() => setPlanLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, signupDone]);

  if (step < QUIZ_STEPS.length) {
    const currentStep = QUIZ_STEPS[step];
    const canProceed =
      currentStep.type === 'weight_pair'
        ? !!data.current_weight && !!data.goal_weight
        : !!data[currentStep.key as keyof SurveyData];

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mb-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{step + 1} of {TOTAL_STEPS}</p>
            </div>
            <CardTitle className="text-xl">{currentStep.q}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep.type === 'diet' ? (
              <div className="grid grid-cols-1 gap-3">
                {DIET_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const selected = data.diet_preference === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue('diet_preference', opt.value)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors text-left ${
                        selected ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-medium">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : currentStep.type === 'budget' ? (
              <div className="grid grid-cols-1 gap-3">
                {BUDGET_OPTIONS.map((opt) => {
                  const selected = data.budget_preference === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue('budget_preference', opt.value)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors text-left ${
                        selected ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'
                      }`}
                    >
                      <DollarSign className={`h-5 w-5 flex-shrink-0 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span>
                        <span className="font-medium block">{opt.label}</span>
                        <span className="text-xs text-muted-foreground">{opt.sub}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : currentStep.type === 'weight_pair' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current Weight</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 180"
                    value={data.current_weight}
                    onChange={(e) => setValue('current_weight', e.target.value)}
                    className="text-lg py-6 mt-1"
                  />
                </div>
                <div>
                  <Label>Goal Weight</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 150"
                    value={data.goal_weight}
                    onChange={(e) => setValue('goal_weight', e.target.value)}
                    className="text-lg py-6 mt-1"
                  />
                </div>
              </div>
            ) : currentStep.type === 'select' ? (
              <Select value={data[currentStep.key as keyof SurveyData]} onValueChange={(v) => setValue(currentStep.key, v)}>
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
                  type={currentStep.type}
                  placeholder={currentStep.placeholder}
                  value={data[currentStep.key as keyof SurveyData]}
                  onChange={(e) => setValue(currentStep.key, e.target.value)}
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
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === SIGNUP_STEP && !signupDone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mb-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{step + 1} of {TOTAL_STEPS}</p>
            </div>
            <CardTitle className="text-xl">Create Your Account</CardTitle>
            <p className="text-sm text-muted-foreground">Sign up to save your personalized keto plan</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={data.email}
                onChange={(e) => setValue('email', e.target.value)}
                className="text-lg py-6"
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Create a password (min 6 chars)"
                value={data.password}
                onChange={(e) => setValue('password', e.target.value)}
                className="text-lg py-6"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button
                onClick={handleSignup}
                disabled={!data.email || !data.password || data.password.length < 6 || submitting}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80"
              >
                {submitting ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === REPORT_STEP || signupDone) {
    const targets = calcTargets();
    const bmi = parseFloat(calcBMI());
    const bmiCat = getBMICategory(bmi);
    const weightToLose = Math.max(0, (parseFloat(data.current_weight) || 150) - (parseFloat(data.goal_weight) || 150));

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mb-2">
              <Progress value={100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">Your Results</p>
            </div>
            <CardTitle className="text-xl">Your Personalized Keto Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="bg-secondary/30 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Your BMI</p>
              <p className={`text-4xl font-bold ${bmiCat.color}`}>{bmi}</p>
              <p className={`text-sm font-semibold ${bmiCat.color}`}>{bmiCat.label}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/30 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Daily Calories</p>
                <p className="text-xl font-bold text-primary">{targets.daily_calorie_target}</p>
              </div>
              <div className="bg-secondary/30 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Weight to Lose</p>
                <p className="text-xl font-bold text-primary">{weightToLose} lbs</p>
              </div>
              <div className="bg-secondary/30 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Protein</p>
                <p className="text-xl font-bold">{targets.daily_protein_target}g</p>
              </div>
              <div className="bg-secondary/30 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Net Carbs</p>
                <p className="text-xl font-bold">{targets.daily_carb_target}g</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2">
                Your 1-Week {data.diet_preference === 'vegan' ? 'Vegan' : data.diet_preference === 'vegetarian' ? 'Vegetarian' : ''} Keto Meal Plan
              </h3>
              {planLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : mealPlan.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">Your meal plan will be ready in your dashboard.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {mealPlan.map((d) => (
                    <div key={d.day} className="flex gap-2 text-xs">
                      <span className="font-semibold w-20 flex-shrink-0">{d.day.slice(0, 3)}</span>
                      <span className="text-muted-foreground truncate">
                        {d.breakfast?.title} • {d.lunch?.title} • {d.dinner?.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              className="w-full bg-gradient-to-r from-primary to-primary/80 py-6 text-lg font-bold"
              onClick={() => navigate('/progress')}
            >
              Go to My Dashboard
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Your account is ready — track macros, get recipes, and follow your plan
            </p>

          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default OnboardingSurvey;
