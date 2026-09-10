import React, { useState } from 'react';
import { ShieldCheck, Info, Sparkles, TrendingUp } from 'lucide-react';
import { PriceBreakdown } from '../types';

interface PricingBreakdownProps {
  price: number;
  unit?: string;
  quantity?: number;
  compact?: boolean;
  className?: string;
}

export const PricingBreakdown: React.FC<PricingBreakdownProps> = ({
  price,
  unit,
  quantity = 1,
  compact = false,
  className = '',
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const total = Math.round(price * quantity * 100) / 100;
  const farmerShare = Math.round(total * 0.88 * 100) / 100;
  const logisticsShare = Math.round(total * 0.07 * 100) / 100;
  const platformShare = Math.round((total - farmerShare - logisticsShare) * 100) / 100;
  const conventionalFarmerShare = Math.round(total * 0.15 * 100) / 100;
  const extraFarmerBenefit = Math.round((farmerShare - conventionalFarmerShare) * 100) / 100;

  if (compact) {
    return (
      <div className={`text-xs ${className}`}>
        <div className="flex items-center justify-between font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-200">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>
              Farmer keeps <strong>₹{farmerShare.toFixed(2)}</strong> (88%)
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowExplanation(!showExplanation);
            }}
            className="text-emerald-700 hover:text-emerald-900 underline text-[11px] ml-1"
          >
            Breakdown
          </button>
        </div>

        {showExplanation && (
          <div className="mt-2 p-2.5 bg-white border border-neutral-200 rounded-md shadow-sm space-y-1.5 text-neutral-600 animate-in fade-in duration-150">
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                Farmer Net (88%):
              </span>
              <strong className="text-emerald-700 font-semibold">₹{farmerShare.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-500 inline-block"></span>
                Cold-Chain &amp; Routing (7%):
              </span>
              <span className="text-neutral-700">₹{logisticsShare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                Platform Maintenance (5%):
              </span>
              <span className="text-neutral-700">₹{platformShare.toFixed(2)}</span>
            </div>
            <div className="pt-1.5 border-t border-neutral-150 text-[11px] text-neutral-500">
              In conventional supermarkets, the farmer receives only ~₹{conventionalFarmerShare.toFixed(2)} (15%).
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-white border border-neutral-200 rounded-xl p-4 shadow-xs text-sm ${className}`}
      id="transparent-pricing-breakdown-card"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 text-sm">Automated Transparent Economics</h4>
            <p className="text-xs text-neutral-500">Verified fair-trade breakdown per unit sold</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          88% Direct to Grower
        </span>
      </div>

      {/* Visual Proportional Split Bar */}
      <div className="mb-3.5">
        <div className="h-3.5 w-full bg-neutral-100 rounded-full flex overflow-hidden p-0.5 border border-neutral-200">
          <div
            style={{ width: '88%' }}
            className="bg-emerald-600 h-full rounded-l-full transition-all duration-300"
            title="Farmer Share: 88%"
          />
          <div
            style={{ width: '7%' }}
            className="bg-sky-500 h-full transition-all duration-300"
            title="Logistics & Cold-Chain: 7%"
          />
          <div
            style={{ width: '5%' }}
            className="bg-amber-500 h-full rounded-r-full transition-all duration-300"
            title="Platform Maintenance: 5%"
          />
        </div>
        <div className="flex justify-between text-[11px] text-neutral-500 mt-1 px-1">
          <span className="text-emerald-700 font-medium">88% Farmer</span>
          <span className="text-sky-700 font-medium">7% Logistics</span>
          <span className="text-amber-700 font-medium">5% Tech Ops</span>
        </div>
      </div>

      {/* Numerical Line Breakdown */}
      <div className="space-y-2 py-2 border-y border-neutral-150 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span className="text-neutral-700 font-medium">Direct Farmer Take-Home Payout</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-emerald-700 text-sm">₹{farmerShare.toFixed(2)}</span>
            <span className="text-neutral-400 text-[11px] ml-1.5">(88.0%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span className="text-neutral-700">Rural Collection &amp; Cold-Chain</span>
          </div>
          <div className="text-right">
            <span className="font-medium text-neutral-800">₹{logisticsShare.toFixed(2)}</span>
            <span className="text-neutral-400 text-[11px] ml-1.5">(7.0%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-neutral-700">Platform Maintenance &amp; Card Processing</span>
          </div>
          <div className="text-right">
            <span className="font-medium text-neutral-800">₹{platformShare.toFixed(2)}</span>
            <span className="text-neutral-400 text-[11px] ml-1.5">(5.0%)</span>
          </div>
        </div>
      </div>

      {/* Comparison with Industrial Supermarket Economics */}
      <div className="mt-3 bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <p className="font-semibold text-amber-950">Market Comparison</p>
            <p className="mt-0.5 text-amber-800">
              Conventional supermarket supply chains pay farmers only ~15% (
              <strong>₹{conventionalFarmerShare.toFixed(2)}</strong> on this amount). FarmDirect delivers{' '}
              <strong className="text-emerald-800 font-bold">+₹{extraFarmerBenefit.toFixed(2)} more</strong> directly to
              the producer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
