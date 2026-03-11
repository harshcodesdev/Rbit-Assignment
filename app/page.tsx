"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail: email }),
      });

      if (!res.ok) throw new Error("Failed to create job");

      const job = await res.json();
      router.push(`/upload/${job.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0A0A0A]">
      {/* Dynamic Background Blur Effects */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 flex w-full max-w-3xl flex-col items-center px-4 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 backdrop-blur-md"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span>RabbitAI Internal Tool</span>
        </motion.div>

        <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white md:text-7xl">
          Instantly <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Synthesize</span> Sales Data
        </h1>
        
        <p className="mb-10 max-w-2xl text-lg text-gray-400 md:text-xl">
          Upload spreadsheets, sit back, and let AI distill thousands of rows into actionable executive briefings delivered straight to your inbox.
        </p>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex w-full max-w-md flex-col gap-4 sm:flex-row"
        >
          <Input
            type="email"
            placeholder="Enter your email to start..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-14 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary backdrop-blur-sm sm:h-12"
          />
          <Button
            type="submit"
            disabled={loading}
            className="h-14 w-full sm:h-12 sm:w-auto bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all"
          >
            {loading ? "Initializing..." : "Proceed"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </motion.form>
      </motion.div>
    </div>
  );
}
