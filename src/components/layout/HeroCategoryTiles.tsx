import {
  Briefcase,
  GraduationCap,
  Trophy,
  FileText,
  Compass,
  Flame,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { Category } from '../../types/notice';

interface HeroCategoryTilesProps {
  selectedCategory: Category | 'All';
  onCategoryChange: (category: Category | 'All') => void;
  onOpenDigest: () => void;
  onScrollToAttention: () => void;
  urgentCount: number;
}

export default function HeroCategoryTiles({
  selectedCategory,
  onCategoryChange,
  onOpenDigest,
  onScrollToAttention,
  urgentCount,
}: HeroCategoryTilesProps) {
  const tiles = [
    {
      id: 'placements',
      label: 'Placements',
      category: 'Placement' as Category,
      icon: Briefcase,
      bgColor: 'bg-purple-50 text-purple-600 hover:border-purple-300',
      iconBg: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'academics',
      label: 'Academics',
      category: 'Academic' as Category,
      icon: GraduationCap,
      bgColor: 'bg-sky-50 text-sky-600 hover:border-sky-300',
      iconBg: 'bg-sky-100 text-sky-700',
    },
    {
      id: 'hackathons',
      label: 'Hackathons',
      category: 'Events/Fest' as Category,
      icon: Trophy,
      bgColor: 'bg-amber-50 text-amber-600 hover:border-amber-300',
      iconBg: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'exams',
      label: 'Exams & Viva',
      category: 'Admin/Exam' as Category,
      icon: FileText,
      bgColor: 'bg-orange-50 text-orange-600 hover:border-orange-300',
      iconBg: 'bg-orange-100 text-orange-700',
    },
    {
      id: 'clubs',
      label: 'Clubs & Fests',
      category: 'Clubs' as Category,
      icon: Compass,
      bgColor: 'bg-emerald-50 text-emerald-600 hover:border-emerald-300',
      iconBg: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'attention',
      label: `Must-Dos (${urgentCount})`,
      action: onScrollToAttention,
      icon: Flame,
      bgColor: 'bg-red-50 text-red-600 hover:border-red-300',
      iconBg: 'bg-red-100 text-red-700',
      badge: 'Today',
    },
    {
      id: 'digest',
      label: 'AI Digest',
      action: onOpenDigest,
      icon: Sparkles,
      bgColor: 'bg-blue-50 text-blue-600 hover:border-blue-300',
      iconBg: 'bg-blue-100 text-blue-700',
      badge: 'Weekly',
    },
  ];

  return (
    <section className="space-y-6 pt-2 pb-4" aria-label="Campus category explorer">
      {/* Big Hero Header Headline (Unstop Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Stay on Top of Your <span className="text-blue-600">Campus Life!</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">
            One intelligent place for notices, exam dates, placements, deadlines & conflict triage.
          </p>
        </div>

        {/* Right Badge (Unstop Style) */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold shrink-0 self-start sm:self-auto shadow-2xs">
          <Zap className="w-4 h-4 text-purple-600" aria-hidden="true" />
          <span>Real-time Context Engine</span>
        </div>
      </div>

      {/* Horizontal Category Tiles (Unstop Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          const isCategoryActive = tile.category && selectedCategory === tile.category;

          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => {
                if (tile.action) {
                  tile.action();
                } else if (tile.category) {
                  onCategoryChange(selectedCategory === tile.category ? 'All' : tile.category);
                }
              }}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center text-center space-y-2 group shadow-2xs cursor-pointer ${
                isCategoryActive
                  ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20'
                  : `border-slate-200/90 bg-white ${tile.bgColor}`
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl ${tile.iconBg} flex items-center justify-center group-hover:scale-105 transition shadow-2xs relative`}>
                <Icon size={24} />
                {tile.badge && (
                  <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-blue-600 text-white shadow-2xs">
                    {tile.badge}
                  </span>
                )}
              </div>

              <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 leading-tight">
                {tile.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
