"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/usePWA";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-amber-500 text-white text-center py-2 px-4 text-xs font-medium flex items-center justify-center space-x-2 z-[100] fixed top-0 left-0 right-0"
        >
          <WifiOff className="w-3.5 h-3.5" />
          <span>You are offline. Some features may not work.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
