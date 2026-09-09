import React from 'react';
import { Printer, X, ShieldAlert, Thermometer, CheckCircle2, Box, QrCode } from 'lucide-react';
import { ShippingLabelData } from '../types';

interface ShippingLabelModalProps {
  labelData: ShippingLabelData | null;
  onClose: () => void;
}

export const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({ labelData, onClose }) => {
  if (!labelData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-neutral-900 text-base">Refrigerated Crate Shipping Label</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Printable Shipping Label Container */}
        <div
          id="printable-shipping-label"
          className="border-2 border-dashed border-neutral-800 rounded-xl p-5 bg-neutral-50/50 space-y-4 font-mono text-xs"
        >
          {/* Header Bar: Carrier and Cold Chain */}
          <div className="flex items-start justify-between border-b-2 border-neutral-800 pb-3">
            <div>
              <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                Direct-Farm Cold Carrier
              </div>
              <div className="text-base font-black text-neutral-950">FARMSYNC EXPRESS</div>
              <div className="text-[11px] font-bold text-emerald-800 mt-0.5">
                ROUTE BATCH: {labelData.batchCode}
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px] border border-blue-300">
                <Thermometer className="w-3 h-3 text-blue-700" /> {labelData.coldChainTemperature}
              </span>
              <div className="text-[10px] text-neutral-500 mt-1">DISPATCH: {labelData.dispatchTimestamp}</div>
            </div>
          </div>

          {/* Barcode representation */}
          <div className="flex flex-col items-center justify-center py-2 bg-white border border-neutral-300 rounded-lg">
            {/* Simulated 1D Barcode bars */}
            <div className="flex items-center gap-[2px] h-12 w-4/5 justify-center">
              {[4, 2, 6, 3, 1, 5, 2, 6, 3, 4, 1, 7, 2, 5, 3, 2, 6, 1, 4, 2, 5, 3, 6, 2, 4, 1, 5, 3, 2].map(
                (w, idx) => (
                  <span
                    key={idx}
                    className="bg-neutral-900 h-full"
                    style={{ width: `${w}px` }}
                  />
                )
              )}
            </div>
            <div className="text-xs font-mono font-bold tracking-widest text-neutral-800 mt-1">
              *{labelData.trackingNumber}*
            </div>
          </div>

          {/* Origin & Destination Grid */}
          <div className="grid grid-cols-2 gap-3 border-t-2 border-b-2 border-neutral-800 py-3 text-[11px]">
            {/* FROM */}
            <div className="pr-2 border-r border-neutral-300">
              <span className="font-black text-neutral-900 uppercase">SHIP FROM (ORIGIN):</span>
              <div className="font-bold text-neutral-900 mt-0.5">{labelData.farmName}</div>
              <div className="text-neutral-600 mt-0.5 text-[10px] leading-snug">{labelData.farmLocation}</div>
              <div className="text-emerald-700 font-semibold text-[10px] mt-1">
                ✓ Certified Origin Inspected
              </div>
            </div>

            {/* TO */}
            <div className="pl-2">
              <span className="font-black text-neutral-900 uppercase">DELIVER TO:</span>
              <div className="font-bold text-neutral-900 mt-0.5">{labelData.recipientName}</div>
              <div className="text-neutral-700 mt-0.5 text-[10px] leading-snug">
                {labelData.recipientAddress}
              </div>
              <div className="text-neutral-500 font-mono text-[10px] mt-1">
                Order ID: {labelData.orderId}
              </div>
            </div>
          </div>

          {/* Package Weight & Perishable Notice */}
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-neutral-600">Package Weight:</span>
              <span className="font-bold text-neutral-900">{labelData.packageWeight}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Perishable Category:</span>
              <span className="font-bold text-emerald-800">Fresh Organic Agricultural Goods</span>
            </div>
            <div className="bg-amber-100/70 border border-amber-300 rounded p-2 text-[10px] text-amber-900 flex items-start gap-1.5 font-sans">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>{labelData.handlingInstructions}</span>
            </div>
            <div className="text-[10px] text-neutral-500 truncate pt-1">
              <span className="font-semibold text-neutral-700">Contents:</span> {labelData.itemsSummary}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            id="btn-print-shipping-label"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Label (Thermal 4x6)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
