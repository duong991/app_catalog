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
  const [selectedApp, setSelectedApp] = useState<AppRecord | null>(null);
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

  const handleAssign = async (id: string, groupId: string) => {
    try {
      await fetch(`/api/app-catalog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appGroupId: groupId }),
      });
      await fetchApps();
      refreshStats();
    } catch (err) {
      console.error(err);
    }
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

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(search.toLowerCase()) || 
    app.appId.toLowerCase().includes(search.toLowerCase())
  );

  const uncategorized = filteredApps.filter(app => !app.appGroupId);
  const grouped = filteredApps.reduce((acc, app) => {
    if (app.appGroupId) {
      if (!acc[app.appGroupId]) acc[app.appGroupId] = [];
      acc[app.appGroupId].push(app);
    }
    return acc;
  }, {} as Record<string, AppRecord[]>);

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
          <h1 className="text-xl font-bold text-utility-text tracking-tight">App Records</h1>
          <p className="text-xs text-utility-muted mt-0.5">Manage assignments and publication state for internal assets.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchApps} className="!h-9 !px-3 font-bold uppercase tracking-wider !text-[11px]">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Apps" value={stats.totalApps.toLocaleString()} />
        <StatCard label="Uncategorized" value={stats.uncategorized} color="text-utility-warning" />
        <StatCard label="Pending Publish" value={stats.pendingPublish} color="text-utility-pending" />
        <StatCard label="Live Groups" value={stats.groups} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Apps List */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-lg border border-utility-border overflow-hidden">
            <div className="px-5 py-4 border-b border-utility-border bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-[13px] font-bold text-utility-text">Uncategorized Apps</h2>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-utility-muted" />
                <input 
                  type="text" 
                  placeholder="Filter apps..." 
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-utility-border rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-utility-accent"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {uncategorized.length === 0 ? (
              <div className="p-12 text-center text-utility-muted">
                <p className="text-sm">No uncategorized applications found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#fafafa] border-b border-utility-border">
                    <tr>
                      <th className="px-5 py-3 text-[11px] font-bold text-utility-muted uppercase tracking-wider">App</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-utility-muted uppercase tracking-wider">Store</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-utility-muted uppercase tracking-wider">Date</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-utility-muted uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {uncategorized.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img src={app.icon} className="w-8 h-8 rounded-md" referrerPolicy="no-referrer" />
                            <div>
                              <span className="block text-[13px] font-bold text-utility-text">{app.name}</span>
                              <span className="text-[11px] text-utility-muted">{app.appId}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={app.store} size="sm" />
                        </td>
                        <td className="px-5 py-3 text-[12px] text-utility-muted">
                          {app.importedDate}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button 
                            className="text-[12px] font-bold text-utility-accent hover:underline"
                            onClick={() => { setSelectedApp(app); setIsModalOpen(true); }}
                          >
                            Assign Group
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
            <div className="px-5 py-4 border-b border-utility-border bg-slate-50/50">
              <h2 className="text-[13px] font-bold text-utility-text">Grouped Assets</h2>
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
                          <span className="text-[11px] text-utility-muted">{appsList.length} Apps</span>
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-utility-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-utility-muted" />}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {appsList.some(a => a.status === 'Pending Publish') ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-utility-pending animate-pulse" />
                            <span className="text-[11px] text-utility-pending font-medium uppercase tracking-tight">Changes pending</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-utility-success tracking-tight uppercase font-medium">● All changes live</span>
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
                <p className="text-[12px] text-utility-muted text-center py-4 italic">No groups defined.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Assignment Modal */}
      <AssignmentModal 
        app={selectedApp} 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedApp(null); }}
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
