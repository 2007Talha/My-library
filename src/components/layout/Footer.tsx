export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">My Library</span>
          <span>•</span>
          <span>Intelligent Campus Life Operating System</span>
        </div>
        <div className="text-slate-400 text-center sm:text-right">
          Built for PromptWars × CSSS | 100% Client-Side Privacy Engine
        </div>
      </div>
    </footer>
  );
}
