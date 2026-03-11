"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function UploadPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/jobs/${jobId}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setStatus("success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] p-4 text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <Card className="border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">Upload Sales Data</h2>
          <p className="mb-8 text-sm text-gray-400">
            Drag and drop your .csv or .xlsx file to begin processing.
          </p>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
              isDragOver ? "border-primary bg-primary/10" : "border-white/20 bg-black/20"
            }`}
          >
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
              className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
            />
            
            {status === "idle" && !file && (
              <motion.div className="flex flex-col items-center">
                <UploadCloud className="mb-4 h-12 w-12 text-gray-400" />
                <p className="font-medium text-gray-300">Click or drag file to this area</p>
                <p className="mt-1 text-xs text-gray-500">Supported formats: CSV, XLSX</p>
              </motion.div>
            )}

            {file && status === "idle" && (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                <FileSpreadsheet className="mb-4 h-12 w-12 text-blue-400" />
                <p className="font-semibold text-white">{file.name}</p>
                <p className="mt-1 text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    uploadFile();
                  }}
                  className="relative z-50 mt-6 rounded-full bg-primary px-8 py-2.5 font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90"
                >
                  Upload & Analyze
                </button>
              </motion.div>
            )}

            {status === "uploading" && (
              <motion.div className="flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
                <p className="font-medium text-white">Uploading...</p>
                <p className="mt-1 text-xs text-gray-400">Taking you back to the dashboard...</p>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div className="flex flex-col items-center" initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                <CheckCircle2 className="mb-4 h-12 w-12 text-green-500" />
                <p className="font-medium text-white">Success!</p>
                <p className="mt-1 text-xs text-gray-400">Redirecting to dashboard...</p>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
