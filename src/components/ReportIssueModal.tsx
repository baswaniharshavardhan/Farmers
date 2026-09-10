import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Upload,
  CheckCircle2,
  FileQuestion,
  HelpCircle,
  Clock,
  ShieldAlert,
  Paperclip,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { CustomerReport } from '../types';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedOrderId?: string;
  preselectedProductId?: string;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  preselectedOrderId,
  preselectedProductId,
}) => {
  const { currentUser, orders, products, setSystemNotification } = useMarketplace();

  const [category, setCategory] = useState<CustomerReport['category']>(
    'Quality Issue'
  );
  const [orderId, setOrderId] = useState<string>(preselectedOrderId || '');
  const [productId, setProductId] = useState<string>(preselectedProductId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'Urgent'>('Medium');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [fileName, setFileName] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReport: CustomerReport = {
      id: ticketId,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      category,
      title: title.trim(),
      description: description.trim(),
      orderId: orderId || undefined,
      productId: productId || undefined,
      urgency,
      status: 'Investigating',
      createdAt: new Date().toISOString(),
      resolutionNotes: 'Dispatched to FPO Quality Control supervisor.',
    };

    // Store in localStorage for customer tracking
    try {
      const existing = localStorage.getItem('farmdirect_customer_reports_v1');
      const reports: CustomerReport[] = existing ? JSON.parse(existing) : [];
      reports.unshift(newReport);
      localStorage.setItem('farmdirect_customer_reports_v1', JSON.stringify(reports));
    } catch {
      // ignore
    }

    setSubmittedTicket(ticketId);
    setSystemNotification(
      `Issue ticket #${ticketId} submitted. Our FPO quality team will investigate promptly.`
    );
  };

  const handleReset = () => {
    setSubmittedTicket(null);
    setTitle('');
    setDescription('');
    setHasPhoto(false);
    setFileName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col"
        id="report-issue-modal"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 bg-neutral-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Report an Issue or Concern</h3>
              <p className="text-xs text-neutral-500">
                100% Quality &amp; Transparency Guarantee backed by your local FPO
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

        {/* Modal Body */}
        {submittedTicket ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-neutral-900 text-lg">Report Ticket Logged</h4>
              <p className="text-xs font-mono font-bold text-emerald-700 mt-1">
                Ticket ID: #{submittedTicket}
              </p>
              <p className="text-xs text-neutral-600 mt-2 max-w-sm mx-auto leading-relaxed">
                Thank you for bringing this to our attention. Your report has been dispatched to the
                regional FPO supervisor and customer support desk. Under our Freshness Guarantee,
                eligible items receive immediate replacement or instant UPI refund within 2 hours.
              </p>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-left space-y-1">
              <div className="flex justify-between text-neutral-500">
                <span>Reporter:</span>
                <span className="font-semibold text-neutral-800">{currentUser.name}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Category:</span>
                <span className="font-semibold text-neutral-800">{category}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Status:</span>
                <span className="font-semibold text-amber-600">Investigating with FPO</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Done &amp; Return to Marketplace
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Issue Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="Quality Issue">Quality Issue / Freshness Concern</option>
                <option value="Damaged Goods">Damaged Produce / Transit Bruising</option>
                <option value="Delayed Delivery">Delayed Delivery / Courier Inquiry</option>
                <option value="Pricing/Description">Incorrect Pricing or Listing Details</option>
                <option value="FPO Inquiry">FPO Verification &amp; Sourcing Query</option>
                <option value="General Feedback">General Feedback &amp; Suggestions</option>
              </select>
            </div>

            {/* Link to Order (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Related Order (Optional)
                </label>
                <select
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="">None / General Inquiry</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id} - ₹{o.totalAmount} ({new Date(o.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Urgency Level
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Low">Low - Feedback only</option>
                  <option value="Medium">Medium - Response requested</option>
                  <option value="Urgent">Urgent - Quality/Food Safety Issue</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Subject / Summary *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Tomatoes had bruising upon arrival"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Detailed Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the issue in detail (condition of produce, delivery packaging, discrepancies)..."
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            {/* Photo Attachment (Drag & Drop or Click) */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Attach Photo Evidence (Recommended)
              </label>
              <div
                onClick={() => {
                  setHasPhoto(true);
                  setFileName('produce_quality_inspection.jpg');
                }}
                className={`p-3.5 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
                  hasPhoto
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-neutral-300 hover:border-emerald-400 bg-neutral-50'
                }`}
              >
                {hasPhoto ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{fileName} attached</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHasPhoto(false);
                        setFileName('');
                      }}
                      className="text-neutral-400 hover:text-neutral-700 ml-2 text-xs underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-neutral-500 text-xs">
                    <Upload className="w-4 h-4 text-neutral-400" />
                    <span>Click or drag photo of produce / packaging</span>
                    <span className="text-[10px] text-neutral-400">JPG, PNG up to 10MB</span>
                  </div>
                )}
              </div>
            </div>

            {/* Guarantee Note */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-[11px] text-amber-900 leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>
                All claims are resolved under FarmDirect's <strong>Zero-Hassle Freshness Guarantee</strong>.
                If any produce does not meet farm-grade standards, the cost is immediately credited or replaced.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors"
                id="btn-submit-report-issue"
              >
                Submit Report Ticket
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
