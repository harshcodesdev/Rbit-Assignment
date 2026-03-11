"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, FileText, Calendar, CheckCircle, Clock } from "lucide-react";

type Job = {
  id: string;
  recipientEmail: string;
  fileName: string | null;
  status: "PENDING" | "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
};

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) {
        setJobs(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: Job['status']) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500/10 text-green-400 hover:bg-green-500/20 shadow-none"><CheckCircle className="mr-1 h-3 w-3" /> Completed</Badge>;
      case "PROCESSING":
        return <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 shadow-none border-blue-500/20"><RefreshCw className="mr-1 h-3 w-3 animate-spin" /> Processing</Badge>;
      case "FAILED":
        return <Badge variant="destructive" className="shadow-none">Failed</Badge>;
      default:
        return <Badge variant="secondary" className="bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 shadow-none"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6 lg:p-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Insights Dashboard</h1>
            <p className="mt-1 text-gray-400">Monitor all automated AI summarization tasks.</p>
          </div>
          <button
            onClick={fetchJobs}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="grid gap-4">
          {jobs.length === 0 && !loading ? (
             <Card className="flex h-40 flex-col items-center justify-center border-none bg-white/5">
                <p className="text-gray-400">No processing jobs found.</p>
             </Card>
          ) : (
            jobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition-all hover:bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{job.fileName || "Awaiting file..."}</h3>
                      <p className="text-sm text-gray-400">{job.recipientEmail}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 min-w-[250px] justify-between">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(job.createdAt).toLocaleDateString()} {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                    <div>
                      {getStatusBadge(job.status)}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
