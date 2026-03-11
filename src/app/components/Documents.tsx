import { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  FolderOpen,
  Image,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useTaxData } from "../providers/TaxDataProvider";

export function Documents() {
  const { documents, uploadDocument, deleteDocument, isLoading, error } = useTaxData();
  const [dragActive, setDragActive] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("Income");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading && !documents) {
    return <div className="rounded-[28px] border border-border/70 bg-card p-10 text-sm text-muted-foreground shadow-sm">Loading documents...</div>;
  }
  if (!documents) {
    return <div className="rounded-[28px] border border-destructive/20 bg-red-50 p-10 text-sm text-red-700">{error ?? "Documents data is unavailable."}</div>;
  }

  const handleUpload = (file: File | null) => { if (file) void uploadDocument(file, uploadCategory); };
  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === "dragenter" || e.type === "dragover"); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); handleUpload(e.dataTransfer.files?.[0] ?? null); };

  const coverage = documents.summary.totalDocuments > 0
    ? Math.round((documents.summary.processedDocuments / documents.summary.totalDocuments) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,rgba(18,52,71,0.97),rgba(32,74,70,0.92))] text-white shadow-[0_24px_70px_rgba(18,52,71,0.22)]">
        <CardContent className="p-6 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <Badge className="rounded-full bg-white/12 px-4 py-1 text-[11px] uppercase tracking-[0.24em] text-white shadow-none hover:bg-white/12">
                AI Document Intelligence
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Your Document Vault</h1>
              <p className="text-white/72 text-sm sm:text-base">
                Upload, categorize, and analyze your tax records. Our AI extracts key data instantly.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 min-w-[300px]">
              {[
                { label: "Total", value: documents.summary.totalDocuments, color: "text-white" },
                { label: "Processed", value: documents.summary.processedDocuments, color: "text-emerald-300" },
                { label: "Pending", value: documents.summary.pendingDocuments, color: "text-amber-300" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-2xl border border-white/12 bg-black/20 p-4 text-center backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">{label}</p>
                  <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/60 uppercase tracking-widest">Processing coverage</p>
              <p className="text-xs font-bold text-white">{coverage}%</p>
            </div>
            <Progress value={coverage} className="h-2 bg-white/20" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="upload" className="space-y-5">
        <TabsList className="rounded-2xl bg-secondary/70 p-1">
          <TabsTrigger value="upload" className="rounded-xl">Upload</TabsTrigger>
          <TabsTrigger value="library" className="rounded-xl">Library ({documents.items.length})</TabsTrigger>
          <TabsTrigger value="checklist" className="rounded-xl">Checklist</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <Card className="border-border/70 bg-card/92 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Upload className="size-5 text-primary" /> Upload Documents</CardTitle>
                <CardDescription>Select a category then drag-and-drop or browse for files.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label htmlFor="documentCategory" className="text-sm font-medium">Document Category</Label>
                  <Select value={uploadCategory} onValueChange={setUploadCategory}>
                    <SelectTrigger id="documentCategory" className="mt-2 rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {documents.categories.filter((c) => c !== "All").map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div
                  className={`flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-16 text-center transition-colors cursor-pointer ${dragActive ? "border-primary bg-primary/5" : "border-border/70 bg-background/70 hover:border-primary/50"
                    }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="rounded-2xl bg-primary/10 p-5 mb-5">
                    <Upload className="size-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Drop your file here</h3>
                  <p className="text-sm text-muted-foreground mb-5">Supports PDF, JPG, and PNG. Extraction happens instantly.</p>
                  <Button className="rounded-2xl" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                    Browse Files
                  </Button>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => { handleUpload(e.target.files?.[0] ?? null); e.currentTarget.value = ""; }} />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="border-teal-200 bg-teal-50 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex gap-3">
                    <Sparkles className="mt-0.5 size-5 text-teal-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-teal-900">AI Extraction</p>
                      <p className="mt-1 text-sm text-teal-700">Files are categorized and key amounts, dates, and vendors are extracted automatically.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/92 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Filing checklist coverage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {documents.checklist.slice(0, 4).map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {item.uploaded ? <CheckCircle className="size-4 text-emerald-500" /> : item.required ? <AlertCircle className="size-4 text-amber-500" /> : <Clock className="size-4 text-slate-400" />}
                        <span className="truncate max-w-[140px]">{item.name}</span>
                      </div>
                      <Badge variant={item.uploaded ? "default" : item.required ? "destructive" : "secondary"} className="text-[10px]">
                        {item.uploaded ? "Done" : item.required ? "Missing" : "Optional"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {documents.items.map((doc) => (
              <Card key={doc.id} className="border-border/70 bg-card/92 shadow-sm group hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      {doc.type === "PDF" ? <FileText className="size-6" /> : <Image className="size-6" />}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="size-8 rounded-xl"><Eye className="size-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="size-8 rounded-xl"><Download className="size-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="size-8 rounded-xl" onClick={() => void deleteDocument(doc.id)}><Trash2 className="size-3.5 text-red-500" /></Button>
                    </div>
                  </div>

                  <p className="font-semibold text-sm truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{doc.size} · {new Date(doc.uploadDate).toLocaleDateString()}</p>

                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                    <Badge variant={doc.status === "processed" ? "default" : "secondary"} className="text-xs capitalize">{doc.status}</Badge>
                  </div>

                  {doc.extractedData && (
                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-secondary/50 p-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-semibold mt-0.5">${doc.extractedData.amount?.toLocaleString() ?? "--"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-semibold mt-0.5">{doc.extractedData.date ? new Date(doc.extractedData.date).toLocaleDateString() : "--"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Vendor</p>
                        <p className="font-semibold mt-0.5 truncate">{doc.extractedData.vendor ?? "--"}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {documents.items.length === 0 && (
              <div className="col-span-3 flex flex-col items-center py-20 gap-4 text-center">
                <div className="rounded-2xl bg-secondary p-6"><FolderOpen className="size-10 text-primary" /></div>
                <p className="font-semibold text-lg">No documents yet</p>
                <p className="text-sm text-muted-foreground">Upload your first document to get started.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="checklist">
          <Card className="border-border/70 bg-card/92 shadow-sm">
            <CardHeader>
              <CardTitle>Required Document Checklist</CardTitle>
              <CardDescription>Track required and optional document coverage for filing readiness.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {documents.checklist.map((item) => (
                  <div key={item.name} className={`flex items-center justify-between rounded-2xl border border-border/60 px-4 py-3.5 transition ${item.uploaded ? "bg-emerald-50 border-emerald-200" : item.required ? "bg-amber-50 border-amber-200" : "bg-background/70"}`}>
                    <div className="flex items-center gap-3">
                      {item.uploaded ? <CheckCircle className="size-5 text-emerald-600 shrink-0" /> : item.required ? <AlertCircle className="size-5 text-amber-600 shrink-0" /> : <Clock className="size-5 text-slate-400 shrink-0" />}
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                    <Badge variant={item.uploaded ? "default" : item.required ? "destructive" : "secondary"} className="text-xs">
                      {item.uploaded ? "Uploaded" : item.required ? "Missing" : "Optional"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}