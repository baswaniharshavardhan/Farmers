import React, { useState } from 'react';
import {
  ShoppingBag,
  Tractor,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  MapPin,
  ShieldCheck,
  CreditCard,
  Building2,
  DollarSign,
  Phone,
  Mail,
  Lock,
  User as UserIcon,
  HelpCircle,
  Check,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { CustomerSignUpData, FarmerSignUpData } from '../types';

interface SignUpFormsProps {
  initialRole?: 'consumer' | 'farmer';
  onSwitchToLogin: () => void;
}

const COMMON_CROPS = [
  'Heirloom Tomatoes',
  'Organic Apples',
  'Strawberries',
  'Kale & Chard',
  'Romanesco & Broccoli',
  'Pasture Eggs',
  'Artisan Raw Honey',
  'Meyer Lemons',
  'Stone Fruit',
  'Wild Foraged Mushrooms',
];

export const SignUpForms: React.FC<SignUpFormsProps> = ({
  initialRole = 'consumer',
  onSwitchToLogin,
}) => {
  const { registerCustomer, registerFarmer } = useMarketplace();

  const [role, setRole] = useState<'consumer' | 'farmer'>(initialRole);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Customer Form State
  const [customerData, setCustomerData] = useState<CustomerSignUpData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    streetAddress: '',
    city: 'San Francisco',
    zipCode: '94110',
    deliveryNotes: 'Porch cooler box / ring buzzer',
    preferredPaymentMethod: 'stripe',
  });

  // Farmer Form State
  const [farmerData, setFarmerData] = useState<FarmerSignUpData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    farmName: '',
    farmLocation: 'Sebastopol, Sonoma County, CA',
    bio: '',
    certifiedOrganic: true,
    certificationNumber: '',
    primaryCrops: ['Organic Apples', 'Heirloom Tomatoes'],
    acreage: 28,
    payoutMethod: 'direct_ach',
    bankRoutingNumber: '121000358',
    bankAccountNumber: '9876543210',
  });

  // Pre-fill Sample Customer
  const fillSampleCustomer = () => {
    setCustomerData({
      name: 'Julian Davies',
      email: `julian.${Math.floor(Math.random() * 900 + 100)}@sfbay.org`,
      password: 'SecurePassword123!',
      phone: '(415) 555-0188',
      streetAddress: '742 Valencia St, Apt 4B',
      city: 'San Francisco',
      zipCode: '94110',
      deliveryNotes: 'Leave in porch cold-box; ring buzzer 4B upon arrival',
      preferredPaymentMethod: 'stripe',
    });
    setErrorMsg(null);
  };

  // Pre-fill Sample Farmer
  const fillSampleFarmer = () => {
    const randomId = Math.floor(Math.random() * 900 + 100);
    setFarmerData({
      name: 'Maya Lin',
      email: `maya@goldenridge.${randomId}.farm`,
      password: 'FarmPassword2026!',
      phone: '(707) 555-0164',
      farmName: 'Golden Ridge Biodynamic Farm',
      farmLocation: 'Graton, Sonoma County, CA',
      bio: 'Family-run certified organic orchard and heirloom vegetable acreage practicing no-till regenerative agriculture.',
      certifiedOrganic: true,
      certificationNumber: `CCOF-ORG-${randomId}8`,
      primaryCrops: ['Heirloom Tomatoes', 'Strawberries', 'Kale & Chard'],
      acreage: 34,
      payoutMethod: 'direct_ach',
      bankRoutingNumber: '121000358',
      bankAccountNumber: '4488220019',
    });
    setErrorMsg(null);
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData.name.trim() || !customerData.email.trim() || !customerData.streetAddress.trim()) {
      setErrorMsg('Please fill in your name, email, and delivery street address.');
      return;
    }
    setErrorMsg(null);
    const res = await registerCustomer(customerData);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    } else {
      setIsSuccess(true);
    }
  };

  const handleFarmerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !farmerData.name.trim() ||
      !farmerData.email.trim() ||
      !farmerData.farmName.trim() ||
      !farmerData.certificationNumber.trim()
    ) {
      setErrorMsg('Please fill in your name, email, farm name, and certification number.');
      return;
    }
    setErrorMsg(null);
    const res = await registerFarmer(farmerData);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    } else {
      setIsSuccess(true);
    }
  };

  const toggleCrop = (crop: string) => {
    setFarmerData((prev) => {
      const exists = prev.primaryCrops.includes(crop);
      return {
        ...prev,
        primaryCrops: exists
          ? prev.primaryCrops.filter((c) => c !== crop)
          : [...prev.primaryCrops, crop],
      };
    });
  };

  return (
    <div className="max-w-3xl w-full mx-auto bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in duration-200">
      {/* Header Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3 h-3" />
            <span>New Account Registration</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Create Your FarmDirect Account
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Join the decentralized local food network with transparent 88% direct grower pricing.
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800">
          <button
            type="button"
            onClick={() => {
              setRole('consumer');
              setErrorMsg(null);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              role === 'consumer'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
            id="btn-tab-signup-customer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Customer Sign Up</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('farmer');
              setErrorMsg(null);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              role === 'farmer'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
            id="btn-tab-signup-farmer"
          >
            <Tractor className="w-4 h-4" />
            <span>Farmer Sign Up</span>
          </button>
        </div>
      </div>

      {/* Error Notification */}
      {errorMsg && (
        <div className="my-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. CUSTOMER SIGN UP FORM */}
      {role === 'consumer' && (
        <form onSubmit={handleCustomerSubmit} className="mt-6 space-y-6">
          {/* Quick Demo Pre-fill Banner */}
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-900/80 text-emerald-300 flex items-center justify-center flex-shrink-0 border border-emerald-700/50">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-200">
                  Quick Customer Account Fill
                </div>
                <div className="text-[11px] text-neutral-400">
                  Instantly populates realistic Bay Area buyer delivery and contact details.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={fillSampleCustomer}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer self-stretch sm:self-auto text-center"
              id="btn-prefill-customer"
            >
              Pre-fill Sample Customer
            </button>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>1. Buyer Profile &amp; Contact</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Full Name <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    placeholder="e.g. Julian Davies"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                    id="input-customer-name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Email Address <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                    placeholder="name@domain.com"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                    id="input-customer-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    placeholder="(415) 555-0188"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                    id="input-customer-phone"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Account Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={customerData.password}
                    onChange={(e) => setCustomerData({ ...customerData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                    id="input-customer-password"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address & Cold-Chain Details */}
          <div className="pt-4 border-t border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>2. Delivery Address &amp; Drop-off Notes</span>
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Street Address <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerData.streetAddress}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, streetAddress: e.target.value })
                  }
                  placeholder="e.g. 742 Valencia St, Apt 4B"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  id="input-customer-address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">City</label>
                  <input
                    type="text"
                    value={customerData.city}
                    onChange={(e) => setCustomerData({ ...customerData, city: e.target.value })}
                    placeholder="San Francisco"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                    id="input-customer-city"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={customerData.zipCode}
                    onChange={(e) => setCustomerData({ ...customerData, zipCode: e.target.value })}
                    placeholder="94110"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                    id="input-customer-zip"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Drop-off / Cold-Box Handling Instructions
                </label>
                <input
                  type="text"
                  value={customerData.deliveryNotes}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, deliveryNotes: e.target.value })
                  }
                  placeholder="e.g. Leave in porch insulated cooler, ring buzzer upon arrival"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  id="input-customer-notes"
                />
              </div>
            </div>
          </div>

          {/* Preferred Payment Method */}
          <div className="pt-4 border-t border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Preferred Payment &amp; Escrow Gateway</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'stripe', title: 'Stripe Escrow', desc: 'Auto-split to growers' },
                { id: 'ach', title: 'Direct ACH', desc: '0% processing fee' },
                { id: 'apple_pay', title: 'Apple Pay', desc: 'Biometric one-touch' },
              ].map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() =>
                    setCustomerData({
                      ...customerData,
                      preferredPaymentMethod: pm.id as 'stripe' | 'ach' | 'apple_pay',
                    })
                  }
                  className={`p-3 rounded-xl border text-left transition-all ${
                    customerData.preferredPaymentMethod === pm.id
                      ? 'border-emerald-500 bg-emerald-950/60 ring-1 ring-emerald-500 text-white'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">{pm.title}</div>
                  <div className="text-[10px] text-neutral-400">{pm.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button & Switch Link */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-xs text-neutral-400 hover:text-neutral-200 underline cursor-pointer"
            >
              Already have an account? Sign In here
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              id="btn-submit-customer-signup"
            >
              <span>Complete Customer Registration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* 2. FARMER SIGN UP FORM */}
      {role === 'farmer' && (
        <form onSubmit={handleFarmerSubmit} className="mt-6 space-y-6">
          {/* Quick Demo Pre-fill Banner */}
          <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-900/80 text-amber-300 flex items-center justify-center flex-shrink-0 border border-amber-700/50">
                <Tractor className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-200">
                  Quick Farmer Producer Fill
                </div>
                <div className="text-[11px] text-neutral-400">
                  Pre-fills a realistic organic orchard, license number, and direct ACH payout
                  details.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={fillSampleFarmer}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer self-stretch sm:self-auto text-center"
              id="btn-prefill-farmer"
            >
              Pre-fill Sample Farmer
            </button>
          </div>

          {/* Producer Profile & Contact */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Farmer / Producer Contact Info</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Grower Full Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={farmerData.name}
                  onChange={(e) => setFarmerData({ ...farmerData, name: e.target.value })}
                  placeholder="e.g. Maya Lin"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  id="input-farmer-name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Farm Contact Email <span className="text-amber-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={farmerData.email}
                  onChange={(e) => setFarmerData({ ...farmerData, email: e.target.value })}
                  placeholder="contact@farmname.com"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  id="input-farmer-email"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Phone / SMS Dispatch
                </label>
                <input
                  type="tel"
                  value={farmerData.phone}
                  onChange={(e) => setFarmerData({ ...farmerData, phone: e.target.value })}
                  placeholder="(707) 555-0164"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  id="input-farmer-phone"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Portal Password
                </label>
                <input
                  type="password"
                  value={farmerData.password}
                  onChange={(e) => setFarmerData({ ...farmerData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  id="input-farmer-password"
                />
              </div>
            </div>
          </div>

          {/* Farm Location & Production */}
          <div className="pt-4 border-t border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Farm Profile &amp; Cultivation</span>
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Official Farm / Orchard Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={farmerData.farmName}
                    onChange={(e) => setFarmerData({ ...farmerData, farmName: e.target.value })}
                    placeholder="e.g. Golden Ridge Biodynamic Farm"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    id="input-farmer-farmname"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Plot Location / County <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={farmerData.farmLocation}
                    onChange={(e) => setFarmerData({ ...farmerData, farmLocation: e.target.value })}
                    placeholder="e.g. Graton, Sonoma County, CA"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    id="input-farmer-farmlocation"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Farm Story / Growing Philosophy
                </label>
                <textarea
                  rows={2}
                  value={farmerData.bio}
                  onChange={(e) => setFarmerData({ ...farmerData, bio: e.target.value })}
                  placeholder="Describe your soil stewardship, irrigation, and harvest practices..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  id="textarea-farmer-bio"
                />
              </div>

              {/* Primary Crop Tags */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Primary Crops Cultivated (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_CROPS.map((crop) => {
                    const isSelected = farmerData.primaryCrops.includes(crop);
                    return (
                      <button
                        key={crop}
                        type="button"
                        onClick={() => toggleCrop(crop)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-amber-600 border-amber-500 text-white font-bold'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{crop}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Organic Accreditation & License */}
          <div className="pt-4 border-t border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>3. Certification &amp; Producer Verification</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Organic Certification ID / License # <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={farmerData.certificationNumber}
                  onChange={(e) =>
                    setFarmerData({ ...farmerData, certificationNumber: e.target.value })
                  }
                  placeholder="e.g. CCOF-ORG-88419"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-mono"
                  id="input-farmer-cert"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  Audited by the Admin Governance team before active verified badge is issued.
                </p>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 p-3 bg-neutral-950 border border-neutral-800 rounded-xl cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={farmerData.certifiedOrganic}
                    onChange={(e) =>
                      setFarmerData({ ...farmerData, certifiedOrganic: e.target.checked })
                    }
                    className="w-4 h-4 text-amber-600 rounded bg-neutral-900 border-neutral-700"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">USDA / CCOF Certified Organic</div>
                    <div className="text-[10px] text-neutral-400">
                      Produce grown with zero synthetic pesticides or synthetic fertilizers
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 88% Direct Payout Setup */}
          <div className="pt-4 border-t border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>4. 88% Direct Escrow Payout Account</span>
            </h3>
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
              <div className="text-xs text-neutral-300">
                <span className="font-bold text-emerald-400">88% Direct Grower Economics:</span>{' '}
                When customers purchase produce, 88% of funds are held in automated escrow and paid
                directly to this bank routing without middleman distributor markups.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    Bank Routing Number (9 Digits)
                  </label>
                  <input
                    type="text"
                    value={farmerData.bankRoutingNumber}
                    onChange={(e) =>
                      setFarmerData({ ...farmerData, bankRoutingNumber: e.target.value })
                    }
                    placeholder="121000358"
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white font-mono"
                    id="input-farmer-routing"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    Direct Deposit Account Number
                  </label>
                  <input
                    type="text"
                    value={farmerData.bankAccountNumber}
                    onChange={(e) =>
                      setFarmerData({ ...farmerData, bankAccountNumber: e.target.value })
                    }
                    placeholder="••••••••••"
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white font-mono"
                    id="input-farmer-account"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button & Switch Link */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-xs text-neutral-400 hover:text-neutral-200 underline cursor-pointer"
            >
              Already have an account? Sign In here
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              id="btn-submit-farmer-signup"
            >
              <span>Submit Farmer Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
