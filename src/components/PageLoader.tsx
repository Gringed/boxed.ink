"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";

export function PageLoader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-md"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      >
        <Logo width={72} className="text-noir" />
      </motion.div>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-noir/10">
        <motion.div
          className="h-full w-1/3 rounded-full bg-primary"
          animate={{ x: ["-100%", "220%"] }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.div>,
    document.body
  );
}
