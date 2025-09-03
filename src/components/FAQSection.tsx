import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "What is the ketogenic diet?",
      answer: "The ketogenic diet is a high-fat, moderate-protein, low-carbohydrate diet that puts your body into a metabolic state called ketosis, where it burns fat for energy instead of carbohydrates."
    },
    {
      question: "How do I track my macros effectively?",
      answer: "Use our built-in macro tracker to log your daily intake of carbs, proteins, and fats. Aim for 70-75% fat, 20-25% protein, and 5-10% carbohydrates for optimal ketosis."
    },
    {
      question: "What foods can I eat on keto?",
      answer: "Focus on high-fat foods like avocados, nuts, oils, fatty fish, meat, eggs, and low-carb vegetables. Avoid grains, sugar, most fruits, and starchy vegetables."
    },
    {
      question: "How long does it take to reach ketosis?",
      answer: "Typically 2-7 days of following a strict ketogenic diet with less than 20g of carbs per day. Our app helps you track your progress and provides guidance."
    },
    {
      question: "Is the keto diet safe for everyone?",
      answer: "While keto is safe for most healthy adults, consult with a healthcare provider before starting, especially if you have medical conditions or take medications."
    },
    {
      question: "Can I exercise while on keto?",
      answer: "Yes! Our workout tracker helps you maintain an active lifestyle. You may experience an adjustment period, but many people report increased energy once keto-adapted."
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get answers to the most common questions about ketogenic lifestyle
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="mb-4">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;