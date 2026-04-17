import React from "react";
import { Download, Library, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-3 transition-all duration-200 ${
      active 
        ? "bg-white/5 border-l-4 border-utility-accent text-white opacity-100" 
        : "text-white opacity-70 hover:opacity-100"
    }`}
  >
    <Icon className={`w-4 h-4 ${active ? "text-utility-accent" : "text-white/60"}`} />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminLayout({ children, activeTab, setActiveTab }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-utility-bg font-sans">
      {/* Sidebar */}
      <aside className="w-[240px] bg-utility-sidebar text-white flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="flex-grow flex flex-col overflow-y-auto">
          <div className="px-6 py-6 font-bold text-lg tracking-tight border-b border-white/10">
            App Catalog <span className="text-utility-accent">V2</span>
          </div>

          <nav className="py-4">
            <SidebarItem 
              icon={Download} 
              label="Thu thập & Nhập" 
              active={activeTab === "crawl"} 
              onClick={() => setActiveTab("crawl")}
            />
            <SidebarItem 
              icon={Library} 
              label="Quản lý Danh mục" 
              active={activeTab === "catalog"} 
              onClick={() => setActiveTab("catalog")}
            />
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-3 bg-white/5 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
              QT
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Quản trị viên</p>
              <p className="text-[10px] text-white/50 truncate">gnoud9904@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[240px] min-h-screen flex flex-col">
        <header className="h-16 bg-white border-b border-utility-border flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-utility-text">
              {activeTab === "crawl" ? "Thu thập & Nhập" : "Quản lý Danh mục"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
              <span className="w-2 h-2 bg-utility-pending rounded-full animate-pulse" />
              <span className="text-[11px] font-bold text-utility-accent">Đang đồng bộ trực tiếp</span>
            </div>
            <div className="h-6 w-[1px] bg-utility-border mx-2" />
            <button className="text-utility-muted hover:text-utility-text transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
