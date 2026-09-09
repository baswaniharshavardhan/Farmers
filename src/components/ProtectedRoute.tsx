import React from 'react';
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  LogOut,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  targetPath: string;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  targetPath,
  children,
}) => {
  const { currentUser, isLoggedIn, logout, navigate } = useMarketplace();

  // Normalize customer and consumer
  const currentRole =
    currentUser?.role === 'consumer' ? 'customer' : currentUser?.role;
  const normalizedAllowed = allowedRoles.map((r) =>
    r === 'consumer' ? 'customer' : r
  );

  // 1. Not Authenticated check
  if (!isLoggedIn || !currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center text-white shadow-2xl">
          <div className="w-16 h-16 bg-red-950/80 border border-red-800/80 rounded-2xl flex items-center justify-center mx-auto mb-5 text-red-400">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
            You must be authenticated with a valid session token to access{' '}
            <code className="bg-neutral-800 px-2 py-0.5 rounded text-amber-400 font-mono">
              {targetPath}
            </code>
            .
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
          >
            <span>Proceed to Login Hub</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 2. Role Permission check
  const isAuthorized = normalizedAllowed.includes(currentRole as any);

  if (!isAuthorized) {
    const userRoleDisplay = (currentUser.role || 'unknown').toUpperCase();
    const authorizedRolesDisplay = allowedRoles
      .map((r) => r.toUpperCase())
      .join(' or ');

    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-neutral-950 border-2 border-red-800/60 rounded-3xl p-8 text-white shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Header Warning */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-red-950 border border-red-700/60 rounded-2xl flex items-center justify-center text-red-400 flex-shrink-0 shadow-lg shadow-red-950">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950 border border-red-800 text-red-300 uppercase tracking-wide mb-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Security Shield Block (HTTP 403)</span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white">
                Unauthorized Route Access Blocked
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                You do not possess the required credentials to view this protected view.
              </p>
            </div>
          </div>

          {/* Audit Details */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-xs space-y-2.5 font-mono">
            <div className="flex justify-between items-center py-1 border-b border-neutral-800 text-neutral-400">
              <span>Attempted Target Route:</span>
              <span className="text-amber-400 font-bold">{targetPath}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-neutral-800 text-neutral-400">
              <span>Required Role Permissions:</span>
              <span className="text-emerald-400 font-bold">{authorizedRolesDisplay}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-neutral-800 text-neutral-400">
              <span>Your Authenticated Role:</span>
              <span className="text-red-400 font-bold">{userRoleDisplay}</span>
            </div>
            <div className="flex justify-between items-center py-1 text-neutral-400">
              <span>Current User:</span>
              <span className="text-white">{currentUser.name} ({currentUser.email})</span>
            </div>
          </div>

          {/* Explanation */}
          <p className="text-xs text-neutral-300 leading-relaxed bg-red-950/30 border border-red-900/40 p-3.5 rounded-xl">
            <strong>Frontend Route Protection Active:</strong> Even if the browser URL is changed to{' '}
            <code className="text-amber-300 font-mono">{targetPath}</code>, the protected layout
            interceptor enforces role boundaries. A {currentUser.role} cannot view {authorizedRolesDisplay} governance
            or private operational data.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (currentRole === 'farmer') navigate('/farmer-dashboard');
                else if (currentRole === 'admin') navigate('/admin-dashboard');
                else navigate('/customer-dashboard');
              }}
              className="flex-1 py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-neutral-700"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Return to My Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => logout()}
              className="flex-1 py-3 px-4 bg-red-900/60 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-red-700/60"
            >
              <LogOut className="w-4 h-4 text-red-300" />
              <span>Sign In with Different Role</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized -> render protected view
  return <>{children}</>;
};
