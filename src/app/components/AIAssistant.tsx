import { useEffect, useRef, useState } from "react";
import { Bot, Clock3, Send, Smile, Sparkles, User } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useTaxData } from "../providers/TaxDataProvider";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}


// ─── Rich Message Block Renderer ──────────────────────────────────────────────
type Block =
  | { type: "text"; content: string }
  | { type: "card"; emoji: string; title: string; value: string }
  | { type: "tip"; content: string }
  | { type: "alert"; content: string }
  | { type: "action"; label: string; description: string };

function parseBlocks(raw: string): Block[] {
  const blocks: Block[] = [];
  const parts = raw.split(/(\[(?:CARD|TIP|ALERT|ACTION):[^\]]+\])/g);
  for (const part of parts) {
    const cardMatch = part.match(/\[CARD:([^|]+)\|([^|]+)\|([^\]]+)\]/);
    const tipMatch = part.match(/\[TIP:([^\]]+)\]/);
    const alertMatch = part.match(/\[ALERT:([^\]]+)\]/);
    const actionMatch = part.match(/\[ACTION:([^|]+)\|([^\]]+)\]/);
    if (cardMatch) blocks.push({ type: "card", emoji: cardMatch[1].trim(), title: cardMatch[2].trim(), value: cardMatch[3].trim() });
    else if (tipMatch) blocks.push({ type: "tip", content: tipMatch[1].trim() });
    else if (alertMatch) blocks.push({ type: "alert", content: alertMatch[1].trim() });
    else if (actionMatch) blocks.push({ type: "action", label: actionMatch[1].trim(), description: actionMatch[2].trim() });
    else if (part.trim()) blocks.push({ type: "text", content: part.trim() });
  }
  return blocks;
}

const CARD_PALETTE = [
  "bg-emerald-50 border-emerald-200 text-emerald-900",
  "bg-violet-50  border-violet-200  text-violet-900",
  "bg-amber-50   border-amber-200   text-amber-900",
  "bg-blue-50    border-blue-200    text-blue-900",
  "bg-rose-50    border-rose-200    text-rose-900",
  "bg-teal-50    border-teal-200    text-teal-900",
];

