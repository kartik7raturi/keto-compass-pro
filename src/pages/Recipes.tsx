import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RecipeLibrary from "@/components/RecipeLibrary";

const Recipes = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <RecipeLibrary />
      </main>
      <Footer />
    </div>
  );
};

export default Recipes;