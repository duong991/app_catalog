import { useState, useEffect } from "react";
import AdminLayout from "./components/layout/AdminLayout.tsx";
import CrawlImport from "./pages/CrawlImport.tsx";
import CatalogManagement from "./catalog/CatalogManagement.tsx";
import { SystemStats } from "./types.ts";

export default function App() {
  const [activeTab, setActiveTab] = useState("crawl");
  const [stats, setStats] = useState<SystemStats>({
    totalApps: 0,
    uncategorized: 0,
    pendingPublish: 0,
    groups: 0,
    lastPublishedAt: null
  });

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/system-stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "crawl" && (
        <CrawlImport onImportSuccess={fetchStats} onNavigate={(tab) => setActiveTab(tab)} />
      )}
      {activeTab === "catalog" && (
        <CatalogManagement stats={stats} refreshStats={fetchStats} />
      )}
    </AdminLayout>
  );
}
