import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AppRecord {
  id: string;
  name: string;
  store: "Google Play" | "App Store";
  appId: string;
  category: string;
  version: string;
  icon: string;
  appGroupId: string | null;
  status: "Uncategorized" | "Pending Publish" | "Published";
  importedDate: string;
  lastPublishedAt?: string;
}

// In-memory "database"
let apps: AppRecord[] = [
  {
    id: "1",
    name: "WhatsApp Messenger",
    store: "Google Play",
    appId: "com.whatsapp",
    category: "Communication",
    version: "2.24.5.76",
    icon: "https://picsum.photos/seed/whatsapp/128/128",
    appGroupId: "communications-main",
    status: "Published",
    importedDate: "2024-03-10",
    lastPublishedAt: "2024-03-15",
  },
  {
    id: "2",
    name: "Instagram",
    store: "App Store",
    appId: "389801252",
    category: "Social Net",
    version: "321.0.1",
    icon: "https://picsum.photos/seed/instagram/128/128",
    appGroupId: null,
    status: "Uncategorized",
    importedDate: "2024-04-10",
  },
  {
    id: "3",
    name: "Trello",
    store: "App Store",
    appId: "461504587",
    category: "Productivity",
    version: "2024.3",
    icon: "https://picsum.photos/seed/trello/128/128",
    appGroupId: null,
    status: "Uncategorized",
    importedDate: "2024-04-12",
  },
  {
    id: "4",
    name: "Slack",
    store: "Google Play",
    appId: "com.Slack",
    category: "Communication",
    version: "24.01",
    icon: "https://picsum.photos/seed/slack/128/128",
    appGroupId: null,
    status: "Uncategorized",
    importedDate: "2024-04-15",
  }
];

let lastPublishedAt: string | null = "2024-03-15T12:00:00Z";

const DISCOVERABLE_APPS = [
  { name: "Slack", store: "Google Play", appId: "com.Slack", category: "Communication", version: "24.01", icon: "https://picsum.photos/seed/slack/128/128" },
  { name: "Microsoft Teams", store: "Google Play", appId: "com.microsoft.teams", category: "Communication", version: "1416", icon: "https://picsum.photos/seed/teams/128/128" },
  { name: "Zoom", store: "Google Play", appId: "us.zoom.videomeetings", category: "Communication", version: "5.17", icon: "https://picsum.photos/seed/zoom/128/128" },
  { name: "Trello", store: "App Store", appId: "461504587", category: "Productivity", version: "2024.3", icon: "https://picsum.photos/seed/trello/128/128" },
  { name: "Notion", store: "App Store", appId: "1232823871", category: "Productivity", version: "3.2.1", icon: "https://picsum.photos/seed/notion/128/128" },
  { name: "Asana", store: "App Store", appId: "489964439", category: "Productivity", version: "9.21.0", icon: "https://picsum.photos/seed/asana/128/128" },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // GET /app-catalog/discover?category=...
  app.get("/api/app-catalog/discover", (req, res) => {
    const { category } = req.query;
    if (category) {
      return res.json(DISCOVERABLE_APPS.filter(a => a.category === category));
    }
    res.json(DISCOVERABLE_APPS);
  });
  
  // GET /app-catalog
  app.get("/api/app-catalog", (req, res) => {
    res.json(apps);
  });

  // POST /app-catalog/crawl
  app.post("/api/app-catalog/crawl", (req, res) => {
    const { store, appId } = req.body;
    
    // Simulate network delay
    setTimeout(() => {
      if (!appId) {
        return res.status(400).json({ error: "App ID is required" });
      }

      // Mock data generation based on search
      const mockResult = {
        name: appId.includes(".") ? "Custom Android App" : "Custom iOS App",
        store: store,
        appId: appId,
        category: appId.length % 2 === 0 ? "Communication" : "Productivity",
        version: "1.0.0",
        icon: `https://picsum.photos/seed/${appId}/128/128`,
        readyToImport: true,
      };

      res.json(mockResult);
    }, 1500);
  });

  // POST /app-catalog (Import)
  app.post("/api/app-catalog", (req, res) => {
    const appData = req.body;
    const newApp: AppRecord = {
      ...appData,
      id: Math.random().toString(36).substring(7),
      appGroupId: null,
      status: "Uncategorized",
      importedDate: new Date().toISOString().split("T")[0],
    };
    apps.push(newApp);
    res.status(201).json(newApp);
  });

  // PATCH /app-catalog/:id
  app.patch("/api/app-catalog/:id", (req, res) => {
    const { id } = req.params;
    const { appGroupId } = req.body;
    
    const index = apps.findIndex((a) => a.id === id);
    if (index === -1) return res.status(404).json({ error: "App not found" });
    
    apps[index].appGroupId = appGroupId;
    apps[index].status = "Pending Publish";
    
    res.json(apps[index]);
  });

  // POST /app-catalog/publish
  app.post("/api/app-catalog/publish", (req, res) => {
    // Simulate publishing process
    setTimeout(() => {
      const now = new Date().toISOString();
      apps = apps.map(app => {
        if (app.status === "Pending Publish" || app.status === "Uncategorized") {
           // Apps only become "Published" if they have a group. 
           // Uncategorized apps stay uncategorized but maybe marked as "Live" if the system allows?
           // User says "Imported record should have appGroupId = null... imported app is therefore in Uncategorized"
           // "Organize... by assigning... group"
           // "Publish All changes so live catalog is refreshed"
           if (app.appGroupId) {
             return { ...app, status: "Published" as const, lastPublishedAt: now };
           }
        }
        return app;
      });
      lastPublishedAt = now;
      res.json({ success: true, publishedAt: now });
    }, 2000);
  });

  app.get("/api/system-stats", (req, res) => {
    res.json({
      totalApps: apps.length,
      uncategorized: apps.filter(a => !a.appGroupId).length,
      pendingPublish: apps.filter(a => a.status === "Pending Publish").length,
      groups: new Set(apps.map(a => a.appGroupId).filter(Boolean)).size,
      lastPublishedAt
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
