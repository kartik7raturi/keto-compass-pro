import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What is the ketogenic diet?",
      answer: "The ketogenic diet is a low-carb, high-fat diet that puts your body into ketosis, where it burns fat for energy instead of carbohydrates. Typically, it consists of 70-80% fat, 15-25% protein, and 5-10% carbohydrates."
    },
    {
      question: "How long does it take to get into ketosis?",
      answer: "It typically takes 2-7 days to enter ketosis, depending on your metabolism, activity level, and how strictly you follow the diet. You can speed up the process by exercising and reducing carbs to under 20g per day."
    },
    {
      question: "What are the side effects of starting keto?",
      answer: "Common side effects include the 'keto flu' with symptoms like fatigue, headaches, and irritability. These usually last 3-7 days. Staying hydrated and maintaining electrolyte balance can help minimize these effects."
    },
    {
      question: "Can I eat fruits on keto?",
      answer: "Most fruits are high in carbs, but you can enjoy small portions of berries like strawberries, blackberries, and raspberries. Avocados and olives are also keto-friendly fruits that are low in carbs."
    },
    {
      question: "How much weight can I lose on keto?",
      answer: "Weight loss varies by individual, but many people lose 2-10 pounds in the first week (mostly water weight) and 1-2 pounds per week thereafter. Results depend on your starting weight, adherence to the diet, and other factors."
    },
    {
      question: "Do I need to count calories on keto?",
      answer: "While calorie counting isn't required, tracking macros is important. Many people naturally eat fewer calories on keto due to increased satiety from fat and protein. Focus on staying within your carb limit first."
    },
    {
      question: "Can I exercise while on keto?",
      answer: "Yes! Exercise is encouraged on keto. You may experience decreased performance initially as your body adapts, but many people report increased endurance and fat burning once fully adapted (4-6 weeks)."
    },
    {
      question: "Is keto safe long-term?",
      answer: "For most healthy individuals, keto can be safe long-term. However, it's important to eat nutrient-dense foods and consider consulting with a healthcare provider, especially if you have any medical conditions."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">Find answers to common keto questions</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left hover:text-keto-green">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;