import React, { useState } from 'react';
import {
  ShoppingBag,
  Tractor,
  ShieldCheck,
  Lock,
  Mail,
  Key,
  ArrowRight,
  AlertCircle,
  Leaf,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { UserRole } from '../types';
import { SignUpForms } from './SignUpForms';

export const LoginPortal: React.FC = () => {
  const { login } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('consumer');
  const [emailInput, setEmailInput] = useState('elena.rostova@sfbay.org');
  const [passwordInput, setPasswordInput] = useState('Password123!');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Demo accounts for quick 1-click autofill
  const demoAccounts = [
    {
      role: 'consumer' as UserRole,
      label: 'Customer',
      name: 'Elena Rostova',
      email: 'elena.rostova@sfbay.org',
      password: 'Password123!',
      icon: ShoppingBag,
      color: 'emerald',
    },
    {
      role: 'farmer' as UserRole,
      label: 'Farmer',
      name: 'Thomas Thorne',
      email: 'contact@sunriseorchards.farm',
      password: 'FarmerPass123!',
      icon: Tractor,
      color: 'amber',
    },
    {
      role: 'admin' as UserRole,
      label: 'Admin',
      name: 'Sarah Chen',
      email: 'sarah.chen@farmdirect.co',
      password: 'AdminSecure999!',
      icon: ShieldCheck,
      color: 'purple',
    },
  ];

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    const demo = demoAccounts.find((d) => d.role === role);
    if (demo) {
      setEmailInput(demo.email);
      setPasswordInput(demo.password);
    }
  };

  const handleQuickFill = (acc: (typeof demoAccounts)[0]) => {
    setSelectedRole(acc.role);
    setEmailInput(acc.email);
    setPasswordInput(acc.password);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMessage('Please enter an email address.');
      return;
    }
    if (!passwordInput.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await login(selectedRole, emailInput.trim(), passwordInput.trim());
      if (!res.success && res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-md w-full my-auto">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-950/60 mb-3 border border-emerald-400/20">
            <Leaf className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">FarmDirect</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Local Farm-to-Consumer Food Network
          </p>
        </div>

        {/* Main Auth Container */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Top Auth Navigation Tabs */}
          <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800 mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all text-center cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
              id="tab-auth-login"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
              id="tab-auth-signup"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2">
                  Select Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {demoAccounts.map((acc) => {
                    const Icon = acc.icon;
                    const isSelected = selectedRole === acc.role;
                    return (
                      <button
                        key={acc.role}
                        type="button"
                        onClick={() => handleSelectRole(acc.role)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all border cursor-pointer ${
                          isSelected
                            ? acc.role === 'consumer'
                              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                              : acc.role === 'farmer'
                              ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                              : 'bg-purple-950/80 border-purple-500 text-purple-300'
                            : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                        }`}
                        id={`btn-role-select-${acc.role}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{acc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick 1-Click Demo Fill Chips */}
              <div>
                <div className="text-[11px] text-neutral-400 mb-1.5 flex items-center justify-between">
                  <span>Fast Demo Fill:</span>
                </div>
                <div className="flex gap-1.5">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleQuickFill(acc)}
                      className={`flex-1 py-1 px-2 text-[11px] rounded-lg border font-medium transition-all text-center truncate cursor-pointer ${
                        selectedRole === acc.role
                          ? 'bg-neutral-800 border-neutral-600 text-white font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-300'
                      }`}
                    >
                      {acc.name.split(' ')[0]} ({acc.label})
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message Display */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-neutral-600 focus:outline-hidden transition-colors"
                    id="input-login-email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-neutral-600 focus:outline-hidden transition-colors font-mono"
                    id="input-login-password"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-xl text-xs font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedRole === 'consumer'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                      : selectedRole === 'farmer'
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/40'
                      : 'bg-purple-600 hover:bg-purple-500 shadow-purple-950/40'
                  } ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                  id="btn-login-submit"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Signing In...'
                      : `Sign In as ${
                          selectedRole === 'consumer'
                            ? 'Customer'
                            : selectedRole === 'farmer'
                            ? 'Farmer'
                            : 'Admin'
                        }`}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              {/* Link to Sign Up */}
              <div className="pt-2 text-center text-xs text-neutral-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SIGN UP */}
          {activeTab === 'signup' && (
            <div className="space-y-4">
              <SignUpForms
                initialRole={selectedRole === 'farmer' ? 'farmer' : 'consumer'}
                onSwitchToLogin={() => setActiveTab('login')}
              />
              <div className="pt-2 text-center text-xs text-neutral-400 border-t border-neutral-800">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Minimal Footer */}
        <div className="mt-6 text-center text-[11px] text-neutral-500">
          Protected &bull; Direct Farm-to-Consumer Food Network
        </div>
      </div>
    </div>
  );
};
