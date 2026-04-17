import React, { useState } from "react";
import { Search, Globe, Smartphone, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Button, StatusBadge } from "../components/common/UIComponents.tsx";
import { StoreType, CrawlResult } from "../types.ts";
import { motion, AnimatePresence } from "motion/react";

interface CrawlImportProps {
  onImportSuccess: () => void;
  onNavigate?: (tab: string) => void;
}

export default function CrawlImport({ onImportSuccess, onNavigate }: CrawlImportProps) {
  const [store, setStore] = useState<StoreType>("Google Play");
  const [appId, setAppId] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);
  const [preview, setPreview] = useState<CrawlResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [discoveries, setDiscoveries] = useState<CrawlResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set());
  const [isBulkImporting, setIsBulkImporting] = useState(false);

  const fetchDiscoveries = async (category: string) => {
    setSelectedCategory(category);
    setSelectedAppIds(new Set()); // Reset selection on category change
    try {
      const res = await fetch(`/api/app-catalog/discover?category=${category}`);
      const data = await res.json();
      setDiscoveries(data.map((d: any) => ({ ...d, readyToImport: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAppSelection = (appId: string) => {
    setSelectedAppIds(prev => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return next;
    });
  };

  const handleBulkImport = async () => {
    const appsToImport = discoveries.filter(d => selectedAppIds.has(d.appId));
    if (appsToImport.length === 0) return;

    setIsBulkImporting(true);
    try {
      for (const app of appsToImport) {
        await fetch("/api/app-catalog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(app),
        });
      }
      setImportSuccess(true);
      onImportSuccess();
      setDiscoveries([]);
      setSelectedCategory(null);
      setSelectedAppIds(new Set());
    } catch (err) {
      setError("Nhập hàng loạt thất bại ở một số ứng dụng.");
    } finally {
      setIsBulkImporting(false);
    }
  };

  const handleCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId) return;

    setIsCrawling(true);
    setError(null);
    setPreview(null);
    setImportSuccess(false);

    try {
      const res = await fetch("/api/app-catalog/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ store, appId }),
      });

      if (!res.ok) {
        throw new Error("Không thể thu thập dữ liệu. Vui lòng kiểm tra lại ID ứng dụng.");
      }

      const data = await res.json();
      setPreview(data);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi không mong đợi khi thu thập dữ liệu.");
    } finally {
      setIsCrawling(false);
    }
  };

  const handleImport = async () => {
    if (!preview) return;

    setImporting(true);
    try {
      const res = await fetch("/api/app-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preview),
      });

      if (!res.ok) throw new Error("Nhập dữ liệu thất bại");

      setImportSuccess(true);
      onImportSuccess();
      setTimeout(() => setPreview(null), 3000);
    } catch (err: any) {
      setError("Không thể nhập ứng dụng vào danh mục.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-utility-text tracking-tight">Thu thập & Nhập</h1>
        <p className="text-xs text-utility-muted mt-0.5">Liên kết với các API bên ngoài để lấy và nhập thông tin metadata của ứng dụng mới.</p>
      </div>

      {/* Crawl Form */}
      <div className="bg-white rounded-lg border border-utility-border shadow-sm overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex gap-2 mb-6 p-1 bg-slate-50 rounded-md w-fit border border-utility-border">
            <button
              onClick={() => setStore("Google Play")}
              type="button"
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-[12px] font-bold transition-all ${
                store === "Google Play" 
                  ? "bg-white text-utility-accent shadow-sm border border-utility-border" 
                  : "text-utility-muted hover:text-utility-text"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Google Play</span>
            </button>
            <button
              onClick={() => setStore("App Store")}
              type="button"
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-[12px] font-bold transition-all ${
                store === "App Store" 
                  ? "bg-white text-utility-accent shadow-sm border border-utility-border" 
                  : "text-utility-muted hover:text-utility-text"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>App Store</span>
            </button>
          </div>

          <form onSubmit={handleCrawl} className="space-y-4">
            <div>
              <label htmlFor="appId" className="block text-[11px] font-bold text-utility-muted uppercase tracking-wider mb-1.5">
                ID Ứng dụng hoặc URL từ Chợ
              </label>
              <div className="relative">
                <input
                  id="appId"
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder={store === "Google Play" ? "Ví dụ: com.whatsapp" : "Ví dụ: 389801252"}
                  className="block w-full px-3 py-2 bg-white border border-utility-border rounded-md text-[13px] text-utility-text placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-utility-accent transition-all"
                />
              </div>
              <p className="mt-2 text-[11px] text-utility-muted italic">
                Chấp nhận package name, ID số, hoặc URL HTTPS đầy đủ từ chợ.
              </p>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isCrawling} disabled={!appId} className="!px-6">
                <span>Thu thập Metadata</span>
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-[11px] font-bold text-utility-muted uppercase tracking-widest">Duyệt theo Danh mục</h2>
          <div className="flex gap-2">
            {[
              { id: "Communication", label: "Giao tiếp" },
              { id: "Productivity", label: "Năng suất" }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => fetchDiscoveries(cat.id)}
                className={`px-3 py-1 text-[11px] font-bold rounded-full border transition-all ${
                  selectedCategory === cat.id 
                  ? "bg-utility-accent text-white border-utility-accent" 
                  : "bg-white text-utility-muted border-utility-border hover:border-utility-accent"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        
        {selectedAppIds.size > 0 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            <Button 
              onClick={handleBulkImport} 
              isLoading={isBulkImporting} 
              className="!h-8 !px-4 !text-[11px] uppercase tracking-wider"
            >
              Nhập {selectedAppIds.size} mục đã chọn
            </Button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedCategory && discoveries.length > 0 && !preview && !importSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-utility-border overflow-hidden mb-8"
          >
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#fafafa] border-b border-utility-border">
                <tr>
                  <th className="px-5 py-3 w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-utility-border text-utility-accent focus:ring-utility-accent" 
                      checked={selectedAppIds.size === discoveries.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedAppIds(new Set(discoveries.map(d => d.appId)));
                        else setSelectedAppIds(new Set());
                      }}
                    />
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold text-utility-muted uppercase tracking-wider">Ứng dụng</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-utility-muted uppercase tracking-wider text-right">Xem trước</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {discoveries.map((app) => (
                  <tr 
                    key={app.appId} 
                    className={`hover:bg-slate-50 transition-colors ${selectedAppIds.has(app.appId) ? 'bg-blue-50/30' : ''}`}
                    onClick={() => toggleAppSelection(app.appId)}
                  >
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-utility-border text-utility-accent focus:ring-utility-accent" 
                        checked={selectedAppIds.has(app.appId)}
                        onChange={() => toggleAppSelection(app.appId)}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={app.icon} className="w-8 h-8 rounded border border-utility-border" referrerPolicy="no-referrer" />
                        <div>
                          <p className="text-[13px] font-bold text-utility-text leading-none mb-1">{app.name}</p>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={app.store} size="sm" />
                            <span className="text-[10px] text-utility-muted italic">{app.appId}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPreview(app); setAppId(app.appId); setStore(app.store); }}
                        className="text-[11px] font-bold text-utility-accent hover:underline"
                      >
                        Thông tin chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* States */}
      <AnimatePresence>
        {isCrawling && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="w-10 h-10 border-2 border-slate-200 border-t-utility-accent rounded-full animate-spin mb-4" />
            <p className="text-[12px] text-utility-muted">Đang lấy dữ liệu từ {store}...</p>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-100 rounded-lg p-4 flex gap-3 items-start mb-6"
          >
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-bold text-red-900">Thu thập thất bại</p>
              <p className="text-[12px] text-red-700">{error}</p>
            </div>
          </motion.div>
        )}

        {preview && !importSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg border border-utility-border shadow-sm overflow-hidden mb-6"
          >
            <div className="bg-[#fafafa] border-b border-utility-border px-5 py-3 flex items-center justify-between">
              <span className="text-[11px] font-bold text-utility-muted uppercase tracking-wider">Kết quả thu thập metadata</span>
              <StatusBadge status="Uncategorized" size="sm" />
            </div>
            
            <div className="p-6">
              <div className="flex gap-6 items-start">
                <img 
                  src={preview.icon} 
                  alt={preview.name} 
                  className="w-20 h-20 rounded-lg border border-utility-border shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-[18px] font-bold text-utility-text">{preview.name}</h2>
                    <StatusBadge status={preview.store} size="sm" />
                  </div>
                  <p className="text-[12px] text-utility-muted font-medium mb-4">{preview.appId}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-utility-muted uppercase tracking-wider mb-0.5">Phiên bản</span>
                      <span className="text-[13px] text-utility-text font-semibold">{preview.version}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-utility-muted uppercase tracking-wider mb-0.5">Danh mục</span>
                      <span className="text-[13px] text-utility-text font-semibold">{preview.category}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-utility-border flex justify-end gap-3">
                <Button variant="outline" onClick={() => setPreview(null)}>Hủy bỏ</Button>
                <Button onClick={handleImport} isLoading={importing} className="!px-8">
                  <span>Nhập ứng dụng</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {importSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-utility-text mb-2">Nhập thành công</h2>
            <p className="text-sm text-utility-muted max-w-sm mb-8 font-medium">
              Ứng dụng đã được thêm vào danh mục nội bộ. Bây giờ bạn có thể chỉ định nó vào một nhóm trong phần quản lý.
            </p>
            <Button variant="secondary" onClick={() => onNavigate?.("catalog")}>
              <span>Đi đến Quản lý Danh mục</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
