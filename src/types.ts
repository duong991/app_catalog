export type StoreType = "Google Play" | "App Store";

export interface AppRecord {
  id: string;
  name: string;
  store: StoreType;
  appId: string;
  category: string;
  version: string;
  icon: string;
  appGroupId: string | null;
  status: "Uncategorized" | "Pending Publish" | "Published";
  importedDate: string;
  lastPublishedAt?: string;
}

export interface CrawlResult {
  name: string;
  store: StoreType;
  appId: string;
  category: string;
  version: string;
  icon: string;
  readyToImport: boolean;
}

export interface SystemStats {
  totalApps: number;
  uncategorized: number;
  pendingPublish: number;
  groups: number;
  lastPublishedAt: string | null;
}
