"use client";

import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import type { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";

interface UploadZoneProps {
  getRootProps: () => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
  isDragActive: boolean;
}

export function UploadZone({ getRootProps, getInputProps, isDragActive }: UploadZoneProps) {
  const rootProps = getRootProps();
  const inputProps = getInputProps();

  return (
    <motion.div
      {...rootProps}
      className={`border-2 border-dashed rounded-lg p-10 text-center transition-all duration-300 cursor-pointer ${
        isDragActive ? "border-[var(--neon-pink)] bg-[var(--bg-card)]" : "border-[var(--border-color)]"
      }`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <input {...inputProps} />
      <div className="flex flex-col items-center gap-3">
        <Upload size={42} className="text-[var(--neon-cyan)]" />
        <p className="font-['VT323'] text-2xl">DRAG & DROP IMAGES HERE</p>
        <p className="text-[var(--text-muted)]">JPEG, PNG, or WebP • Stored securely in Vercel Blob</p>
      </div>
    </motion.div>
  );
}
