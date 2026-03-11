import { useState } from "react";
import { User, Bell, Shield, Palette, Save, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useTaxData } from "../providers/TaxDataProvider";

const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
] as const;

type Tab = typeof TABS[number]["id"];

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
    );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-6 rounded-2xl border border-border/60 bg-background/70 p-4">
            <div>
                <p className="text-sm font-medium">{label}</p>
                {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-secondary"}`}
        >
            <span
                className={`block h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
            />
        </button>
    );
}

export function Settings() {
    const { user, logout } = useTaxData();
    const [activeTab, setActiveTab] = useState<Tab>("profile");

    // Notification preferences state
    const [notifPrefs, setNotifPrefs] = useState({
        deadlineReminders: true,
        auditAlerts: true,
        deductionOpportunities: true,
        weeklyDigest: false,
        documentProcessed: true,
    });

    // Appearance state
    const [accentColor, setAccentColor] = useState("teal");

    const toggleNotif = (key: keyof typeof notifPrefs) => {
        setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                <p className="mt-1 text-base text-muted-foreground">
                    Manage your account, preferences, and application settings.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
                {/* Sidebar Nav */}
                <Card className="border-border/70 bg-card/92 shadow-sm h-fit">
                    <CardContent className="p-3 space-y-1">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${activeTab === id
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    }`}
                            >
                                <span className="flex items-center gap-3">
                                    <Icon className="size-4 shrink-0" />
                                    {label}
                                </span>
                                <ChevronRight className="size-3.5 opacity-50" />
                            </button>
                        ))}

                        <div className="pt-3 border-t border-border/60 mt-2">
                            <button
                                onClick={() => logout()}
                                className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="space-y-6">
                    {/* Profile Tab */}
                    {activeTab === "profile" && (
                        <Card className="border-border/70 bg-card/92 shadow-sm">
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Manage your personal details and account settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <SectionTitle title="Account Details" subtitle="Your personal profile information." />

                                {/* Avatar */}
                                <div className="flex items-center gap-5 rounded-2xl border border-border/60 bg-background/70 p-5">
                                    <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold select-none">
                                        {user?.full_name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "?"}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg">{user?.full_name ?? "Unnamed User"}</p>
                                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                                        <Badge className="mt-2 rounded-full bg-secondary text-primary shadow-none text-xs">Free Plan</Badge>
                                    </div>
                                </div>

                                {/* Fields */}
                                <div className="space-y-4">
                                    {[
                                        { label: "Full Name", value: user?.full_name ?? "", placeholder: "Your full name" },
                                        { label: "Email Address", value: user?.email ?? "", placeholder: "your@email.com" },
                                    ].map(({ label, value, placeholder }) => (
                                        <div key={label}>
                                            <label className="text-sm font-medium text-foreground">{label}</label>
                                            <input
                                                readOnly
                                                defaultValue={value}
                                                placeholder={placeholder}
                                                className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                            />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-sm font-medium text-foreground">Filing Status</label>
                                        <select className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring">
                                            <option>Single</option>
                                            <option>Married Filing Jointly</option>
                                            <option>Married Filing Separately</option>
                                            <option>Head of Household</option>
                                        </select>
                                    </div>
                                </div>

                                <Button className="rounded-2xl gap-2">
                                    <Save className="size-4" />
                                    Save changes
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === "notifications" && (
                        <Card className="border-border/70 bg-card/92 shadow-sm">
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>Choose which alerts you want to receive.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SectionTitle title="Alert Settings" subtitle="Configure how TaxGPT notifies you of important events." />
                                <div className="space-y-3">
                                    {[
                                        { key: "deadlineReminders", label: "Deadline Reminders", desc: "Alerts for tax filing and payment due dates." },
                                        { key: "auditAlerts", label: "Audit Risk Alerts", desc: "Warnings when your profile has high audit risk indicators." },
                                        { key: "deductionOpportunities", label: "Deduction Opportunities", desc: "Notified when new deductions are available." },
                                        { key: "documentProcessed", label: "Document Processed", desc: "Alert when uploaded documents are fully analyzed." },
                                        { key: "weeklyDigest", label: "Weekly Tax Digest", desc: "A weekly summary of your tax planning progress." },
                                    ].map(({ key, label, desc }) => (
                                        <SettingRow key={key} label={label} description={desc}>
                                            <Toggle
                                                checked={notifPrefs[key as keyof typeof notifPrefs]}
                                                onChange={() => toggleNotif(key as keyof typeof notifPrefs)}
                                            />
                                        </SettingRow>
                                    ))}
                                </div>
                                <div className="mt-5">
                                    <Button className="rounded-2xl gap-2">
                                        <Save className="size-4" /> Save preferences
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Security Tab */}
                    {activeTab === "security" && (
                        <Card className="border-border/70 bg-card/92 shadow-sm">
                            <CardHeader>
                                <CardTitle>Security</CardTitle>
                                <CardDescription>Manage your password and security settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <SectionTitle title="Account Security" subtitle="Keep your account protected with strong credentials." />
                                <div className="space-y-4">
                                    {["Current Password", "New Password", "Confirm New Password"].map((label) => (
                                        <div key={label}>
                                            <label className="text-sm font-medium text-foreground">{label}</label>
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-3 pt-2">
                                    <SettingRow label="Two-Factor Authentication" description="Add an extra layer of security to your account.">
                                        <Badge className="rounded-full bg-secondary text-muted-foreground shadow-none text-xs">Coming soon</Badge>
                                    </SettingRow>
                                    <SettingRow label="Active Sessions" description="You are currently signed in on this device.">
                                        <Badge className="rounded-full bg-emerald-100 text-emerald-700 shadow-none text-xs">Active</Badge>
                                    </SettingRow>
                                </div>
                                <Button className="rounded-2xl gap-2">
                                    <Save className="size-4" /> Update password
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === "appearance" && (
                        <Card className="border-border/70 bg-card/92 shadow-sm">
                            <CardHeader>
                                <CardTitle>Appearance</CardTitle>
                                <CardDescription>Customize the look and feel of TaxGPT.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <SectionTitle title="Theme Settings" subtitle="Choose your preferred accent color and layout." />
                                <div>
                                    <p className="text-sm font-medium mb-3">Accent Color</p>
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { id: "teal", label: "Teal", bg: "bg-teal-500" },
                                            { id: "blue", label: "Blue", bg: "bg-blue-500" },
                                            { id: "violet", label: "Violet", bg: "bg-violet-500" },
                                            { id: "rose", label: "Rose", bg: "bg-rose-500" },
                                            { id: "amber", label: "Amber", bg: "bg-amber-500" },
                                        ].map(({ id, label, bg }) => (
                                            <button
                                                key={id}
                                                onClick={() => setAccentColor(id)}
                                                className={`flex items-center gap-2 rounded-2xl border-2 px-4 py-2 text-sm font-medium transition ${accentColor === id ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40"
                                                    }`}
                                            >
                                                <span className={`size-3.5 rounded-full ${bg}`} />
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <SettingRow label="Compact Mode" description="Reduce spacing and padding across the dashboard.">
                                        <Toggle checked={false} onChange={() => { }} />
                                    </SettingRow>
                                    <SettingRow label="Sidebar Collapsed by Default" description="Start with the sidebar minimized.">
                                        <Toggle checked={false} onChange={() => { }} />
                                    </SettingRow>
                                </div>

                                <Button className="rounded-2xl gap-2">
                                    <Save className="size-4" /> Apply settings
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
