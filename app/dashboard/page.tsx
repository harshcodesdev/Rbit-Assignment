"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RefreshCw, FileText, Calendar, CheckCircle, Clock, ChevronDown, Send, Loader2 } from "lucide-react";

type Job = {
  id: string;
  recipientEmail: string;
  fileName: string | null;
  status: "PENDING" | "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";
  progressStep: string | null;
  summary: string | null;
  createdAt: string;
};

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Email sending state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [sendingJobId, setSendingJobId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "success" | "error">("idle");

  const toggleExpand = (id: string) => {
    setExpandedJobId(expandedJobId === id ? null : id);
  };

  const openEmailModal = (jobId: string) => {
    setSendingJobId(jobId);
    setTargetEmail("");
    setEmailStatus("idle");
    setIsEmailModalOpen(true);
  };

  const sendReportEmail = async () => {
    if (!sendingJobId || !targetEmail) return;
    
    setIsSending(true);
    setEmailStatus("idle");

    try {
      const res = await fetch(`/api/jobs/${sendingJobId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });

      if (!res.ok) throw new Error("Failed to send");
      
      setEmailStatus("success");
      setTimeout(() => setIsEmailModalOpen(false), 2000);
    } catch (error) {
      console.error(error);
      setEmailStatus("error");
    } finally {
      setIsSending(false);
    }
  };

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
    const interval = setInterval(fetchJobs, 2000); // Poll every 2s for responsive progress updates
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (job: Job) => {
    switch (job.status) {
      case "COMPLETED":
        return <Badge className="bg-green-500/10 text-green-400 hover:bg-green-500/20 shadow-none"><CheckCircle className="mr-1 h-3 w-3" /> Completed</Badge>;
      case "PROCESSING":
        return <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 shadow-none border-blue-500/20"><RefreshCw className="mr-1 h-3 w-3 animate-spin" /> {job.progressStep || "Processing..."}</Badge>;
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
                <Card className={`flex flex-col border-white/10 bg-white/[0.03] backdrop-blur-md transition-all hover:bg-white/5 ${expandedJobId === job.id ? 'ring-1 ring-primary/50' : ''}`}>
                  <div 
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 cursor-pointer"
                    onClick={() => toggleExpand(job.id)}
                  >
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
                      <div className="flex items-center gap-3">
                        {getStatusBadge(job)}
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expandedJobId === job.id ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>
                  
                  {expandedJobId === job.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: "auto", opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/10 p-6 bg-black/20 overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Analysis Summary</h4>
                        {job.status === 'COMPLETED' && (
                          <button
                            onClick={() => openEmailModal(job.id)}
                            className="flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
                          >
                            <Send className="h-3.5 w-3.5" /> Forward Report
                          </button>
                        )}
                      </div>
                      {job.summary ? (
                        <div 
                          className="text-gray-300 text-sm [&>h1]:text-xl [&>h1]:font-bold [&>h1]:text-white [&>h1]:mt-4 [&>h1]:mb-2 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-white [&>h2]:mt-4 [&>h2]:mb-2 [&>h3]:text-md [&>h3]:font-semibold [&>h3]:text-white [&>h3]:mt-3 [&>h3]:mb-1 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>li]:mb-1 [&>strong]:text-white"
                          dangerouslySetInnerHTML={{ __html: job.summary }}
                        />
                      ) : (
                        <p className="text-sm text-gray-500 italic">No summary available yet. The file might still be processing.</p>
                      )}
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
      {/* Email Modal */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="border-white/10 bg-[#121212] text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Forward Analysis Report</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter the email address where you would like to send this generated sales summary.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Recipient Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                className="flex h-10 w-full rounded-md border border-white/20 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
              />
            </div>
            {emailStatus === "success" && (
              <p className="text-sm text-green-400 flex items-center gap-1.5"><CheckCircle className="h-4 w-4"/> Email sent successfully!</p>
            )}
            {emailStatus === "error" && (
              <p className="text-sm text-red-500 flex items-center gap-1.5">Failed to send email. Check logs.</p>
            )}
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsEmailModalOpen(false)}
              className="mt-2 sm:mt-0 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              disabled={isSending}
            >
              Cancel
            </button>
            <button
              onClick={sendReportEmail}
              className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
              disabled={!targetEmail || isSending || emailStatus === "success"}
            >
              {isSending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : <><Send className="h-4 w-4" /> Send Report</>}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
