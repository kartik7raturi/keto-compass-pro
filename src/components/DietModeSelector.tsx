import { useDietMode } from "@/components/DietModeProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heart, Leaf, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const DietModeSelector = () => {
  const { dietMode, setDietMode, loading } = useDietMode();
  const { toast } = useToast();

  const handleChange = (value: 'keto' | 'pcos') => {
    setDietMode(value);
    toast({
      title: "Diet mode updated!",
      description: `Switched to ${value === 'keto' ? 'Keto' : 'PCOS'} mode. All recipes and recommendations will be updated.`,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {dietMode === 'keto' ? (
            <Leaf className="h-5 w-5 text-keto-green" />
          ) : (
            <Heart className="h-5 w-5 text-pcos-pink" />
          )}
          Preferred Diet Mode
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={dietMode}
          onValueChange={(value) => handleChange(value as 'keto' | 'pcos')}
          className="grid grid-cols-2 gap-4"
        >
          <Label
            htmlFor="keto-mode"
            className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              dietMode === 'keto'
                ? 'border-keto-green bg-keto-green-light'
                : 'border-border hover:border-keto-green/50'
            }`}
          >
            <RadioGroupItem value="keto" id="keto-mode" className="sr-only" />
            <Leaf className={`h-8 w-8 ${dietMode === 'keto' ? 'text-keto-green' : 'text-muted-foreground'}`} />
            <div className="text-center">
              <div className={`font-semibold ${dietMode === 'keto' ? 'text-keto-green-dark' : ''}`}>
                Keto Diet
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Low-carb, high-fat recipes
              </div>
            </div>
          </Label>

          <Label
            htmlFor="pcos-mode"
            className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              dietMode === 'pcos'
                ? 'border-pcos-pink bg-pcos-pink-light'
                : 'border-border hover:border-pcos-pink/50'
            }`}
          >
            <RadioGroupItem value="pcos" id="pcos-mode" className="sr-only" />
            <Heart className={`h-8 w-8 ${dietMode === 'pcos' ? 'text-pcos-pink' : 'text-muted-foreground'}`} />
            <div className="text-center">
              <div className={`font-semibold ${dietMode === 'pcos' ? 'text-pcos-pink-dark' : ''}`}>
                PCOS Diet
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Hormone-balancing recipes
              </div>
            </div>
          </Label>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
