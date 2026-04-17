import React, { useState } from "react";
import { AppRecord } from "../../types.ts";
import { Button } from "../common/UIComponents.tsx";
import { X, LayoutGrid, Info, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AssignmentModalProps {
  app: AppRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (appId: string, groupId: string) => Promise<void>;
}

const GROUPS = [
  { id: "communications-main", label: "Communications (Main)" },
  { id: "social-media", label: "Social Media & Networking" },
  { id: "productivity-tools", label: "Productivity & Utilities" },
  { id: "entertainment-apps", label: "Streaming & Entertainment" },
  { id: "finance-crypto", label: "Finance & Blockchain" },
  { id: "shopping-retail", label: "Shopping & E-commerce" },
];

export default function AssignmentModal({ app, isOpen, onClose, onAssign }: AssignmentModalProps) {
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!app) return null;

  const handleAssign = async () => {
    if (!selectedGroupId) return;
    setIsSubmitting(true);
    await onAssign(app.id, selectedGroupId);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-lg shadow-2xl z-[70] overflow-hidden border border-utility-border"
          >
            <div className="px-5 py-3 border-b border-utility-border bg-[#fafafa] flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-utility-muted uppercase tracking-wider">Asset Assignment</h3>
              <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded transition-colors">
                <X className="w-4 h-4 text-utility-muted" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 p-3 bg-white border border-utility-border rounded-md mb-6">
                <img src={app.icon} className="w-8 h-8 rounded" referrerPolicy="no-referrer" />
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-utility-text truncate">{app.name}</p>
                  <p className="text-[11px] text-utility-muted truncate">{app.appId}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-utility-muted uppercase tracking-wider mb-1.5">App Group ID</label>
                  <select 
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-full bg-white border border-utility-border rounded px-3 py-2 text-[13px] text-utility-text focus:outline-none focus:ring-1 focus:ring-utility-accent"
                  >
                    <option value="">Choose target group...</option>
                    {GROUPS.map(g => (
                      <option key={g.id} value={g.id}>{g.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-8 flex gap-2">
                <Button variant="outline" className="flex-1 !h-9 text-[12px] font-bold uppercase tracking-wider" onClick={onClose}>Cancel</Button>
                <Button 
                  className="flex-1 !h-9 text-[12px] font-bold uppercase tracking-wider" 
                  disabled={!selectedGroupId} 
                  isLoading={isSubmitting}
                  onClick={handleAssign}
                >
                  <span>Assign</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
