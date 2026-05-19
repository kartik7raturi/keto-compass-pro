import { Download, FileArchive, FileText, ShieldCheck } from "lucide-react";

const files = [
  "Ketopia_MealPlans.docx",
  "Ketopia_RecipeGuide.docx",
  "Ketopia_WorkoutPlan.docx",
  "Ketopia_EmailSequence.docx",
  "Ketopia_SalesPageCopy.docx",
  "Ketopia_Logo_EditableFiles.zip",
  "Ketopia_Graphics_Pack.zip",
  "Ketopia_PLR_License.pdf",
  "Ketopia_SetupInstructions.pdf",
  "Ketopia_OnboardingGuide.pdf",
];

const KetopiaPLRDownloads = () => {
  return (
    <div className="min-h-screen bg-[#0a1f14] text-[#f5f1e6] px-4 py-16">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4">📁 Downloadable Files Included</h1>
          <p className="text-yellow-100/80 text-lg">Everything you need — delivered instantly</p>
          <p className="mt-3 text-sm text-green-300 inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Access shown after successful WarriorPlus purchase + IPN verification
          </p>
        </div>

        <div className="space-y-3">
          {files.map((name) => (
            <div key={name} className="p-4 rounded-xl bg-green-900/40 border border-yellow-400/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {name.endsWith(".zip") ? <FileArchive className="h-6 w-6 text-yellow-400" /> : <FileText className="h-6 w-6 text-yellow-400" />}
                <div>
                  <p className="font-semibold truncate">{name}</p>
                  <p className="text-xs text-yellow-100/70">Ready to download</p>
                </div>
              </div>
              <button className="px-3 py-2 rounded bg-yellow-400/20 text-yellow-300 text-sm inline-flex items-center gap-2" disabled>
                <Download className="h-4 w-4" /> Awaiting file URL
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KetopiaPLRDownloads;
