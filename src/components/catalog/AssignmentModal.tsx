import React, { useState } from "react";
import { AppRecord } from "../../types.ts";
import { Button } from "../common/UIComponents.tsx";
import { X, LayoutGrid, Info, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AssignmentModalProps {
  apps: AppRecord[];
  isOpen: boolean;
  onClose: () => void;
  onAssign: (appIds: string[], groupId: string) => Promise<void>;
}

const GROUPS = [
  { id: "communications-main", label: "Giao tiếp (Chính)" },
  { id: "social-media", label: "Mạng xã hội" },
  { id: "productivity-tools", label: "Công cụ Năng suất" },
  { id: "entertainment-apps", label: "Giải trí & Phát trực tuyến" },
  { id: "finance-crypto", label: "Tài chính & Tiền điện tử" },
  { id: "shopping-retail", label: "Mua sắm & Bán lẻ" },
];

export default function AssignmentModal({ apps, isOpen, onClose, onAssign }: AssignmentModalProps) {
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [customGroupId, setCustomGroupId] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAssign = async () => {
    const finalGroupId = useCustom ? customGroupId : selectedGroupId;
    if (!finalGroupId || apps.length === 0) return;
    
    setIsSubmitting(true);
    await onAssign(apps.map(a => a.id), finalGroupId);
    setIsSubmitting(false);
    onClose();
  };

  const isBulk = apps.length > 1;
  const hasApps = apps.length > 0;

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
              <h3 className="text-[11px] font-bold text-utility-muted uppercase tracking-wider">
                {!hasApps ? "Thông báo" : isBulk ? `Phân loại ${apps.length} Tài sản` : 'Phân loại tài sản'}
              </h3>
              <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded transition-colors">
                <X className="w-4 h-4 text-utility-muted" />
              </button>
            </div>

            <div className="p-6">
              {!hasApps ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info className="w-6 h-6 text-amber-600" />
                  </div>
                  <h4 className="text-[14px] font-bold text-utility-text mb-2">Chưa chọn ứng dụng</h4>
                  <p className="text-[12px] text-utility-muted mb-6">Bạn cần chọn ít nhất một ứng dụng từ danh sách trước khi thực hiện phân loại hoặc tạo nhóm mới.</p>
                  <Button onClick={onClose} className="w-full uppercase tracking-widest text-[11px]">Đã hiểu</Button>
                </div>
              ) : (
                <>
                  {isBulk ? (
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-md mb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-utility-accent" />
                        <span className="text-[13px] font-bold text-utility-text">Đã chọn {apps.length} ứng dụng</span>
                      </div>
                      <p className="text-[11px] text-utility-muted italic">Phân loại hàng loạt vào một nhóm duy nhất.</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-white border border-utility-border rounded-md mb-6">
                      <img src={apps[0].icon} className="w-8 h-8 rounded" referrerPolicy="no-referrer" />
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-utility-text truncate">{apps[0].name}</p>
                        <p className="text-[11px] text-utility-muted truncate">{apps[0].appId}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-utility-muted uppercase tracking-wider">ID Nhóm Ứng dụng</label>
                      <button 
                        onClick={() => setUseCustom(!useCustom)}
                        className="text-[10px] font-bold text-utility-accent hover:underline"
                      >
                        {useCustom ? "Chọn nhóm có sẵn" : "Tạo ID mới"}
                      </button>
                    </div>

                    {useCustom ? (
                      <input 
                        type="text"
                        value={customGroupId}
                        onChange={(e) => setCustomGroupId(e.target.value)}
                        placeholder="Nhập ID nhóm mới..."
                        className="w-full bg-white border border-utility-border rounded px-3 py-2 text-[13px] text-utility-text focus:outline-none focus:ring-1 focus:ring-utility-accent"
                        autoFocus
                      />
                    ) : (
                      <select 
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="w-full bg-white border border-utility-border rounded px-3 py-2 text-[13px] text-utility-text focus:outline-none focus:ring-1 focus:ring-utility-accent"
                      >
                        <option value="">Chọn nhóm mục tiêu...</option>
                        {GROUPS.map(g => (
                          <option key={g.id} value={g.id}>{g.label}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="mt-8 flex gap-2">
                    <Button variant="outline" className="flex-1 !h-9 text-[12px] font-bold uppercase tracking-wider" onClick={onClose}>Hủy bỏ</Button>
                    <Button 
                      className="flex-1 !h-9 text-[12px] font-bold uppercase tracking-wider" 
                      disabled={useCustom ? !customGroupId : !selectedGroupId} 
                      isLoading={isSubmitting}
                      onClick={handleAssign}
                    >
                      <span>Xác nhận</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
