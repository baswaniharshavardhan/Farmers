import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  Building2,
  FileText,
  Heart,
  Save,
  CheckCircle2,
  Landmark,
  BadgeCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { User } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, setSystemNotification, orders, payoutRecords } =
    useMarketplace();

  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [address, setAddress] = useState(currentUser.address || '');
  const [city, setCity] = useState(currentUser.city || '');
  const [zipCode, setZipCode] = useState(currentUser.zipCode || '');
  const [deliveryNotes, setDeliveryNotes] = useState(currentUser.deliveryNotes || '');
  const [preferredPayment, setPreferredPayment] = useState(
    currentUser.preferredPaymentMethod || 'pay_on_delivery'
  );

  // Farmer specific details
  const [age, setAge] = useState<string>(currentUser.age ? String(currentUser.age) : '46');
  const [aadhaarNumber, setAadhaarNumber] = useState(
    currentUser.aadhaarNumber || '5829-4102-4821'
  );
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(
    currentUser.gender || 'Male'
  );
  const [location, setLocation] = useState(currentUser.farmLocation || currentUser.city || 'Nashik Valley');
  const [fpoName, setFpoName] = useState(
    currentUser.fpoName || 'Sahyadri Farmers Producer Co. Ltd. (SFPC)'
  );
  const [fpoNumber, setFpoNumber] = useState(currentUser.fpoNumber || 'FPO-MH-2021-9842');

  // Bank details for farmer
  const [bankName, setBankName] = useState(currentUser.bankName || 'State Bank of India');
  const [accountHolderName, setAccountHolderName] = useState(
    currentUser.accountHolderName || currentUser.name
  );
  const [bankAccountNumber, setBankAccountNumber] = useState(
    currentUser.bankAccountNumber || '••••••••9842'
  );
  const [ifscCode, setIfscCode] = useState(currentUser.ifscCode || 'SBIN0001234');
  const [upiId, setUpiId] = useState(
    currentUser.upiId || `${(currentUser.email || 'user').split('@')[0]}@okhdfcbank`
  );
  const [directPayoutActive, setDirectPayoutActive] = useState(
    currentUser.directPayoutActive ?? true
  );

  // Dietary preferences for customer
  const [dietary, setDietary] = useState<string[]>(
    currentUser.dietaryPreferences || ['100% Organic', 'Pesticide-Free', 'Locally Grown']
  );

  if (!isOpen) return null;

  const handleToggleDietary = (item: string) => {
    setDietary((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: User = {
      ...currentUser,
      name,
      email,
      phone,
      address,
      city,
      zipCode,
      deliveryNotes,
      preferredPaymentMethod: preferredPayment,
      dietaryPreferences: dietary,
      // Farmer specifics
      age: age ? Number(age) : undefined,
      aadhaarNumber,
      gender,
      farmLocation: location,
      fpoName,
      fpoNumber,
      bankName,
      accountHolderName,
      bankAccountNumber,
      ifscCode,
      upiId,
      directPayoutActive,
    };

    setCurrentUser(updatedUser);
    // Persist in localStorage
    try {
      const savedUsers = localStorage.getItem('farmdirect_users_v1');
      if (savedUsers) {
        const usersList: User[] = JSON.parse(savedUsers);
        const idx = usersList.findIndex((u) => u.id === currentUser.id);
        if (idx !== -1) {
          usersList[idx] = updatedUser;
          localStorage.setItem('farmdirect_users_v1', JSON.stringify(usersList));
        }
      }
    } catch {
      // ignore
    }

    setSystemNotification('Profile and account details successfully updated.');
    setIsEditing(false);
  };

  const isFarmer = currentUser.role === 'farmer';
  const customerOrders = orders.filter((o) => o.buyerName === currentUser.name || currentUser.role === 'admin');
  const totalSpend = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        id="user-profile-modal"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 bg-neutral-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">User Profile &amp; Preferences</h3>
              <p className="text-xs text-neutral-500">
                Manage your account credentials, regional delivery address &amp; bank configurations
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            id="btn-close-profile-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Identity Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200 gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={currentUser.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-neutral-900 text-base">{currentUser.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  {currentUser.email}
                </p>
                <span className="text-[11px] text-neutral-400">
                  Member since {new Date(currentUser.registeredAt || '2026-01-15').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                Verified Account
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
                id="btn-toggle-edit-profile"
              >
                {isEditing ? 'Cancel Editing' : 'Edit Profile Details'}
              </button>
            </div>
          </div>

          {/* Core Contact & Demographics */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5" />
              Personal &amp; Contact Details
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white disabled:bg-neutral-50 disabled:text-neutral-600 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white disabled:bg-neutral-50 disabled:text-neutral-600 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Farmer-Specific Details Section (Age, Aadhaar, Gender, FPO, Bank) */}
          {isFarmer && (
            <div className="space-y-4 pt-3 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Farmer Verification &amp; FPO Affiliation
                </h5>
                <span className="text-[11px] text-emerald-600 font-medium">Government Registered Producer</span>
              </div>

              {/* Demographics: Age, Aadhaar, Gender, Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Age</label>
                  <input
                    type="number"
                    disabled={!isEditing}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white disabled:bg-neutral-50 disabled:text-neutral-600 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Gender</label>
                  <select
                    disabled={!isEditing}
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white disabled:bg-neutral-50 disabled:text-neutral-600 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Aadhaar Card No.</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    placeholder="XXXX-XXXX-4821"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white disabled:bg-neutral-50 disabled:text-neutral-600 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* FPO Details */}
              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-emerald-950">FPO Affiliation Credentials</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                      FPO Organization Name
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={fpoName}
                      onChange={(e) => setFpoName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-emerald-300 bg-white disabled:bg-emerald-50/50 disabled:text-neutral-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                      FPO Registration / License Number
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={fpoNumber}
                      onChange={(e) => setFpoNumber(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-emerald-300 bg-white disabled:bg-emerald-50/50 disabled:text-neutral-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Integration: Bank Account Configuration */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-neutral-900">
                      Direct Payout Bank Account Details
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Direct Payouts Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white disabled:bg-neutral-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white disabled:bg-neutral-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white disabled:bg-neutral-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white disabled:bg-neutral-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono uppercase"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      UPI ID (Instant Settlement)
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="farmer@upi"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white disabled:bg-neutral-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Address & Customer Details */}
          <div className="space-y-3 pt-3 border-t border-neutral-200">
            <h5 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Delivery Location &amp; Dropoff
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Street Address</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Apartment, Street name, Landmark"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white disabled:bg-neutral-50 disabled:text-neutral-600 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">City</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white disabled:bg-neutral-50 disabled:text-neutral-600 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Postal / PIN Code</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white disabled:bg-neutral-50 disabled:text-neutral-600 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Preferred Payment</label>
                <select
                  disabled={!isEditing}
                  value={preferredPayment}
                  onChange={(e) => setPreferredPayment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white disabled:bg-neutral-50 disabled:text-neutral-600 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="pay_on_delivery">Pay on Delivery (Cash / UPI)</option>
                  <option value="upi_direct">UPI Direct (GPay / PhonePe)</option>
                  <option value="card">Debit / Credit Card</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Dietary Preferences */}
          {!isFarmer && (
            <div className="space-y-2.5 pt-3 border-t border-neutral-200">
              <h5 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                Dietary &amp; Sourcing Preferences
              </h5>
              <div className="flex flex-wrap gap-2">
                {[
                  '100% Organic',
                  'Pesticide-Free',
                  'Locally Grown',
                  'Zero Preservatives',
                  'Non-GMO',
                  'FPO Direct Sourced',
                ].map((item) => (
                  <button
                    type="button"
                    key={item}
                    disabled={!isEditing}
                    onClick={() => handleToggleDietary(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      dietary.includes(item)
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs flex items-center gap-2 transition-colors"
                id="btn-save-profile"
              >
                <Save className="w-4 h-4" />
                Save Profile Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
