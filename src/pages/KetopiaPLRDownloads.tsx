import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, FileArchive, FileText, ShieldCheck, Lock } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

type DownloadFile = {
  name: string;
  href: string;
};

// TODO: Replace empty href with actual file URLs (host in /public/plr-files/ or external storage)
const files: DownloadFile[] = [
  { name: "Ketopia_MealPlans.docx", href: "/plr-files/Ketopia_MealPlans.docx" },
  { name: "Ketopia_RecipeGuide.docx", href: "/plr-files/Ketopia_RecipeGuide.docx" },
  { name: "Ketopia_WorkoutPlan.docx", href: "/plr-files/Ketopia_WorkoutPlan.docx" },
  { name: "Ketopia_EmailSequence.docx", href: "/plr-files/Ketopia_EmailSequence.docx" },
  { name: "Ketopia_SalesPageCopy.docx", href: "/plr-files/Ketopia_SalesPageCopy.docx" },
  { name: "Ketopia_Logo_EditableFiles.zip", href: "/plr-files/Ketopia_Logo_EditableFiles.zip" },
  { name: "Ketopia_Graphics_Pack.zip", href: "/plr-files/Ketopia_Graphics_Pack.zip" },
  { name: "Ketopia_PLR_License.pdf", href: "/plr-files/Ketopia_PLR_License.pdf" },
  { name: "Ketopia_SetupInstructions.pdf", href: "/plr-files/Ketopia_SetupInstructions.pdf" },
  { name: "Ketopia_OnboardingGuide.pdf", href: "/plr-files/Ketopia_OnboardingGuide.pdf" },
];

const KetopiaPLRDownloads = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    document.title = "Ketopia PLR — Downloads";
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth?redirect=/ketopia-plr-downloads", { replace: true });
      return;
    }
    // Purchase verification flag set by WarriorPlus IPN webhook (server-side).
    // Until backend IPN handler is wired up, check a local flag for testing.
    const purchased = localStorage.getItem("ketopia_plr_purchased") === "true";
    setVerified(purchased);
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0a1f14] text-[#f5f1e6] flex items-center justify-center p-6">
        <p className="text-yellow-200">Checking access…</p>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen bg-[#0a1f14] text-[#f5f1e6] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center bg-green-900/40 border border-yellow-400/30 rounded-2xl p-8">
          <Lock className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl font-black mb-3">Purchase Required</h1>
          <p className="text-yellow-100/80 mb-6">
            This page is reserved for verified Ketopia PLR buyers. Complete your $999 purchase to unlock instant downloads.
          </p>
          <Link
            to="/ketopia-plr"
            className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg hover:scale-105 transition"
          >
            Get Ketopia PLR — $999
          </Link>
          <p className="text-xs text-yellow-100/60 mt-6">
            Already purchased? Access is granted automatically after WarriorPlus IPN confirms your transaction.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1f14] text-[#f5f1e6] px-4 py-12 sm:py-16">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">📁 Your Ketopia PLR Files</h1>
          <p className="text-yellow-100/80 text-base sm:text-lg">Everything you need — ready to download</p>
          <p className="mt-3 text-xs sm:text-sm text-green-300 inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Purchase verified · Signed in as {user.email}
          </p>
        </div>

        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.name}
              className="p-4 rounded-xl bg-green-900/40 border border-yellow-400/20 flex items-center justify-between gap-3 sm:gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                {file.name.endsWith(".zip") ? (
                  <FileArchive className="h-6 w-6 text-yellow-400 flex-shrink-0" />
                ) : (
                  <FileText className="h-6 w-6 text-yellow-400 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-base truncate">{file.name}</p>
                  <p className="text-xs text-yellow-100/70">Ready to download</p>
                </div>
              </div>
              <a
                href={file.href}
                download
                className="px-3 sm:px-4 py-2 rounded bg-yellow-400 text-green-950 font-bold text-xs sm:text-sm inline-flex items-center gap-2 hover:bg-yellow-300 transition flex-shrink-0"
              >
                <Download className="h-4 w-4" /> Download Now
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KetopiaPLRDownloads;
