import React, { useState } from 'react';
import {
  Landmark,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Info,
  Bug,
  AlertTriangle,
  FileText,
  DollarSign,
  Sun,
  Sprout,
  X,
} from 'lucide-react';
import { FarmerScheme, PesticideComparison } from '../types';

interface FarmerSchemesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FarmerSchemesModal: React.FC<FarmerSchemesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'schemes' | 'subsidies' | 'pesticides'>('schemes');

  if (!isOpen) return null;

  const schemes: FarmerScheme[] = [
    {
      id: 'sch-1',
      title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      category: 'Direct Income',
      authority: 'Ministry of Agriculture & Farmers Welfare',
      subsidyPercentage: '100% Direct Grant',
      benefitSummary: '₹6,000 per year transferred directly to bank account in 3 equal four-monthly tranches of ₹2,000.',
      eligibility: 'All landholding farmer families across India having cultivable landholding in their names.',
      applicationLink: 'https://pmkisan.gov.in',
      deadline: 'Ongoing Enrollment',
      status: 'Open',
    },
    {
      id: 'sch-2',
      title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      category: 'Crop Insurance',
      authority: 'Department of Agriculture and Farmers Welfare',
      subsidyPercentage: '85-90% Premium Subsidized',
      benefitSummary: 'Comprehensive risk insurance against drought, flood, pests, and post-harvest loss at nominal 1.5% to 2% premium.',
      eligibility: 'All farmers growing notified food crops, oilseeds, and annual horticultural crops.',
      applicationLink: 'https://pmfby.gov.in',
      deadline: 'Season-based (Kharif / Rabi cutoffs)',
      status: 'Open',
    },
    {
      id: 'sch-3',
      title: 'Agriculture Infrastructure Fund (AIF)',
      category: 'Infrastructure',
      authority: 'National Bank for Agriculture and Rural Development (NABARD)',
      subsidyPercentage: '3% Interest Subvention',
      benefitSummary: 'Low-interest loans up to ₹2 Crore for setting up cold storage, pack-houses, sorting units, and solar dryers.',
      eligibility: 'Individual farmers, FPOs, Self Help Groups, and Primary Agricultural Credit Societies.',
      applicationLink: 'https://agriinfra.dac.gov.in',
      deadline: 'Active through 2028-29',
      status: 'Open',
    },
    {
      id: 'sch-4',
      title: 'Sub-Mission on Agricultural Mechanization (SMAM)',
      category: 'Equipment & Solar',
      authority: 'Mechanization & Technology Division',
      subsidyPercentage: '40% - 50% Capital Subsidy',
      benefitSummary: 'Substantial subsidy for purchasing tractors, power tillers, laser land levelers, and drip fertigation equipment.',
      eligibility: 'Small and marginal farmers, women farmers, and registered FPO collectives.',
      applicationLink: 'https://agrimachinery.nic.in',
      deadline: 'Quarterly Application Windows',
      status: 'Open',
    },
    {
      id: 'sch-5',
      title: 'Paramparagat Krishi Vikas Yojana (PKVY)',
      category: 'Organic Certification',
      authority: 'National Mission for Sustainable Agriculture',
      subsidyPercentage: '₹50,000 per Hectare',
      benefitSummary: 'Financial assistance for bio-fertilizers, vermicomposting pits, participatory guarantee certification, and packaging.',
      eligibility: 'Farmers willing to form clusters of 20 or more hectares for regenerative practices.',
      applicationLink: 'https://pgsindia-ncof.gov.in',
      deadline: 'Cluster Rollout',
      status: 'Ongoing',
    },
  ];

  const subsidies = [
    {
      name: 'PM-KUSUM Solar Agricultural Pump Subsidy',
      subsidy: '60% to 70% Cost Covered',
      savings: 'Replaces expensive diesel generator pumping (saving ₹45,000/yr)',
      details: 'Central and state subsidy for installing 3HP to 7.5HP standalone DC/AC solar pumps and grid-connected solarization.',
      guidelines: 'Requires valid agricultural electricity connection or un-electrified pump site. Apply through State Renewable Energy Agency portal.',
    },
    {
      name: 'Naturally Ventilated Polyhouse & Shade Net Houses',
      subsidy: '50% Financial Assistance',
      savings: 'Enables off-season exotic cultivation (capsicum, cherry tomatoes, herbs)',
      details: 'Subsidized construction of protected cultivation infrastructure under the Mission for Integrated Development of Horticulture (MIDH).',
      guidelines: 'Assistance available for up to 4,000 sq. meters per beneficiary with approved structural design drawings.',
    },
    {
      name: 'Micro-Irrigation (Per Drop More Crop - PDMC)',
      subsidy: '55% Small/Marginal, 45% Other Farmers',
      savings: 'Reduces water use by 50% and fertilizer cost by 30%',
      details: 'Installation of high-efficiency drip lateral tubing, inline drippers, venturi injectors, and sand media filters.',
      guidelines: 'Pre-registered drip manufacturers install and service equipment with 5-year warranty.',
    },
    {
      name: 'On-Farm Cold Room & Pack-house Scheme',
      subsidy: '35% to 50% Credit-Linked Subsidy',
      savings: 'Prevents 85% spoilage during market glut periods',
      details: 'Financial grant for setting up 4 MT to 15 MT modular solar-powered cold rooms directly on the farm.',
      guidelines: 'FPOs receive preference with enhanced 50% grant capital subsidy.',
    },
  ];

  const pesticideComparisons: PesticideComparison[] = [
    {
      id: 'pest-comp-1',
      pestTarget: 'Sucking Pests (Aphids, Jassids, Whiteflies)',
      cropApplicable: 'Vegetables, Citrus, Cotton, Pulses',
      organicSolution: {
        name: 'Neem Seed Kernel Extract (NSKE 5%) + Soap Nut',
        composition: 'Azadirachtin 1500 PPM Botanical Extract',
        toxicityLevel: 'Non-Toxic / Eco-Safe',
        preHarvestInterval: '0 Days (Harvest Safe)',
        yieldProtectionScore: 8.8,
        costPerAcre: 380,
        recommended: true,
      },
      chemicalAlternative: {
        name: 'Imidacloprid 17.8% SL',
        toxicityLevel: 'High (Red/Yellow Label)',
        preHarvestInterval: '21 Days (Toxic Residue)',
        yieldProtectionScore: 9.1,
        costPerAcre: 850,
        soilDegradationRisk: 'High (harms beneficial bees & earthworms)',
      },
    },
    {
      id: 'pest-comp-2',
      pestTarget: 'Fruit & Shoot Borer, Diamondback Moth',
      cropApplicable: 'Tomatoes, Brinjal, Cabbage, Cauliflower',
      organicSolution: {
        name: 'Bacillus thuringiensis (Bt) kurstaki + Pheromone Traps',
        composition: 'Microbial bio-agent & lure attractant',
        toxicityLevel: 'Non-Toxic / Eco-Safe',
        preHarvestInterval: '1 Day',
        yieldProtectionScore: 9.0,
        costPerAcre: 450,
        recommended: true,
      },
      chemicalAlternative: {
        name: 'Chlorpyrifos 20% EC + Cypermethrin',
        toxicityLevel: 'High (Red/Yellow Label)',
        preHarvestInterval: '15 Days',
        yieldProtectionScore: 9.3,
        costPerAcre: 920,
        soilDegradationRisk: 'Severe persistent environmental toxicity',
      },
    },
    {
      id: 'pest-comp-3',
      pestTarget: 'Damping Off, Root Rot, Wilt Diseases',
      cropApplicable: 'Seedbeds, Seedlings, Nightshades',
      organicSolution: {
        name: 'Trichoderma viride 1% WP (Bio-Fungicide)',
        composition: 'Beneficial Antagonistic Fungal Spores',
        toxicityLevel: 'Non-Toxic / Eco-Safe',
        preHarvestInterval: '0 Days',
        yieldProtectionScore: 9.4,
        costPerAcre: 320,
        recommended: true,
      },
      chemicalAlternative: {
        name: 'Carbendazim 50% WP + Mancozeb',
        toxicityLevel: 'Moderate (Blue Label)',
        preHarvestInterval: '14 Days',
        yieldProtectionScore: 9.2,
        costPerAcre: 740,
        soilDegradationRisk: 'Kills natural mycorrhizal soil flora',
      },
    },
    {
      id: 'pest-comp-4',
      pestTarget: 'Sub-soil White Grubs & Termites',
      cropApplicable: 'Root vegetables, Sugarcane, Orchards',
      organicSolution: {
        name: 'Beauveria bassiana & Metarhizium anisopliae',
        composition: 'Entomopathogenic bio-fungal spores',
        toxicityLevel: 'Non-Toxic / Eco-Safe',
        preHarvestInterval: '0 Days',
        yieldProtectionScore: 8.9,
        costPerAcre: 420,
        recommended: true,
      },
      chemicalAlternative: {
        name: 'Fipronil 0.3% G Granules',
        toxicityLevel: 'High (Red/Yellow Label)',
        preHarvestInterval: '30 Days',
        yieldProtectionScore: 9.0,
        costPerAcre: 1100,
        soilDegradationRisk: 'Severe water table and groundwater risk',
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
        id="farmer-schemes-modal"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 bg-neutral-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">
                Government Schemes, Subsidies &amp; Pest Comparison Guide
              </h3>
              <p className="text-xs text-neutral-500">
                Official agricultural subsidies, grants &amp; certified eco-friendly pesticide benchmarks
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 px-5 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('schemes')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'schemes'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Landmark className="w-4 h-4" />
            Government Farmer Schemes ({schemes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('subsidies')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'subsidies'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Sun className="w-4 h-4" />
            Subsidy Guidelines &amp; Grants ({subsidies.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pesticides')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'pesticides'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Bug className="w-4 h-4" />
            Pesticide &amp; Bio-Control Comparison
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* TAB 1: SCHEMES */}
          {activeTab === 'schemes' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <span>
                  <strong>FPO Direct Assistance:</strong> Farmers registered under your FPO receive
                  priority documentation clearance and direct bank disbursement support.
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {schemes.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 mr-2">
                          {s.category}
                        </span>
                        <h4 className="font-bold text-neutral-900 text-sm inline">
                          {s.title}
                        </h4>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-neutral-200 shadow-2xs self-start sm:self-auto">
                        {s.subsidyPercentage}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-700 leading-relaxed mb-2">
                      {s.benefitSummary}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-500 pt-2 border-t border-neutral-200">
                      <div>
                        <span className="font-semibold text-neutral-700">Eligibility:</span>{' '}
                        {s.eligibility}
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <span>
                          <span className="font-semibold text-neutral-700">Window:</span> {s.deadline}
                        </span>
                        <a
                          href={s.applicationLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold underline"
                        >
                          Official Portal <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SUBSIDIES */}
          {activeTab === 'subsidies' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {subsidies.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {sub.subsidy}
                        </span>
                      </div>
                      <h4 className="font-bold text-neutral-900 text-sm mb-1">{sub.name}</h4>
                      <p className="text-xs font-semibold text-emerald-700 mb-2">{sub.savings}</p>
                      <p className="text-xs text-neutral-600 leading-relaxed mb-3">{sub.details}</p>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-neutral-200 text-[11px] text-neutral-500 leading-relaxed">
                      <strong className="text-neutral-700 block mb-0.5">Application Requirement:</strong>
                      {sub.guidelines}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PESTICIDE COMPARISON */}
          {activeTab === 'pesticides' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Zero-Residue Mandate:</strong> Products sold with FarmDirect Organic Certification
                  undergo lab residue testing. Using approved organic bio-pesticides avoids order rejection,
                  safeguards customer health, and costs up to 60% less per acre.
                </span>
              </div>

              <div className="space-y-4">
                {pesticideComparisons.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-neutral-150 pb-2">
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm">{item.pestTarget}</h4>
                        <span className="text-xs text-neutral-500">
                          Applicable on: {item.cropApplicable}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
                        Save ₹
                        {item.chemicalAlternative.costPerAcre - item.organicSolution.costPerAcre}/acre
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Organic solution (Green) */}
                      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Recommended Organic Solution
                          </span>
                          <span className="text-xs font-bold text-emerald-900">
                            ₹{item.organicSolution.costPerAcre}/acre
                          </span>
                        </div>
                        <h5 className="font-bold text-neutral-900 text-xs">
                          {item.organicSolution.name}
                        </h5>
                        <p className="text-[11px] text-neutral-600">
                          {item.organicSolution.composition}
                        </p>
                        <div className="flex justify-between text-[11px] text-neutral-500 pt-1 border-t border-emerald-200/60">
                          <span>Withholding Period: <strong>{item.organicSolution.preHarvestInterval}</strong></span>
                          <span>Efficacy: <strong>{item.organicSolution.yieldProtectionScore}/10</strong></span>
                        </div>
                      </div>

                      {/* Chemical alternative (Red/Gray) */}
                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 bg-neutral-200 px-2 py-0.5 rounded-md">
                            Conventional Chemical Alternative
                          </span>
                          <span className="text-xs font-bold text-neutral-800">
                            ₹{item.chemicalAlternative.costPerAcre}/acre
                          </span>
                        </div>
                        <h5 className="font-bold text-neutral-900 text-xs">
                          {item.chemicalAlternative.name}
                        </h5>
                        <p className="text-[11px] text-rose-700">
                          {item.chemicalAlternative.soilDegradationRisk}
                        </p>
                        <div className="flex justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-200">
                          <span>Withholding Period: <strong className="text-amber-700">{item.chemicalAlternative.preHarvestInterval}</strong></span>
                          <span>Toxicity: <strong>{item.chemicalAlternative.toxicityLevel}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500">
          <span>All schemes verified in accordance with Ministry of Agriculture Guidelines</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