function RichMessageRenderer({ content }: { content: string }) {
  const blocks = parseBlocks(content);
  let colorIdx = 0;
  const result: React.ReactNode[] = [];
  let cardBuffer: Extract<Block, { type: "card" }>[] = [];
  let textBuffer: string[] = [];

  const flushCards = () => {
    if (!cardBuffer.length) return;
    result.push(
      <div key={`cards-${result.length}`} className="flex flex-wrap gap-2 my-1">
        {cardBuffer.map((b, i) => {
          const color = CARD_PALETTE[colorIdx++ % CARD_PALETTE.length];
          return (
            <div key={i} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 min-w-[130px] shadow-sm ${color}`}>
              <span className="text-2xl leading-none">{b.emoji}</span>
              <div>
                <p className="text-[10px] uppercase tracking-wider opacity-55 font-semibold">{b.title}</p>
                <p className="text-base font-bold mt-0.5">{b.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
    cardBuffer = [];
  };
  const flushText = () => {
    if (!textBuffer.length) return;
    result.push(
      <p key={`text-${result.length}`} className="whitespace-pre-line text-sm leading-relaxed">{textBuffer.join("\n")}</p>
    );
    textBuffer = [];
  };

  for (const block of blocks) {
    if (block.type === "card") {
      flushText();
      cardBuffer.push(block);
    } else {
      flushCards();
      if (block.type === "text") {
        textBuffer.push(block.content);
      } else {
        flushText();
        if (block.type === "tip") {
          result.push(
            <div key={`tip-${result.length}`} className="flex gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3">
              <span className="text-xl shrink-0">💡</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-0.5">Tax Tip</p>
                <p className="text-sm text-emerald-800">{block.content}</p>
              </div>
            </div>
          );
        } else if (block.type === "alert") {
          result.push(
            <div key={`alert-${result.length}`} className="flex gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
              <span className="text-xl shrink-0">⚠️</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-0.5">Alert</p>
                <p className="text-sm text-amber-800">{block.content}</p>
              </div>
            </div>
          );
        } else if (block.type === "action") {
          result.push(
            <div key={`action-${result.length}`} className="flex items-center justify-between gap-3 rounded-2xl bg-primary/6 border border-primary/20 px-4 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary/60 mb-0.5">Next Step</p>
                <p className="text-sm font-semibold">{block.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{block.description}</p>
              </div>
              <span className="text-2xl shrink-0">🎯</span>
            </div>
          );
        }
      }
    }
  }
  flushCards();
  flushText();

  return <div className="space-y-3">{result}</div>;
}
// ──────────────────────────────────────────────────────────────────────────────


// ─── Emoji / Sticker Picker ────────────────────────────────────────────────
const STICKER_CATEGORIES = [
  {
    label: "💰 Tax",
    items: [
      { e: "💰", label: "money bag" },
      { e: "🧾", label: "receipt" },
      { e: "📊", label: "chart" },
      { e: "📉", label: "decline" },
      { e: "📈", label: "growth" },
      { e: "✂️", label: "cut" },
      { e: "🏦", label: "bank" },
      { e: "💳", label: "card" },
      { e: "🪙", label: "coin" },
      { e: "💵", label: "dollar" },
      { e: "💸", label: "flying money" },
      { e: "🏧", label: "ATM" },
      { e: "📁", label: "folder" },
      { e: "📂", label: "open folder" },
      { e: "🗂️", label: "file cabinet" },
      { e: "🔖", label: "bookmark" },
    ],
  },
  {
    label: "✅ Reactions",
    items: [
      { e: "✅", label: "check" },
      { e: "❌", label: "cross" },
      { e: "⚠️", label: "warning" },
      { e: "🎯", label: "target" },
      { e: "🚀", label: "rocket" },
      { e: "🔥", label: "fire" },
      { e: "⭐", label: "star" },
      { e: "💡", label: "idea" },
      { e: "🏆", label: "trophy" },
      { e: "👍", label: "thumbs up" },
      { e: "👎", label: "thumbs down" },
      { e: "🎉", label: "party" },
      { e: "😎", label: "cool" },
      { e: "😅", label: "sweat" },
      { e: "😱", label: "shocked" },
      { e: "🤔", label: "thinking" },
    ],
  },
  {
    label: "📋 Actions",
    items: [
      { e: "📝", label: "memo" },
      { e: "🔍", label: "search" },
      { e: "🛡️", label: "shield" },
      { e: "⚖️", label: "balance" },
      { e: "📅", label: "calendar" },
      { e: "⏰", label: "alarm" },
      { e: "🗓️", label: "calendar" },
      { e: "📌", label: "pin" },
      { e: "📎", label: "paperclip" },
      { e: "✏️", label: "pencil" },
      { e: "🖊️", label: "pen" },
      { e: "📧", label: "email" },
      { e: "📩", label: "inbox" },
      { e: "🔔", label: "bell" },
      { e: "🔕", label: "mute" },
      { e: "📬", label: "mailbox" },
    ],
  },
  {
    label: "🏠 Life",
    items: [
      { e: "🏠", label: "home" },
      { e: "🚗", label: "car" },
      { e: "✈️", label: "travel" },
      { e: "🎓", label: "education" },
      { e: "⚕️", label: "medical" },
      { e: "👨‍💼", label: "business" },
      { e: "👩‍💻", label: "freelancer" },
      { e: "🏢", label: "office" },
      { e: "🏗️", label: "construction" },
      { e: "💼", label: "briefcase" },
      { e: "🧳", label: "luggage" },
      { e: "☀️", label: "sun" },
      { e: "🌙", label: "moon" },
      { e: "❄️", label: "snow" },
      { e: "🌍", label: "earth" },
      { e: "🕊️", label: "peace" },
    ],
  },
];

function EmojiPicker({ onSelect, onClose }: { onSelect: (e: string) => void; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="absolute bottom-full mb-3 left-0 z-50 w-80 rounded-2xl border border-border/70 bg-card shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Stickers & Emoji</p>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
      </div>
      {/* Tab bar */}
      <div className="flex border-b border-border/60 bg-secondary/40">
        {STICKER_CATEGORIES.map((cat, i) => (
          <button
            key={cat.label}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-2 text-xs transition font-medium ${activeTab === i ? "border-b-2 border-primary text-primary bg-background" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {cat.label.split(" ")[0]}
          </button>
        ))}
      </div>
      <div className="p-3 grid grid-cols-8 gap-1">
        {STICKER_CATEGORIES[activeTab].items.map(({ e, label }) => (
          <button
            key={label}
            title={label}
            onClick={() => { onSelect(e); }}
            className="flex items-center justify-center text-xl h-9 w-9 rounded-xl hover:bg-secondary transition-colors"
          >
            {e}
          </button>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-border/60 bg-secondary/30">
        <p className="text-[10px] text-muted-foreground">Click to insert · {STICKER_CATEGORIES[activeTab].label}</p>
      </div>
    </div>
  );
}
// ──────────────────────────────────────────────────────────────────────────────

export function AIAssistant() {
  const { assistant, sendAssistantMessage, isLoading, error } = useTaxData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (assistant && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "👋 Hello! I'm your personal AI Tax Strategist, trained on your live tax profile.\n\nI can help you:\n• Explain your tax exposure and effective rate\n• Find deductions you're missing\n• Estimate quarterly payments for freelancers\n• Model investment scenarios before you commit\n\nAsk me anything about your taxes.",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [assistant, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  if (isLoading && !assistant) {
    return (
      <div className="rounded-[28px] border border-border/70 bg-card p-10 text-sm text-muted-foreground shadow-sm text-center">
        Loading assistant...
      </div>
    );
  }

  if (!assistant) {
    return (
      <div className="rounded-[28px] border border-destructive/20 bg-red-50 p-10 text-sm text-red-700">
        {error ?? "Assistant data is unavailable."}
      </div>
    );
  }

  const handleSend = async (preset?: string) => {
    const content = (preset ?? input).trim();
    if (!content || isSending) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((cur) => [...cur, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await sendAssistantMessage(content);
      setMessages((cur) => [...cur, response.message]);
    } catch {
      setMessages((cur) => [
        ...cur,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "The assistant backend did not respond. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Tax Strategist</h1>
          <p className="mt-1 text-base text-muted-foreground">
            Powered by Groq · Answers based on your live tax profile
          </p>
        </div>
        {/* Live profile summary */}
        <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Profile Income</p>
            <p className="text-xl font-bold text-primary">${assistant.profile.totalIncome.toLocaleString()}</p>
          </div>
          <div className="w-px h-8 bg-border/60 hidden sm:block" />
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Est. Tax</p>
            <p className="text-xl font-bold">${assistant.profile.estimatedTax.toLocaleString()}</p>
          </div>
          <div className="w-px h-8 bg-border/60 hidden sm:block" />
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Rate</p>
            <p className="text-xl font-bold">{assistant.profile.effectiveTaxRate}%</p>
          </div>
          <Badge className="rounded-full bg-emerald-100 text-emerald-700 shadow-none text-xs">Online</Badge>
        </div>
      </div>

      {/* Suggested prompts — compact horizontal scroll */}
      <div className="flex flex-wrap gap-2">
        {assistant.suggestedQuestions.map((q) => (
          <button
            key={q}
            onClick={() => void handleSend(q)}
            className="rounded-2xl border border-border/70 bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Main chat card — tall and full width */}
      <Card className="flex flex-col border-border/70 bg-card/92 shadow-sm flex-1 min-h-[600px]">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Bot className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base">TaxGPT Assistant</CardTitle>
              <CardDescription className="text-xs">Filing status: <span className="font-medium text-foreground capitalize">{assistant.profile.filingStatus}</span></CardDescription>
            </div>
            <Badge className="ml-auto rounded-full bg-emerald-100 text-emerald-700 shadow-none">● Active</Badge>
          </div>
        </CardHeader>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-5 space-y-5 scroll-smooth"
          style={{ maxHeight: "calc(100vh - 420px)", minHeight: "400px" }}
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mt-0.5">
                  <Bot className="size-4" />
                </div>
              )}


              <div
                className={`rounded-[20px] px-4 py-3 leading-relaxed ${msg.role === "user"
                  ? "max-w-[70%] bg-primary text-primary-foreground"
                  : "max-w-[82%] bg-card border border-border/60 shadow-sm text-foreground"
                  }`}
              >
                {msg.role === "assistant" && <RichMessageRenderer content={msg.content} />}
                <p className="whitespace-pre-line text-sm">{msg.content}</p>
                <div className={`mt-2 flex items-center gap-1 text-[10px] ${msg.role === "user" ? "text-primary-foreground/60 justify-end" : "text-muted-foreground"}`}>
                  <Clock3 className="size-3" />
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>

              {msg.role === "user" && (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mt-0.5">
                  <User className="size-4" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isSending && (
            <div className="flex gap-3 justify-start">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bot className="size-4" />
              </div>
              <div className="rounded-[20px] bg-secondary px-4 py-3">
                <div className="flex gap-1.5 items-center h-5">
                  <span className="size-2 rounded-full bg-primary/40 animate-bounce" />
                  <span className="size-2 rounded-full bg-primary/40 animate-bounce [animation-delay:120ms]" />
                  <span className="size-2 rounded-full bg-primary/40 animate-bounce [animation-delay:240ms]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-border/60 p-4">
          {/* Toolbar row */}
          <div className="flex items-center gap-2 mb-2 relative">
            <button
              onClick={() => setShowPicker((v) => !v)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border transition ${showPicker
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 bg-secondary text-muted-foreground hover:text-foreground"
                }`}
            >
              <Smile className="size-3.5" />
              Stickers & Emoji
            </button>
            <span className="text-xs text-muted-foreground">Click to insert into message</span>
            {showPicker && (
              <EmojiPicker
                onSelect={(e) => setInput((prev) => prev + e)}
                onClose={() => setShowPicker(false)}
              />
            )}
          </div>

          <div className="flex gap-3 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about taxes... or add emoji 😎💰🧾"
              className="min-h-[56px] max-h-[140px] rounded-2xl border-border/70 bg-background shadow-sm resize-none focus-visible:ring-primary/40 text-sm"
              rows={2}
            />
            <Button
              className="h-14 px-5 rounded-2xl shrink-0"
              onClick={() => void handleSend()}
              disabled={!input.trim() || isSending}
            >
              <Send className="size-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="size-3" />
            Responses are personalized using your live tax profile data from the Python backend.
          </p>
        </div>
      </Card>
    </div>
  );
}
