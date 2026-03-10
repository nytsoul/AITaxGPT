import { useEffect, useRef, useState } from "react";
import { Bot, Clock3, Send, Sparkles, User } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import { useTaxData } from "../providers/TaxDataProvider";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function AIAssistant() {
  const { assistant, sendAssistantMessage, isLoading, error } = useTaxData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (assistant && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "I can explain tax exposure, missing deductions, document gaps, and scenario tradeoffs based on your live backend profile. Ask a specific planning question to start.",
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
    return <div className="rounded-[28px] border border-border/70 bg-card p-10 text-sm text-muted-foreground shadow-sm">Loading assistant...</div>;
  }

  if (!assistant) {
    return <div className="rounded-[28px] border border-destructive/20 bg-red-50 p-10 text-sm text-red-700">{error ?? "Assistant data is unavailable."}</div>;
  }

  const handleSend = async (preset?: string) => {
    const content = (preset ?? input).trim();
    if (!content || isSending) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await sendAssistantMessage(content);
      setMessages((current) => [...current, response.message]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "The assistant backend did not respond correctly. Try again in a moment.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden border-border/70 bg-[linear-gradient(135deg,rgba(18,52,71,0.96),rgba(75,133,113,0.92))] text-white shadow-[0_24px_70px_rgba(18,52,71,0.22)]">
          <CardContent className="p-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl space-y-4">
                <Badge className="rounded-full bg-white/12 px-4 py-1 text-[11px] uppercase tracking-[0.2em] text-white shadow-none hover:bg-white/12">Python-backed assistant</Badge>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">AI tax strategist</h1>
                  <p className="mt-3 text-base text-white/72">The assistant now answers against the backend profile that powers the calculator, deductions, documents, and scenario simulator.</p>
                </div>
              </div>

              <div className="grid min-w-[280px] gap-3 rounded-[28px] border border-white/12 bg-black/15 p-5 backdrop-blur-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/55">Profile income</p>
                  <p className="mt-2 text-3xl font-bold">${assistant.profile.totalIncome.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/8 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/55">Tax</p>
                    <p className="mt-2 text-xl font-bold">${assistant.profile.estimatedTax.toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl bg-white/8 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/55">Rate</p>
                    <p className="mt-2 text-xl font-bold">{assistant.profile.effectiveTaxRate}%</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/92 shadow-sm">
          <CardHeader>
            <CardTitle>Suggested prompts</CardTitle>
            <CardDescription>Questions tuned to the current backend profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assistant.suggestedQuestions.map((question) => (
              <Button
                key={question}
                variant="outline"
                className="h-auto w-full justify-start rounded-2xl border-border/70 bg-background/70 px-4 py-3 text-left"
                onClick={() => void handleSend(question)}
              >
                {question}
              </Button>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="min-h-[620px] border-border/70 bg-card/92 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Conversation</CardTitle>
                <CardDescription>Backend-generated guidance tied to your saved tax profile.</CardDescription>
              </div>
              <Badge className="rounded-full bg-secondary px-3 py-1 text-primary shadow-none">Online</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex h-[520px] flex-col gap-4">
            <ScrollArea className="flex-1 rounded-[24px] border border-border/60 bg-background/70 px-4 py-5" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.role === "assistant" && (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                        <Bot className="size-5" />
                      </div>
                    )}
                    <div className={`max-w-[78%] rounded-[24px] px-4 py-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card shadow-sm"}`}>
                      <p className="whitespace-pre-line text-sm leading-6">{message.content}</p>
                      <div className={`mt-3 flex items-center gap-1 text-xs ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        <Clock3 className="size-3" />
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <User className="size-5" />
                      </div>
                    )}
                  </div>
                ))}

                {isSending && (
                  <div className="flex gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                      <Bot className="size-5" />
                    </div>
                    <div className="rounded-[24px] bg-card px-4 py-3 shadow-sm">
                      <div className="flex gap-2">
                        <span className="size-2 rounded-full bg-primary/35 animate-bounce" />
                        <span className="size-2 rounded-full bg-primary/35 animate-bounce [animation-delay:120ms]" />
                        <span className="size-2 rounded-full bg-primary/35 animate-bounce [animation-delay:240ms]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="rounded-[24px] border border-border/60 bg-background/70 p-3">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about deductions, deadlines, reserves, or scenario tradeoffs..."
                className="min-h-24 rounded-2xl border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <div className="mt-3 flex justify-end">
                <Button className="rounded-2xl" onClick={() => void handleSend()} disabled={!input.trim() || isSending}>
                  <Send className="size-4" />
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/70 bg-card/92 shadow-sm">
            <CardHeader>
              <CardTitle>Live profile context</CardTitle>
              <CardDescription>What the assistant is using right now.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-3xl bg-secondary p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Filing status</p>
                <p className="mt-2 text-2xl font-bold text-primary">{assistant.profile.filingStatus}</p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Estimated tax</p>
                <p className="mt-2 text-2xl font-bold text-primary">${assistant.profile.estimatedTax.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/92 shadow-sm">
            <CardHeader>
              <CardTitle>Best use cases</CardTitle>
              <CardDescription>High-value assistant workflows.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {[
                "Explain which deductions are still inactive and what evidence you need.",
                "Estimate quarterly reserve pressure from freelance income.",
                "Summarize missing document risks before filing deadlines.",
                "Compare two investment or deduction scenarios before you save them.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/70 p-4">
                  <Sparkles className="mt-0.5 size-4 text-chart-3" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
