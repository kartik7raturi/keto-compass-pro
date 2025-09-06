import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanLine, Search, Package, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BarcodeResult {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  serving_size?: string;
}

interface BarcodeScannerProps {
  onFoodAdd: (food: BarcodeResult) => void;
  onClose: () => void;
}

const BarcodeScanner = ({ onFoodAdd, onClose }: BarcodeScannerProps) => {
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BarcodeResult | null>(null);

  // Mock barcode database - in real app, this would call an API like OpenFoodFacts
  const mockBarcodeData: Record<string, BarcodeResult> = {
    "123456789": {
      name: "Almond Butter - Natural",
      calories: 190,
      carbs: 7,
      protein: 7,
      fat: 17,
      serving_size: "2 tbsp (32g)"
    },
    "987654321": {
      name: "Avocado Oil",
      calories: 120,
      carbs: 0,
      protein: 0,
      fat: 14,
      serving_size: "1 tbsp (14g)"
    },
    "456789123": {
      name: "Grass-Fed Beef Jerky",
      calories: 80,
      carbs: 3,
      protein: 14,
      fat: 1,
      serving_size: "1 oz (28g)"
    },
    "789123456": {
      name: "Organic Coconut Oil",
      calories: 130,
      carbs: 0,
      protein: 0,
      fat: 14,
      serving_size: "1 tbsp (14g)"
    }
  };

  const handleScan = async () => {
    if (!barcode.trim()) {
      setError("Please enter a barcode");
      return;
    }

    setLoading(true);
    setError(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const foodData = mockBarcodeData[barcode];
    
    if (foodData) {
      setResult(foodData);
    } else {
      setError("Product not found in database. Try manually adding the food item.");
    }
    
    setLoading(false);
  };

  const handleAddFood = () => {
    if (result) {
      onFoodAdd(result);
      onClose();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
          <ScanLine className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Barcode Scanner</CardTitle>
        <p className="text-sm text-muted-foreground">
          Scan or enter a barcode to get accurate nutrition info
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Product Barcode</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter barcode number"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleScan}
              disabled={loading}
              size="icon"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{result.name}</CardTitle>
              </div>
              {result.serving_size && (
                <p className="text-sm text-muted-foreground">
                  Serving: {result.serving_size}
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="font-medium">Calories</div>
                  <div className="text-lg font-bold text-primary">{result.calories}</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Carbs</div>
                  <div className="text-lg font-bold">{result.carbs}g</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Protein</div>
                  <div className="text-lg font-bold">{result.protein}g</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Fat</div>
                  <div className="text-lg font-bold">{result.fat}g</div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddFood} className="flex-1">
                  Add to Tracker
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">
            Try these sample barcodes:
          </p>
          <div className="flex flex-wrap gap-1 justify-center">
            {Object.keys(mockBarcodeData).map((code) => (
              <Button
                key={code}
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => setBarcode(code)}
              >
                {code}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarcodeScanner;