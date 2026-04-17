import React, { useState, useEffect } from "react";
import { AppRecord, SystemStats } from "../types.ts";
import { StatusBadge, Button } from "../components/common/UIComponents.tsx";
import { 
  Search, Filter, RefreshCw, ChevronDown, ChevronRight, 
  ExternalLink, MoreVertical, LayoutGrid, List, Clock, 
  Layers, Package, Globe, Smartphone, Inbox
} from "lucide-react";
import AssignmentModal from "../components/catalog/AssignmentModal.tsx";
import PublishBar from "../components/catalog/PublishBar.tsx";
import { motion, AnimatePresence } from "motion/react";

interface CatalogManagementProps {
  stats: SystemStats;
  refreshStats: () => void;
}

export default function CatalogManagement({ stats, refreshStats }: CatalogManagementProps) {
  const [apps, setApps] = useState<AppRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedApps, setSelectedApps] = useState<AppRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const fetchApps = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/app-catalog");
      const data = await res.json();
      setApps(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleAssign = async (ids: string[], groupId: string) => {
    try {
      for (const id of ids) {
        await fetch(`/api/app-catalog/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appGroupId: groupId }),
        });
      }
      await fetchApps();
      refreshStats();
      setSelectedApps([]);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelection = (app: AppRecord) => {
    setSelectedApps(prev => {
      const exists = prev.find(a => a.id === app.id);
      if (exists) return prev.filter(a => a.id !== app.id);
      return [...prev, app];
    });
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await fetch("/api/app-catalog/publish", { method: "POST" });
      await fetchApps();
      refreshStats();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) || 
                         app.appId.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "" || app.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(apps.map(a => a.category))).filter(Boolean);
  const uncategorized = filteredApps.filter(app => !app.appGroupId);
  const grouped = filteredApps.reduce((acc, app) => {
    if (app.appGroupId) {
      if (!acc[app.appGroupId]) acc[app.appGroupId] = [];
      acc[app.appGroupId].push(app);
    }
    return acc;
  }, {} as Record<string, AppRecord[]>);

  const handleUnassignGroup = async (groupId: string) => {
    const appsInGroup = apps.filter(app => app.appGroupId === groupId);
    try {
      for (const app of appsInGroup) {
        await fetch(`/api/app-catalog/${app.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appGroupId: null }),
        });
      }
      await fetchApps();
      refreshStats();
    } catch (err) {
      console.error(err);
    }
  };

  // Pre-filter uncategorized apps for the modal if needed
  const availableApps = apps.filter(app => !app.appGroupId);

  const handleCreateNewGroup = () => {
    setIsModalOpen(true);
  };

  const StatCard = ({ label, value, color }: any) => (
    <div className="bg-white p-4 rounded-lg border border-utility-border shadow-sm">
      <p className="text-[11px] font-bold text-utility-muted uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl font-bold ${color || 'text-utility-text'}`}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-32">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-utility-text tracking-tight">Hồ sơ Ứng dụng</h1>
          <p className="text-xs text-utility-muted mt-0.5">Quản lý phân loại và trạng thái xuất bản cho các tài sản nội bộ.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchApps} className="!h-9 !px-3 font-bold uppercase tracking-wider !text-[11px]">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Cập nhật</span>
          </Button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Tổng ứng dụng" value={stats.totalApps.toLocaleString()} />
        <StatCard label="Chưa phân loại" value={stats.uncategorized} color="text-utility-warning" />
        <StatCard label="Chờ xuất bản" value={stats.pendingPublish} color="text-utility-pending" />
        <StatCard label="Nhóm hiện hữu" value={stats.groups} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Apps List */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-lg border border-utility-border overflow-hidden">
            <div className="px-5 py-4 border-b border-utility-border bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-[13px] font-bold text-utility-text">Ứng dụng chưa phân loại</h2>
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-utility-muted" />
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-transparent text-[11px] font-bold text-utility-muted uppercase tracking-wider focus:outline-none cursor-pointer"
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {selectedApps.length > 0 && (
                  <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="!h-8 !px-3 !text-[10px] font-bold uppercase tracking-wider !bg-utility-accent/10 !text-utility-accent hover:!bg-utility-accent hover:!text-white border border-utility-accent/20"
                  >
                    Phân loại {selectedApps.length} mục
                  </Button>
                )}
                <div className="relative w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-utility-muted" />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm ứng dụng..." 
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-utility-border rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-utility-accent"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {uncategorized.length === 0 ? (
              <div className="p-12 text-center text-utility-muted">
                <p className="text-sm italic">Không tìm thấy ứng dụng phù hợp.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#fafafa] border-b border-utility-border">
                    <tr>
                      <th className="px-5 py-3 w-10">
                        <input 
                          type="checkbox" 
                          className="rounded border-utility-border text-utility-accent focus:ring-utility-accent"
                          checked={selectedApps.length === uncategorized.length && uncategorized.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedApps(uncategorized);
                            else setSelectedApps([]);
                          }}
                        />
                      </th>
                      <th className="px-5 py-3 text-[11px] font-bold text-utility-muted uppercase tracking-wider">Ứng dụng</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-utility-muted uppercase tracking-wider">Chợ / Danh mục</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-utility-muted uppercase tracking-wider">Ngày nhập</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-utility-muted uppercase tracking-wider text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {uncategorized.map(app => (
                      <tr 
                        key={app.id} 
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedApps.some(a => a.id === app.id) ? 'bg-blue-50/30' : ''}`}
                        onClick={() => toggleSelection(app)}
                      >
                        <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            className="rounded border-utility-border text-utility-accent focus:ring-utility-accent"
                            checked={selectedApps.some(a => a.id === app.id)}
                            onChange={() => toggleSelection(app)}
                          />
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img src={app.icon} className="w-8 h-8 rounded-md" referrerPolicy="no-referrer" />
                            <div>
                              <span className="block text-[13px] font-bold text-utility-text leading-tight">{app.name}</span>
                              <span className="text-[11px] text-utility-muted">{app.appId}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col gap-1">
                            <StatusBadge status={app.store} size="sm" />
                            <span className="text-[10px] text-utility-muted font-medium italic">{app.category}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[11px] text-utility-muted">
                          {app.importedDate}
                        </td>
                        <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="text-[11px] font-bold text-utility-accent hover:underline"
                            onClick={() => { setSelectedApps([app]); setIsModalOpen(true); }}
                          >
                            Phân loại
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Groups */}
        <div className="space-y-6">
          <section className="bg-white rounded-lg border border-utility-border overflow-hidden">
            <div className="px-5 py-4 border-b border-utility-border bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-[13px] font-bold text-utility-text">Tài sản đã nhóm</h2>
              <button 
                onClick={handleCreateNewGroup}
                className="text-[11px] font-bold text-utility-accent hover:underline"
              >
                + Tạo nhóm mới
              </button>
            </div>
            <div className="p-4 space-y-3">
              {Object.entries(grouped).map(([groupId, groupApps]) => {
                const appsList = groupApps as AppRecord[];
                const isExpanded = expandedGroups[groupId];
                return (
                  <div key={groupId} className="border border-utility-border rounded-md overflow-hidden transition-all">
                    <button 
                      onClick={() => toggleGroup(groupId)}
                      className="w-full text-left p-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[12px] font-mono font-bold bg-[#f1f5f9] px-1.5 py-0.5 rounded text-utility-text">{groupId}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-utility-muted">{appsList.length} ứng dụng</span>
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-utility-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-utility-muted" />}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {appsList.some(a => a.status === 'Pending Publish') ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-utility-pending animate-pulse" />
                            <span className="text-[11px] text-utility-pending font-medium uppercase tracking-tight">Đang chờ xử lý</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-utility-success tracking-tight uppercase font-medium">● Đã xuất bản</span>
                          </div>
                        )}
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="px-3 pb-3 bg-[#fafafa] border-t border-utility-border divide-y divide-slate-100"
                        >
                          <div className="py-2 flex justify-between items-center bg-slate-50/50 -mx-3 px-3 mb-2">
                            <span className="text-[10px] font-bold text-utility-muted uppercase tracking-widest">Danh sách ứng dụng</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleUnassignGroup(groupId); }}
                              className="text-[10px] font-bold text-red-600 hover:text-red-700 hover:underline"
                            >
                              Xóa toàn bộ
                            </button>
                          </div>
                          {appsList.map(app => (
                            <div key={app.id} className="flex items-center justify-between py-2 group">
                              <div className="flex items-center gap-2 min-w-0">
                                <img src={app.icon} className="w-6 h-6 rounded border border-utility-border flex-shrink-0" referrerPolicy="no-referrer" />
                                <div className="min-w-0">
                                  <p className="text-[11px] font-bold text-utility-text truncate">{app.name}</p>
                                  <p className="text-[9px] text-utility-muted truncate">{app.appId}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink className="w-3 h-3 text-utility-muted cursor-pointer hover:text-utility-accent" />
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              {Object.keys(grouped).length === 0 && (
                <p className="text-[12px] text-utility-muted text-center py-4 italic">Chưa có nhóm nào được định nghĩa.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Assignment Modal */}
      <AssignmentModal 
        apps={selectedApps} 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedApps([]); }}
        onAssign={handleAssign}
      />

      {/* Persistent Publish Bar */}
      <PublishBar 
        pendingCount={stats.pendingPublish} 
        isPublishing={isPublishing}
        onPublish={handlePublish}
      />
    </div>
  );
}
