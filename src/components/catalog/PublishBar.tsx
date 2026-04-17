import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "../common/UIComponents.tsx";
import { motion, AnimatePresence } from "motion/react";

interface PublishBarProps {
  pendingCount: number;
  onPublish: () => Promise<void>;
  isPublishing: boolean;
}

export default function PublishBar({ pendingCount, onPublish, isPublishing }: PublishBarProps) {
  if (pendingCount === 0 && !isPublishing) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
      >
        <div className="bg-utility-sidebar text-white rounded-lg shadow-2xl p-4 flex items-center justify-between border border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-utility-pending rounded flex items-center justify-center">
              <Upload className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[12px] font-bold tracking-wider uppercase">Catalog Synchronization</p>
              <p className="text-[11px] text-slate-400">
                {pendingCount} pending updates ready for production.
              </p>
            </div>
          </div>
          
          <Button 
            className="!h-9 !px-6 !bg-utility-accent hover:!bg-utility-accent-hover !text-white !border-none text-[11px] font-bold uppercase tracking-widest"
            isLoading={isPublishing}
            onClick={onPublish}
          >
            <span>Publish</span>
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
