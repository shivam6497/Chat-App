import { useEffect, useRef, useState } from "react";
import { LogOut, Send, Users, Copy, Check } from "lucide-react";
import ThemeToggleInline from "./ThemeToggleInline";
import type { FeedItem } from "../types";

interface ChatRoomProps {
  roomId: string;
  username: string;
  feed: FeedItem[];
  users: string[];
  onSendMessage: (text: string) => void;
  onLeaveRoom: () => void;
}

export default function ChatRoom({
  roomId,
  username,
  feed,
  users,
  onSendMessage,
  onLeaveRoom,
}: ChatRoomProps) {
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever the feed grows.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [feed]);

  function handleSend() {
    if (!draft.trim()) return;
    onSendMessage(draft.trim());
    setDraft("");
  }

  function handleCopyCode() {
    navigator.clipboard?.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className="h-screen overflow-hidden flex"
      style={{ backgroundColor: "var(--bg-app)" }}
    >
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className="w-64 border-r flex flex-col p-4 shrink-0 hidden sm:flex"
        style={{
          borderColor: "var(--border-card)",
          backgroundColor: "var(--bg-card)",
        }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <span
            className="font-bold text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            Real Time Chat
          </span>
          <ThemeToggleInline />
        </div>

        {/* Room code */}
        <div className="mb-6">
          <p
            className="text-xs uppercase tracking-wide mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            Room Code
          </p>
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-2 font-bold text-lg border rounded-md px-3 py-2 w-full justify-between transition-colors cursor-pointer"
            style={{
              borderColor: "var(--border-field)",
              color: "var(--text-primary)",
            }}
          >
            {roomId}
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>

        {/* User list — flex-1 so it fills remaining sidebar space and scrolls internally */}
        <div
          className="flex items-center gap-2 mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          <Users size={14} />
          <p className="text-xs uppercase tracking-wide">
            In Room ({users.length})
          </p>
        </div>
        <ul className="flex-1 overflow-y-auto space-y-1">
          {users.map((u, i) => (
            <li
              key={`${u}-${i}`}
              className="text-sm px-3 py-2 rounded-md"
              style={{
                color: "var(--text-primary)",
                backgroundColor:
                  u === username ? "var(--bg-field)" : "transparent",
              }}
            >
              {u}{" "}
              {u === username && (
                <span style={{ color: "var(--text-muted)" }}>(you)</span>
              )}
            </li>
          ))}
        </ul>

        {/* Leave button — pinned to bottom of sidebar */}
        <button
          type="button"
          onClick={onLeaveRoom}
          className="flex items-center gap-2 text-sm mt-4 px-3 py-2 rounded-md border transition-colors hover:opacity-80 cursor-pointer"
          style={{
            borderColor: "var(--border-field)",
            color: "var(--text-primary)",
          }}
        >
          <LogOut size={14} />
          Leave Room
        </button>
      </aside>

      {/* ── Main chat column ─────────────────────────────────── */}

      <main className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Mobile header */}
        <div
          className="sm:hidden flex items-center justify-between px-4 py-3 border-b shrink-0"
          style={{
            borderColor: "var(--border-card)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          <span className="font-bold" style={{ color: "var(--text-primary)" }}>
            {roomId}
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggleInline />
            <button type="button" onClick={onLeaveRoom} aria-label="Leave room">
              <LogOut size={18} style={{ color: "var(--text-primary)" }} />
            </button>
          </div>
        </div>

        {/* Message feed — this is the ONLY scrollable zone */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-3 min-h-0"
        >
          {feed.length === 0 && (
            <p
              className="text-sm text-center mt-12"
              style={{ color: "var(--text-muted)" }}
            >
              No messages yet. Say hello.
            </p>
          )}

          {feed.map((item, i) => {
            // ── System event (join / leave notices) ──
            if (item.kind === "system") {
              return (
                <p
                  key={`sys-${item.ts}-${i}`}
                  className="text-xs text-center py-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {item.text}
                </p>
              );
            }

            // ── Chat message ──
            const { data: msg } = item;
            const isOwn = msg.user === username;
            return (
              <div
                key={`msg-${msg.ts}-${i}`}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[75%]">
                  {!isOwn && (
                    <p
                      className="text-xs mb-1 px-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {msg.user}
                    </p>
                  )}
                  <div
                    className="rounded-lg px-4 py-2 text-sm break-words"
                    style={{
                      backgroundColor: isOwn
                        ? "var(--bubble-own)"
                        : "var(--bubble-other)",
                      color: isOwn
                        ? "var(--bubble-own-text)"
                        : "var(--bubble-other-text)",
                    }}
                  >
                    {msg.text}
                  </div>
                  <p
                    className={`text-[10px] mt-1 px-1 ${isOwn ? "text-right" : "text-left"}`}
                    style={{ color: "var(--text-muted)" }}
                  >
                    {new Date(msg.ts).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Composer — shrink-0 keeps it fixed at the bottom regardless of message count */}
        <div
          className="border-t p-4 flex gap-3 shrink-0"
          style={{
            borderColor: "var(--border-card)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message"
            className="flex-1 rounded-md px-4 py-3 outline-none border"
            style={{
              backgroundColor: "var(--bg-field)",
              borderColor: "var(--border-field)",
              color: "var(--text-primary)",
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            aria-label="Send message"
            className="rounded-md px-5 flex items-center justify-center transition-colors cursor-pointer"
            style={{
              backgroundColor: "var(--btn-bg)",
              color: "var(--btn-text)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--btn-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--btn-bg)")
            }
          >
            <Send size={16} />
          </button>
        </div>
      </main>
    </div>
  );
}
