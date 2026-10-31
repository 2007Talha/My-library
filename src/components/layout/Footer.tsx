export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 mt-12 text-xs text-slate-400" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200">Campus Pulse</span>
          <span>•</span>
          <span>Context-Aware Life Assistant</span>
        </div>
        <div className="text-slate-500 text-center sm:text-right">
          Built for PromptWars × CSSS | 100% Client-Side Privacy Engine
        </div>
      </div>
    </footer>
  );
}
