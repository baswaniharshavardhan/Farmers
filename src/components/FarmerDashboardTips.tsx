import React, { useState } from 'react';
import {
  Lightbulb,
  Sprout,
  Droplets,
  Bug,
  ThermometerSnowflake,
  TrendingUp,
  CloudSun,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const FarmerDashboardTips: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'soil' | 'water' | 'pest' | 'yield' | 'postharvest'
  >('all');

  const tips = [
    {
      id: 'tip-1',
      category: 'soil',
      title: 'Panchagavya & Bio-Enzymes for Rhizosphere Health',
      summary:
        'Ferment cow dung, cow urine, milk, curd, and jaggery for 21 days. Dilute 3% in irrigation water to boost beneficial mycorrhizae and increase phosphorus uptake by 35%.',
      impact: '+18% Root Biomass',
      season: 'Pre-Sowing & Vegetative',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    },
    {
      id: 'tip-2',
      category: 'water',
      title: 'Drip Pulsing & Tensiometer Irrigation Scheduling',
      summary:
        'Watering in two 45-minute daily pulses instead of a single 90-minute session prevents nutrient leaching past the active root zone (top 30cm) and cuts electricity consumption.',
      impact: '42% Water Saved',
      season: 'Dry & Flowering Stage',
      badgeColor: 'bg-sky-100 text-sky-900 border-sky-200',
    },
    {
      id: 'tip-3',
      category: 'pest',
      title: 'Neem Seed Kernel Extract (NSKE 5%) & Sticky Traps',
      summary:
        'Spray fresh NSKE 5% at dawn to deter sucking pests (whiteflies, thrips, aphids). Hang yellow and blue sticky cards (15 per acre) to monitor insect pressure before economic threshold.',
      impact: 'Zero Chemical Residue',
      season: 'Early Infestation Alert',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    },
    {
      id: 'tip-4',
      category: 'postharvest',
      title: 'Pre-Cooling & Night/Dawn Harvest Window',
      summary:
        'Harvest greens and tomatoes between 5:00 AM and 7:30 AM before field heat sets in. Pre-cool in shaded evaporative zero-energy cool chambers (ZECC) to prolong shelf life from 3 to 10 days.',
      impact: '-80% Transit Spoilage',
      season: 'Harvest Season',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
    },
    {
      id: 'tip-5',
      category: 'yield',
      title: 'Mulching with Biodegradable Crop Stubble',
      summary:
        'Applying a 7cm layer of shredded straw mulch suppresses 90% of weeds, retains soil moisture during peak afternoon heat, and breaks down into rich humus for the next crop cycle.',
      impact: '+22% Marketable Yield',
      season: 'Post-Transplanting',
      badgeColor: 'bg-teal-100 text-teal-900 border-teal-200',
    },
  ];

  const filteredTips =
    selectedCategory === 'all'
      ? tips
      : tips.filter((t) => t.category === selectedCategory);

  return (
    <div
      className={`bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs ${className}`}
      id="farmer-dashboard-tips-card"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-neutral-900 text-base">
                Agronomic Tips for Higher Yields &amp; Development
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                FPO Advisory
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Expert recommendations from agronomy researchers to maximize crop grade, soil fertility, and profit
            </p>
          </div>
        </div>

        {/* Quick weather / seasonal highlight */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-700">
          <CloudSun className="w-4 h-4 text-amber-500" />
          <span>Optimal field moisture conditions this week</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5 mb-4 pb-3 border-b border-neutral-150 text-xs">
        {[
          { id: 'all', label: 'All Advisories' },
          { id: 'soil', label: 'Soil & Organic Compost' },
          { id: 'water', label: 'Drip & Irrigation' },
          { id: 'pest', label: 'Bio-Pest Control' },
          { id: 'postharvest', label: 'Post-Harvest Cold Care' },
          { id: 'yield', label: 'Yield Boosting' },
        ].map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedCategory === cat.id
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredTips.map((tip) => (
          <div
            key={tip.id}
            className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 hover:bg-neutral-50 hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${tip.badgeColor}`}
                >
                  {tip.impact}
                </span>
                <span className="text-[11px] text-neutral-400 font-medium">{tip.season}</span>
              </div>
              <h4 className="font-bold text-neutral-900 text-sm leading-snug mb-1.5">
                {tip.title}
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">{tip.summary}</p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-neutral-200 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified by Krishi Vigyan Kendra
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
