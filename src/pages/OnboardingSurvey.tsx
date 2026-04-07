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
import { ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';
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
  password: string;
}

const QUIZ_STEPS = [
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
];

const SIGNUP_STEP = QUIZ_STEPS.length;
const VERIFY_STEP = SIGNUP_STEP + 1;
const REPORT_STEP = VERIFY_STEP + 1;
const TOTAL_STEPS = REPORT_STEP + 1;

const OnboardingSurvey = () => {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SurveyData>({
    current_weight: '', goal_weight: '', height: '', age: '',
    gender: '', activity_level: '', diet_experience: '',
    exercise_frequency: '', health_conditions: '', motivation: '',
    email: '', password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [signupDone, setSignupDone] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

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
    return {
      bmr: Math.round(bmr),
      tdee,
      daily_calorie_target: Math.max(1200, calories),
      daily_carb_target: 25,
      daily_protein_target: Math.round(weight * 0.8),
      daily_fat_target: Math.round(((calories - 25 * 4 - weight * 0.8 * 4)) / 9),
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
        toast({ title: 'Account created!', description: 'Please check your email to verify your account.' });
        setStep(VERIFY_STEP);
      }
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const checkEmailVerified = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.user) {
      setEmailVerified(true);
      // Save survey data
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
        diet_experience: data.diet_experience,
        exercise_frequency: data.exercise_frequency,
        health_conditions: data.health_conditions ? data.health_conditions.split(',').map(s => s.trim()) : [],
        motivation: data.motivation,
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
      }).eq('user_id', userId);

      setStep(REPORT_STEP);
      toast({ title: 'Email verified! ✅' });
    } else {
      toast({ title: 'Not verified yet', description: 'Please check your email and click the verification link, then try again.', variant: 'destructive' });
    }
  };

  // Generate a simple 1-week meal plan
  const weeklyPlan = [
    { day: 'Monday', meals: 'Bacon & eggs • Chicken salad • Steak with asparagus' },
    { day: 'Tuesday', meals: 'Keto smoothie • Tuna lettuce wraps • Salmon with broccoli' },
    { day: 'Wednesday', meals: 'Avocado eggs • Cobb salad • Pork chops with green beans' },
    { day: 'Thursday', meals: 'Cheese omelette • Caesar salad • Beef stir-fry' },
    { day: 'Friday', meals: 'Keto pancakes • Shrimp bowl • Chicken thighs with spinach' },
    { day: 'Saturday', meals: 'Egg muffins • BLT lettuce wraps • Lamb with roasted veggies' },
    { day: 'Sunday', meals: 'Keto waffles • Greek salad • Grilled fish with cauliflower' },
  ];

  // Quiz step rendering
  if (step < QUIZ_STEPS.length) {
    const currentStep = QUIZ_STEPS[step];
    const canProceed = currentStep.key === 'health_conditions' || !!data[currentStep.key as keyof SurveyData];

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
            {currentStep.type === 'select' ? (
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

  // Signup step
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

  // Email verification step
  if (step === VERIFY_STEP) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mb-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{step + 1} of {TOTAL_STEPS}</p>
            </div>
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Verify Your Email</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              We've sent a verification link to <strong>{data.email}</strong>. 
              Please check your inbox and click the link, then come back and click the button below.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={checkEmailVerified}
              className="w-full bg-gradient-to-r from-primary to-primary/80 py-6 text-lg"
            >
              I've Verified My Email ✓
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Didn't receive the email? Check your spam folder.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Report step - BMI + 1-week plan
  if (step === REPORT_STEP) {
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
            {/* BMI */}
            <div className="bg-secondary/30 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Your BMI</p>
              <p className={`text-4xl font-bold ${bmiCat.color}`}>{bmi}</p>
              <p className={`text-sm font-semibold ${bmiCat.color}`}>{bmiCat.label}</p>
            </div>

            {/* Targets */}
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

            {/* 1-Week Plan Preview */}
            <div>
              <h3 className="font-semibold text-sm mb-2">Your 1-Week Keto Meal Plan</h3>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {weeklyPlan.map(d => (
                  <div key={d.day} className="flex gap-2 text-xs">
                    <span className="font-semibold w-20 flex-shrink-0">{d.day}</span>
                    <span className="text-muted-foreground">{d.meals}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-primary to-primary/80 py-6 text-lg font-bold"
              onClick={() => navigate('/pricing')}
            >
              Get Full Report & Access — $19.99
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Unlock all recipes, tracker, and complete meal plans
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default OnboardingSurvey;
