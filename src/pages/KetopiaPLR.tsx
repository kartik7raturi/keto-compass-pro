import { useEffect, useState } from "react";
import {
  Check, X, Download, FileText, FileArchive, Shield, Zap,
  Star, Crown, Rocket, Edit3, DollarSign, Users, Award, Package,
  Upload, Settings, ShoppingCart, ChevronDown, ChevronUp
} from "lucide-react";
import productImage from "@/assets/ketopia-plr-product.png";
import SalesDisclaimer from "@/components/SalesDisclaimer";

const CTA = "/onboarding";

const includes = [
  "Full Private Label Rights — rebrand & sell as your own, keep 100% of profits",
  "Full Editable Membership Content",
  "Keto Meal Plans (Editable .docx files)",
  "Recipe Guides (Editable)",
  "Workout & Fitness Content",
  "Member Email Series (Done-For-You)",
  "Branding Kit (Editable Logo, Colors, Graphics)",
  "Ready-Made Sales Page Copy",
  "Member Onboarding Guide",
  "PLR License Document (PDF)",
  "Step-by-step Setup Instructions (PDF)",
];

const files = [
  { name: "Ketopia_MealPlans.docx", icon: FileText },
  { name: "Ketopia_RecipeGuide.docx", icon: FileText },
  { name: "Ketopia_WorkoutPlan.docx", icon: FileText },
  { name: "Ketopia_EmailSequence.docx", icon: FileText },
  { name: "Ketopia_SalesPageCopy.docx", icon: FileText },
  { name: "Ketopia_Logo_EditableFiles.zip", icon: FileArchive },
  { name: "Ketopia_Graphics_Pack.zip", icon: FileArchive },
  { name: "Ketopia_PLR_License.pdf", icon: FileText },
  { name: "Ketopia_SetupInstructions.pdf", icon: FileText },
  { name: "Ketopia_OnboardingGuide.pdf", icon: FileText },
];

const benefits = [
  { icon: Rocket, title: "Done-For-You Business" },
  { icon: Edit3, title: "No Content Creation Needed" },
  { icon: Download, title: "Instant Digital Download" },
  { icon: Settings, title: "Full Editing Rights" },
  { icon: Award, title: "Proven Keto Niche" },
  { icon: DollarSign, title: "Keep All Profits" },
  { icon: Package, title: "Sell Unlimited Copies" },
  { icon: ShoppingCart, title: "Commercial Use Allowed" },
  { icon: FileText, title: "Ready-Made Sales Materials" },
];

const faqs = [
  { q: "Can I really put my name on this?", a: "Yes! That's exactly what PLR means." },
  { q: "What platforms can I use this on?", a: "Kajabi, Teachable, ThriveCart, WordPress, and more." },
  { q: "Is there a monthly fee?", a: "No. This is a one-time payment of $999." },
  { q: "How do I get my files?", a: "Instantly after purchase via WarriorPlus members area." },
  { q: "Can I sell PLR rights to my customers?", a: "No. You can sell the content but not the PLR license itself." },
];

