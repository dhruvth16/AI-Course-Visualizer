"use client";

import RenderContent from "./RenderContent";
import { getFromDB, saveToDB } from "../helper/indexDB";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  History,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Plus,
  LogOut,
  User2,
  Sparkles,
  BookOpen,
  Cpu,
  Clock,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import MermaidDiagram from "../helper/MermaidContentViewer";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import EditProfile from "./EditProfile";
import toast from "react-hot-toast";
import {
  clearSearchHistory,
  deleteHistoryById,
  fetchLesson,
  fetchLessonById,
  fetchSubtopicContent,
  saveMermaid,
  streamMermid,
} from "@/services/lesson.service";
import { signOut } from "@/services/auth.service";

const enum MODEL {
  GEMINI_2_5_FLASH = "gemini-2.5-flash",
}
interface HistoryItem {
  _id: string;
  title: string;
  timestamp: number;
  mermaidDiagram: string;
  model_used: string;
  subtopics: string[];
}
interface User {
  name: string;
  email: string;
  token: string;
}

const SELECT_ARROW = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%237a8a9e' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0 center",
};

function PromptLesson() {
  const [prompt, setPrompt] = useState("");
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [subtopicContent, setSubtopicContent] = useState("");
  const [searchHistory, setSearchHistory] = useState<HistoryItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mermaidCode, setMermaidCode] = useState("");
  const [model, setModel] = useState<MODEL | "">("");
  const [editProfile, setEditProfile] = useState(false);
  const [grade, setGrade] = useState("12");
  const [isStreaming, setIsStreaming] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const cachedNodesContent = useRef<Record<string, string>>({});
  const router = useRouter();
  const [token, setToken] = useState("");
  const [user_id, setUser_id] = useState("");

  const fetchSearchHistory = async ({
    authToken,
    user_id,
  }: {
    authToken: string;
    user_id: string;
  }) => {
    try {
      if (!authToken || !user_id) return;
      const response = await fetchLesson({ authToken, user_id });
      const history = response?.data || [];
      setSearchHistory(history);
      if (history.length > 0) {
        const last = history[history.length - 1];
        setPrompt(last.title || "");
        setMermaidCode(last.mermaidCode || "");
        setModel(last.model || "");
        setGrade(last.grade || "12");
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const s = sessionStorage.getItem("user");
    if (s) {
      const p = JSON.parse(s);
      setUser(p.user);
      setUser_id(p.user._id);
      setToken(p.token);
    }
  }, []);
  useEffect(() => {
    if (token && user_id) fetchSearchHistory({ authToken: token, user_id });
  }, [token, user_id]);

  const handleHistoryClick = async (id: string) => {
    try {
      setLoading(true);
      const d = await fetchLessonById({ historyId: id, user_id, token });
      if (d?.title) setPrompt(d.title);
      if (d?.mermaidCode) {
        setMermaidCode(d.mermaidCode);
        setModel(d.model);
        setGrade(d.grade);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  const clearHistory = async () => {
    if (!confirm("Clear all?")) return;
    try {
      const r = await clearSearchHistory(user_id);
      if (r?.status === 200) {
        toast.success("Cleared.");
        setSearchHistory([]);
        setMermaidCode("");
      }
    } catch {
      toast.error("Failed.");
    }
  };
  const handleDeleteHistory = async (id: string) => {
    if (!confirm("Delete?")) return;
    try {
      const r = await deleteHistoryById({ historyId: id, user_id });
      if (r?.status === 200) {
        toast.success("Deleted.");
        setSearchHistory((p) => p.filter((i) => i._id !== id));
        setMermaidCode("");
      }
    } catch {
      toast.error("Failed.");
    }
  };
  const handleNewChat = () => {
    setPrompt("");
    setMermaidCode("");
    setSubtopicContent("");
    setSelectedNode(null);
    setModel("");
  };
  const handleNodeClick = async (id: string, label: string) => {
    setSelectedNode({ id, label });
    if (cachedNodesContent.current[label]) {
      setSubtopicContent(cachedNodesContent.current[label]);
      return;
    }
    const key = `subtopic-${id}-${label}`;
    const cached = await getFromDB(key);
    if (cached?.content?.content && Date.now() - cached.timestamp < 86400000) {
      setSubtopicContent(cached.content.content);
      cachedNodesContent.current[label] = cached.content.content;
      return;
    }
    try {
      setLoadingContent(true);
      const r = await fetchSubtopicContent({ prompt, label, model, grade });
      if (r?.status === 200) {
        setSubtopicContent(r.data.subtopic_content);
        cachedNodesContent.current[label] = r.data.subtopic_content;
        await saveToDB(key, {
          content: r.data.subtopic_content,
          timestamp: Date.now(),
        });
      }
    } catch {
      toast.error("Failed.");
      setSubtopicContent("Failed. Retry.");
    } finally {
      setLoadingContent(false);
    }
  };
  const handleLogout = async () => {
    if (!confirm("Sign out?")) return;
    try {
      const r = await signOut(user_id);
      if (r?.status === 200) {
        toast.success("Signed out.");
        router.push("/");
      }
    } catch {
      toast.error("Failed.");
    }
  };
  async function streamMermaidDiagram(e: React.FormEvent) {
    e.preventDefault();
    setMermaidCode("");
    setIsStreaming(true);
    const r = await streamMermid({ prompt, model, grade });
    if (!r?.data) throw new Error("No body");
    setMermaidCode(r.data);
    setIsStreaming(false);
    await saveMermaidDiagram(r.data);
  }
  async function saveMermaidDiagram(code: string) {
    try {
      const r = await saveMermaid({
        user_id,
        prompt,
        mermaid_code: code,
        model,
        grade,
      });
      if (r?.data?.mermaid_code) toast.success("Saved.");
    } catch {
      toast.error("Failed.");
    }
  }

  return (
    <div className="flex h-screen bg-[#080a0f] overflow-hidden">
      {/* SIDEBAR */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 272 : 52 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="flex-shrink-0 flex flex-col bg-[#0d1117] border-r border-white/[0.06] z-20 overflow-hidden"
      >
        <div className="flex items-center justify-between gap-2 px-3 py-[14px] border-b border-white/[0.06]">
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <History size={13} className="text-[#63b3ed]" />
              <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.1em] text-[#3d4a5c]">
                History
              </span>
            </motion.div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 bg-[#111620] border border-white/[0.06] text-[#7a8a9e] hover:text-[#e8edf5] hover:border-white/10 transition-all cursor-pointer ${sidebarOpen ? "ml-auto" : "mx-auto"}`}
          >
            {sidebarOpen ? (
              <ChevronLeft size={13} />
            ) : (
              <ChevronRight size={13} />
            )}
          </button>
        </div>

        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, delay: 0.05 }}
            className="flex-1 overflow-y-auto px-3 py-3 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-white/[0.06]"
          >
            <button
              onClick={() => setEditProfile(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-3 bg-[#111620] border border-white/[0.06] hover:border-white/10 transition-all cursor-pointer text-left"
            >
              <div className="w-7 h-7 flex-shrink-0 rounded-full bg-[#63b3ed]/10 border border-[#63b3ed]/20 flex items-center justify-center">
                <User2 size={12} className="text-[#63b3ed]" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[12px] font-semibold text-[#e8edf5] truncate leading-tight">
                  {user?.name || "Account"}
                </p>
                <p className="text-[10px] text-[#3d4a5c] truncate font-mono">
                  {user?.email}
                </p>
              </div>
            </button>

            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl mb-4 border border-dashed border-white/[0.06] text-[#3d4a5c] hover:text-[#7a8a9e] hover:border-white/10 text-[12px] font-semibold transition-all cursor-pointer"
            >
              <Plus size={12} /> New session
            </button>

            {searchHistory.length > 0 && (
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[9px] font-mono font-semibold uppercase tracking-[0.1em] text-[#3d4a5c]">
                  Recent
                </span>
                <button
                  onClick={clearHistory}
                  className="text-[9px] text-[#f56565] bg-none border-none cursor-pointer font-mono hover:opacity-70"
                >
                  clear all
                </button>
              </div>
            )}

            {searchHistory.length > 0 ? (
              <div className="space-y-1">
                {searchHistory.map((item, i) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleHistoryClick(item._id)}
                    className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111620] border border-white/[0.04] hover:border-white/[0.08] hover:bg-[#161d2a] cursor-pointer transition-all"
                  >
                    <Clock size={10} className="text-[#3d4a5c] flex-shrink-0" />
                    <span className="flex-1 text-[11px] text-[#7a8a9e] truncate">
                      {item.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteHistory(item._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-[#f56565] bg-none border-none cursor-pointer p-0 transition-opacity"
                    >
                      <Trash2 size={10} />
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 text-center">
                <History size={24} className="text-[#3d4a5c] opacity-30 mb-2" />
                <p className="text-[11px] font-mono text-[#3d4a5c]">
                  No sessions yet
                </p>
              </div>
            )}
          </motion.div>
        )}

        {sidebarOpen && (
          <div className="px-3 py-3 border-t border-white/[0.06]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.06] text-[#3d4a5c] hover:text-[#7a8a9e] hover:border-white/10 text-[11px] font-semibold transition-all cursor-pointer"
            >
              <LogOut size={12} /> Sign out
            </button>
          </div>
        )}
      </motion.aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 h-[52px] flex-shrink-0 bg-[#0d1117] border-b border-white/[0.06]">
          <Logo />
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#63b3ed] animate-pulse" />
            <span className="text-[10px] font-mono text-[#3d4a5c] tracking-widest">
              system online
            </span>
          </div>
        </header>

        <div className="flex-shrink-0 bg-[#0d1117] border-b border-white/[0.06] px-6 py-4">
          <form
            onSubmit={streamMermaidDiagram}
            className="max-w-[860px] mx-auto flex items-stretch gap-2.5 flex-wrap"
          >
            <div className="flex items-center gap-2 px-3.5 h-11 rounded-xl bg-[#111620] border border-white/[0.06] hover:border-white/10 transition-colors flex-shrink-0">
              <BookOpen size={12} className="text-[#3d4a5c]" />
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="bg-transparent border-none outline-none text-[#7a8a9e] text-[12px] font-semibold cursor-pointer appearance-none pr-4"
                style={SELECT_ARROW}
              >
                <option value="select grade">Grade</option>
                <option value="10">Grade 10</option>
                <option value="12">Grade 12</option>
                <option value="college">College</option>
              </select>
            </div>

            <div className="flex-1 min-w-[220px] gap-2.5 h-11 px-3.5 rounded-xl bg-[#111620] border border-white/[0.06] focus-within:border-[#63b3ed]/30 focus-within:shadow-[0_0_0_3px_rgba(99,179,237,0.05)] transition-all duration-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Search size={13} className="text-[#3d4a5c] flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Enter a topic to visualize..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#e8edf5] placeholder:text-[#3d4a5c]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 px-3.5 h-11 rounded-xl bg-[#111620] border border-white/[0.06] hover:border-white/10 transition-colors flex-shrink-0">
              <div className="flex items-center gap-1">
                <Cpu size={11} className="text-[#3d4a5c] flex-shrink-0" />
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as MODEL)}
                  className="bg-transparent border-none outline-none text-[#3d4a5c] text-[11px] font-mono cursor-pointer appearance-none pr-4 min-w-[80px]"
                  style={SELECT_ARROW}
                >
                  <option value="">Model</option>
                  <option value="gemini-2.5-flash">Gemini 2.5</option>
                </select>
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading || !prompt.trim()}
              className={`flex items-center gap-2 px-5 h-11 flex-shrink-0 rounded-xl text-[12px] font-bold tracking-[0.03em] transition-all cursor-pointer ${
                loading || !prompt.trim()
                  ? "bg-[#111620] border border-white/[0.06] text-[#3d4a5c] cursor-not-allowed"
                  : "bg-gradient-to-r from-[#1a6fdb] to-[#2d8ed4] border border-[#63b3ed]/30 text-white shadow-[0_4px_16px_rgba(26,111,219,0.25)] hover:shadow-[0_4px_24px_rgba(26,111,219,0.35)]"
              }`}
            >
              <Sparkles size={13} />
              {loading ? "Processing" : "Generate"}
            </motion.button>
          </form>
        </div>

        <div
          className="flex-1 overflow-auto p-6 relative bg-[#080a0f]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-[#63b3ed]/[0.02] rounded-full blur-3xl" />
          </div>

          <div className="max-w-[1200px] mx-auto relative">
            {isStreaming && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0d1117] border border-white/[0.06] rounded-2xl p-4 mb-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#63b3ed] animate-pulse" />
                  <span className="text-[10px] font-mono text-[#3d4a5c]">
                    Generating diagram…
                  </span>
                </div>
                <pre className="text-[11px] text-[#7a8a9e] font-mono max-h-28 overflow-auto leading-relaxed">
                  {mermaidCode || "..."}
                </pre>
              </motion.div>
            )}

            {!mermaidCode && !isStreaming && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div
                  className="w-20 h-20 rounded-full border border-[#63b3ed]/[0.12] flex items-center justify-center mb-6"
                  style={{
                    background:
                      "radial-gradient(circle at 40% 40%, rgba(99,179,237,0.12), rgba(99,179,237,0.02))",
                  }}
                >
                  <Sparkles size={28} className="text-[#63b3ed]/40" />
                </div>
                <h1 className="text-[clamp(22px,3vw,28px)] font-black tracking-[-0.03em] text-[#e8edf5] mb-2">
                  Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
                </h1>
                <p className="text-[13px] text-[#3d4a5c] max-w-sm leading-relaxed">
                  Enter a lesson topic to generate an interactive knowledge
                  graph.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                  {[
                    "Interactive nodes",
                    "AI-generated diagrams",
                    "Instant subtopics",
                  ].map((label) => (
                    <div
                      key={label}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111620] border border-white/[0.06] text-[10px] font-mono text-[#3d4a5c]"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#63b3ed] opacity-50" />
                      {label}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {!isStreaming && mermaidCode && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-[#0d1117] border border-white/[0.06] rounded-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#63b3ed]/[0.08] border border-[#63b3ed]/20 flex items-center justify-center">
                      <Sparkles size={12} className="text-[#63b3ed]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold tracking-[-0.01em] text-[#e8edf5] leading-tight">
                        {prompt}
                      </p>
                      <p className="text-[10px] font-mono text-[#3d4a5c]">
                        Grade {grade} · {model || "default"}
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:block px-2.5 py-1 rounded-md bg-[#111620] border border-white/[0.06] text-[9px] font-mono text-[#3d4a5c]">
                    click nodes to explore
                  </span>
                </div>
                <div className="bg-[#111620] min-h-[350px] overflow-x-auto p-6">
                  <MermaidDiagram
                    code={mermaidCode}
                    onNodeClick={handleNodeClick}
                    isStreaming={isStreaming}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* NODE MODAL */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 16 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-[760px] max-h-[88vh] flex flex-col bg-gray-200 border border-white/[0.06] rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0 bg-[#63b3ed]/[0.08] border border-[#63b3ed]/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#63b3ed]/[0.08] border border-[#63b3ed]/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={13} className="text-[#63b3ed]" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold tracking-[-0.02em] text-[#14171c]">
                      {selectedNode.label}
                    </h2>
                    <p className="text-[10px] font-mono text-[#3d4a5c]">
                      subtopic · {prompt}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#111620] border border-white/[0.06] text-[#7a8a9e] hover:text-[#e8edf5] hover:border-white/10 transition-all cursor-pointer flex-shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 [&::-webkit-scrollbar]:w-[2px]">
                {loadingContent ? (
                  <div className="flex flex-col items-center justify-center h-36 gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#63b3ed] animate-pulse" />
                    <span className="text-[11px] font-mono text-[#3d4a5c]">
                      fetching content…
                    </span>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="text-[#e8edf5]"
                  >
                    <RenderContent subtopicContent={subtopicContent} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PROFILE MODAL */}
      <AnimatePresence>
        {editProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <EditProfile setEditProfile={setEditProfile} user_id={user_id} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PromptLesson;
