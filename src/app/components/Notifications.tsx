import { Bell, CheckCheck, AlertTriangle, CalendarClock, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useTaxData } from "../providers/TaxDataProvider";
import { useState } from "react";

const TYPE_STYLES: Record<string, { icon: typeof Bell; labelColor: string; badgeBg: string; label: string }> = {
    deadline: {
        icon: CalendarClock,
        labelColor: "text-amber-600",
        badgeBg: "bg-amber-100 text-amber-700",
        label: "Deadline",
    },
    error: {
        icon: AlertTriangle,
        labelColor: "text-red-600",
        badgeBg: "bg-red-100 text-red-700",
        label: "Error",
    },
    risk: {
        icon: AlertTriangle,
        labelColor: "text-red-500",
        badgeBg: "bg-red-100 text-red-700",
        label: "Risk",
    },
    opportunity: {
        icon: Info,
        labelColor: "text-blue-600",
        badgeBg: "bg-blue-100 text-blue-700",
        label: "Opportunity",
    },
    info: {
        icon: Info,
        labelColor: "text-teal-600",
        badgeBg: "bg-teal-100 text-teal-700",
        label: "Info",
    },
};

export function Notifications() {
    const { dashboard, isLoading, error } = useTaxData();
    const [dismissed, setDismissed] = useState<string[]>([]);

    if (isLoading && !dashboard) {
        return <div className="rounded-[28px] border border-border/70 bg-card p-10 text-sm text-muted-foreground shadow-sm">Loading notifications...</div>;
    }

    if (!dashboard) {
        return <div className="rounded-[28px] border border-destructive/20 bg-red-50 p-10 text-sm text-red-700">{error ?? "Data unavailable."}</div>;
    }

    const allNotifications = dashboard.notifications ?? [];
    const visible = allNotifications.filter((n) => !dismissed.includes(n.id));
    const dismissAll = () => setDismissed(allNotifications.map((n) => n.id));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
                    <p className="mt-1 text-base text-muted-foreground">
                        Real-time alerts about your tax profile, deadlines, and risks.
                    </p>
                </div>
                {visible.length > 0 && (
                    <Button variant="outline" className="rounded-2xl gap-2" onClick={dismissAll}>
                        <CheckCheck className="size-4" />
                        Mark all as read
                    </Button>
                )}
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total", value: allNotifications.length, color: "text-foreground" },
                    { label: "Unread", value: visible.length, color: "text-amber-600" },
                    { label: "Deadlines", value: allNotifications.filter((n) => n.type === "deadline").length, color: "text-amber-600" },
                    { label: "Alerts", value: allNotifications.filter((n) => ["error", "risk"].includes(n.type)).length, color: "text-red-600" },
                ].map((stat) => (
                    <Card key={stat.label} className="border-border/70 bg-card/92 shadow-sm">
                        <CardContent className="p-5">
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
                            <p className={`mt-2 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Notifications List */}
            <Card className="border-border/70 bg-card/92 shadow-sm">
                <CardHeader>
                    <CardTitle>All Notifications</CardTitle>
                    <CardDescription>Click the dismiss button to clear individual alerts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {visible.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                            <div className="rounded-full bg-secondary p-5">
                                <CheckCheck className="size-8 text-primary" />
                            </div>
                            <p className="text-lg font-semibold">You're all caught up!</p>
                            <p className="text-sm text-muted-foreground">No pending notifications at this time.</p>
                        </div>
                    ) : (
                        visible.map((note) => {
                            const style = TYPE_STYLES[note.type] ?? TYPE_STYLES["info"];
                            const Icon = style.icon;
                            return (
                                <div
                                    key={note.id}
                                    className="flex items-start gap-4 rounded-2xl border border-border/60 bg-background/70 p-4 transition hover:bg-secondary/30"
                                >
                                    <div className={`mt-0.5 rounded-xl p-2.5 ${style.badgeBg}`}>
                                        <Icon className={`size-5 ${style.labelColor}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold text-sm">{note.title}</p>
                                            <Badge className={`rounded-full px-2 py-0.5 text-[10px] shadow-none ${style.badgeBg}`}>
                                                {style.label}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{note.message}</p>
                                        <p className="mt-2 text-xs text-muted-foreground/50">
                                            {new Date(note.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
                                        onClick={() => setDismissed((prev) => [...prev, note.id])}
                                    >
                                        Dismiss
                                    </Button>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