const KetopiaPLR = () => {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    document.title = "Ketopia PLR — Done-For-You Keto Membership Site | $999";
    const onScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1f14] text-[#f5f1e6]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700;800;900&display=swap');
        .display { font-family: 'Playfair Display', serif; }
      `}</style>


      {/* Sticky header */}
      <div className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}>
        <div className="bg-[#0a1f14]/95 backdrop-blur border-b border-yellow-500/30 py-3 px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 flex-shrink-0" />
            <span className="display text-base sm:text-xl font-bold text-yellow-400 truncate">Ketopia PLR</span>
          </div>
          <a href={CTA}
            className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-xs sm:text-sm shadow-lg hover:scale-105 transition whitespace-nowrap">
            Get Access — $999
          </a>
        </div>
      </div>

      {/* 1. HEADER */}
      <header className="relative overflow-hidden pt-12 sm:pt-16 pb-16 sm:pb-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,139,87,0.25),transparent_60%)]" />
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 px-4 py-2 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6">
              <Crown className="h-4 w-4" /> EXCLUSIVE PLR LICENSE
            </div>
            <h1 className="display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-4 sm:mb-6">
              Get Full Private Label Rights To{" "}
              <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                Ketopia
              </span>{" "}
              — A Done-For-You Keto Membership Site!
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-yellow-100/80 font-medium mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
              Rebrand It, Sell It, Keep <span className="text-yellow-400 font-extrabold">100% Of The Profits</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 items-center">
            <div className="relative mx-auto w-full max-w-md md:max-w-none">
              <div className="rounded-2xl bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 border-4 border-yellow-400/40 shadow-2xl overflow-hidden">
                <img
                  src={productImage}
                  alt="Ketopia PLR — Keto Meal Plans, Coaching Guides, and full PLR business toolkit"
                  className="w-full h-auto object-contain"
                  loading="eager"
                />
              </div>
              <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-red-600 text-white font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-xl rotate-6 text-sm sm:text-base">
                $999 ONLY
              </div>
            </div>

            <div className="space-y-5">
              <ul className="space-y-3">
                {["100% Rebrandable Membership Site", "Sell Under Your Own Brand", "Keep Every Dollar You Earn", "Instant Download After Purchase"].map(t => (
                  <li key={t} className="flex items-start gap-3 text-base sm:text-lg">
                    <Check className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-yellow-50">{t}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col items-start gap-3">
                <a href={CTA} className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-lg shadow-xl hover:scale-[1.03] transition-all w-full sm:w-auto text-center">
                  Buy Now — $999
                </a>
              </div>
              <p className="text-xs sm:text-sm text-yellow-100/60">🔒 Secure Checkout · Instant Access</p>
            </div>
          </div>
        </div>
      </header>

      {/* 3. THIS OFFER INCLUDES */}
      <section className="py-12 sm:py-16 px-4 bg-[#0d2818]/60">
        <div className="container mx-auto max-w-5xl">
          <h2 className="display text-2xl sm:text-3xl md:text-5xl font-black text-center mb-8 sm:mb-12">
            ✅ This <span className="text-yellow-400">Offer Includes</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {includes.map(item => (
              <div key={item} className="flex items-start gap-3 p-4 sm:p-5 rounded-xl bg-green-900/30 border border-yellow-400/20 hover:border-yellow-400/60 transition">
                <Check className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-yellow-50 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHAT YOU CAN DO */}
      <section className="py-12 sm:py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="display text-2xl sm:text-3xl md:text-5xl font-black text-center mb-8 sm:mb-12">
            What You Can <span className="text-yellow-400">Do With This PLR</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              "Rebrand as your own product",
              "Sell memberships under your brand name",
              "Edit and modify all content",
              "Keep 100% of all profits",
              "Put your name as the author",
              "Use on any platform (Kajabi, Teachable, ThriveCart etc.)",
            ].map(t => (
              <div key={t} className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-yellow-400/10 to-transparent border-l-4 border-yellow-400">
                <Star className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <span className="text-sm sm:text-base font-semibold text-yellow-50">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. DOWNLOADABLE FILES */}
      <section className="py-12 sm:py-16 px-4 bg-[#0d2818]/60">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="display text-2xl sm:text-3xl md:text-5xl font-black mb-3 sm:mb-4">
              📁 Downloadable <span className="text-yellow-400">Files Included</span>
            </h2>
            <p className="text-yellow-100/70 text-base sm:text-lg">Everything you need — delivered instantly after purchase</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map(f => (
              <div key={f.name} className="group p-4 sm:p-5 rounded-xl bg-gradient-to-br from-green-900/60 to-green-950/60 border border-yellow-400/20 hover:border-yellow-400 hover:shadow-xl hover:shadow-yellow-400/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 sm:p-3 rounded-lg bg-yellow-400/15 group-hover:bg-yellow-400/30 transition flex-shrink-0">
                    <f.icon className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-yellow-50 text-xs sm:text-sm truncate">{f.name}</p>
                    <p className="text-xs text-yellow-200/60">Included in your package</p>
                  </div>
                  <Download className="h-5 w-5 text-yellow-400/60 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs sm:text-sm text-yellow-100/60 mt-6">
            Files are delivered through your secure members area after successful checkout.
          </p>
        </div>
      </section>

      {/* 6. PLR LICENSE */}
      <section className="py-12 sm:py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-2xl border-4 border-yellow-400 bg-gradient-to-br from-green-950 to-[#0a1f14] p-6 sm:p-8 md:p-12 shadow-2xl shadow-yellow-400/10">
            <div className="text-center mb-6 sm:mb-8">
              <Shield className="h-12 w-12 sm:h-14 sm:w-14 text-yellow-400 mx-auto mb-3" />
              <h2 className="display text-2xl sm:text-3xl md:text-5xl font-black text-yellow-400">Your PLR License</h2>
            </div>
            <p className="text-yellow-50 text-base sm:text-lg mb-6 text-center font-medium">
              This product comes with <span className="text-yellow-400 font-bold">Full Private Label Rights.</span>
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-green-300 mb-3 text-lg">✅ You MAY</h4>
                <ul className="space-y-2 text-yellow-50 text-sm sm:text-base">
                  {["Edit and rebrand this product as your own", "Resell it and keep 100% of profits", "Claim authorship", "Use it on any membership platform"].map(t => (
                    <li key={t} className="flex items-start gap-2"><Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" /><span>{t}</span></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-red-300 mb-3 text-lg">❌ You may NOT</h4>
                <ul className="space-y-2 text-yellow-50 text-sm sm:text-base">
                  {["Resell or give away the PLR rights to others", "Sell on free giveaway sites", "Claim copyright on original materials"].map(t => (
                    <li key={t} className="flex items-start gap-2"><X className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" /><span>{t}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SETUP INSTRUCTIONS */}
      <section className="py-12 sm:py-16 px-4 bg-[#0d2818]/60">
        <div className="container mx-auto max-w-6xl">
          <h2 className="display text-2xl sm:text-3xl md:text-5xl font-black text-center mb-10 sm:mb-12">
            How To Set This Up In <span className="text-yellow-400">4 Simple Steps</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Download, t: "Download", d: "Get all files from your members area" },
              { icon: Edit3, t: "Rebrand", d: "Add your name, logo and colors" },
              { icon: Upload, t: "Upload", d: "Push to Kajabi / Teachable / ThriveCart / WordPress" },
              { icon: DollarSign, t: "Profit", d: "Start selling and keep 100% of profits" },
            ].map((s, i) => (
              <div key={s.t} className="relative p-6 rounded-xl bg-green-900/40 border border-yellow-400/30 text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-9 w-9 rounded-full bg-yellow-400 text-green-950 font-black flex items-center justify-center">
                  {i + 1}
                </div>
                <s.icon className="h-10 w-10 text-yellow-400 mx-auto mt-3 mb-3" />
                <h3 className="font-bold text-xl text-yellow-50 mb-2">{s.t}</h3>
                <p className="text-yellow-100/70 text-sm">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. BENEFITS */}
      <section className="py-12 sm:py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="display text-2xl sm:text-3xl md:text-5xl font-black text-center mb-10 sm:mb-12">
            Why <span className="text-yellow-400">Ketopia PLR</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {benefits.map(b => (
              <div key={b.title} className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-green-900/60 to-green-950/40 border border-yellow-400/20 hover:border-yellow-400/60 transition">
                <b.icon className="h-8 w-8 sm:h-9 sm:w-9 text-yellow-400 mb-3" />
                <h3 className="font-bold text-base sm:text-lg text-yellow-50">{b.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. WHO IS THIS FOR */}
      <section className="py-12 sm:py-16 px-4 bg-[#0d2818]/60">
        <div className="container mx-auto max-w-4xl">
          <h2 className="display text-2xl sm:text-3xl md:text-5xl font-black text-center mb-10 sm:mb-12">
            Who Is This <span className="text-yellow-400">For?</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              "Digital marketers",
              "Affiliate marketers",
              "Coaches and consultants",
              "Beginners wanting a ready-made business",
              "Anyone in the health/keto niche",
            ].map(t => (
              <div key={t} className="flex items-center gap-3 p-4 sm:p-5 rounded-xl bg-green-900/40 border border-yellow-400/20">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 flex-shrink-0" />
                <span className="text-sm sm:text-base text-yellow-50 font-semibold">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. PRICING / CTA */}
      <section className="py-16 sm:py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-3xl bg-gradient-to-br from-yellow-400/10 via-green-900/60 to-green-950 border-4 border-yellow-400 p-6 sm:p-8 md:p-12 text-center shadow-2xl shadow-yellow-400/20">
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/40 text-red-300 px-4 py-2 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6">
              <Zap className="h-4 w-4" /> LIMITED TIME OFFER
            </div>
            <h2 className="display text-3xl sm:text-4xl md:text-6xl font-black mb-4">Get Ketopia PLR Today</h2>
            <div className="flex items-center justify-center gap-3 sm:gap-4 my-6 sm:my-8 flex-wrap">
              <span className="text-2xl sm:text-3xl md:text-4xl text-yellow-100/50 line-through font-bold">$2,999</span>
              <span className="text-5xl sm:text-6xl md:text-7xl font-black bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">$999</span>
            </div>
            <p className="text-yellow-100/80 text-base sm:text-lg mb-2 font-semibold">ONE-TIME PAYMENT</p>
            <p className="text-red-300 text-sm sm:text-base font-bold mb-6 sm:mb-8">⚠️ This PLR License Will Not Be Available Forever</p>
            <div className="flex flex-col items-center gap-3">
              <a href={CTA} className="inline-flex items-center justify-center px-10 py-5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-xl shadow-2xl hover:scale-[1.03] transition-all w-full sm:w-auto text-center">
                Get Instant Access — $999
              </a>
            </div>
            <p className="text-xs sm:text-sm text-yellow-100/70 mt-6">🔒 Secure Checkout · Instant Access</p>
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="py-12 sm:py-16 px-4 bg-[#0d2818]/60">
        <div className="container mx-auto max-w-3xl">
          <h2 className="display text-2xl sm:text-3xl md:text-5xl font-black text-center mb-10 sm:mb-12">
            Frequently Asked <span className="text-yellow-400">Questions</span>
          </h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={f.q} className="rounded-xl bg-green-900/40 border border-yellow-400/20 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left hover:bg-yellow-400/5 transition"
                >
                  <span className="font-bold text-yellow-50 text-base sm:text-lg">{f.q}</span>
                  {openFaq === i ? <ChevronUp className="h-5 w-5 text-yellow-400 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-yellow-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-yellow-100/80 text-sm sm:text-base">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. FOOTER */}
      <footer className="py-10 sm:py-12 px-4 border-t border-yellow-400/20">
        <div className="container mx-auto max-w-5xl text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-6 w-6 text-yellow-400" />
            <span className="display text-2xl font-bold text-yellow-400">Ketopia PLR</span>
          </div>
          <p className="text-yellow-100/60 text-sm">© 2025 Ketopia PLR. All rights reserved.</p>
          <p className="text-yellow-100/50 text-xs max-w-2xl mx-auto">
            <strong>Earnings Disclaimer:</strong> Results are not typical and depend on your effort, experience, and market. This product is sold for educational and informational purposes; no income is guaranteed.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-yellow-100/70 pt-2">
            <a href="/privacy" className="hover:text-yellow-400">Privacy Policy</a>
            <a href="/terms" className="hover:text-yellow-400">Terms of Service</a>
            <a href="/contact" className="hover:text-yellow-400">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default KetopiaPLR;
