import { useRef, useState } from "react";
import { AlertCircle, CheckCircle, Clock, Download, Eye, FileText, Image, Sparkles, Trash2, Upload } from "lucide-react";
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

  const handleUpload = (file: File | null) => {
    if (file) {
      void uploadDocument(file, uploadCategory);
    }
  };

  const handleDrag = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(event.type === "dragenter" || event.type === "dragover");
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    handleUpload(event.dataTransfer.files?.[0] ?? null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">Document intelligence</h1>
        <p className="mt-2 text-base text-muted-foreground">Upload tax records to the Python backend and keep extraction status visible across the workspace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/70 bg-card/92 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Total documents</CardDescription>
            <CardTitle className="text-2xl">{documents.summary.totalDocuments}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Files synced to backend state</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/92 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Processed</CardDescription>
            <CardTitle className="text-2xl text-green-600">{documents.summary.processedDocuments}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={(documents.summary.processedDocuments / Math.max(documents.summary.totalDocuments, 1)) * 100} className="h-2" />
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/92 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Pending review</CardDescription>
            <CardTitle className="text-2xl text-amber-600">{documents.summary.pendingDocuments}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Needs upload or verification</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card className="border-border/70 bg-card/92 shadow-sm">
            <CardHeader>
              <CardTitle>Upload tax documents</CardTitle>
              <CardDescription>Assign a category, then send the file to the backend extraction workflow.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 max-w-sm">
                <Label htmlFor="documentCategory">Category</Label>
                <Select value={uploadCategory} onValueChange={setUploadCategory}>
                  <SelectTrigger id="documentCategory" className="mt-2 rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documents.categories.filter((category) => category !== "All").map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div
                className={`rounded-[28px] border-2 border-dashed p-12 text-center transition ${dragActive ? "border-primary bg-secondary/50" : "border-border bg-background/70"}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto mb-4 size-12 text-primary/70" />
                <h3 className="text-lg font-semibold">Drop files here to upload</h3>
                <p className="mt-2 text-sm text-muted-foreground">Supports PDF, JPG, and PNG. The backend returns processed metadata immediately.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(event) => {
                    handleUpload(event.target.files?.[0] ?? null);
                    event.currentTarget.value = "";
                  }}
                />
                <Button className="mt-5 rounded-2xl" onClick={() => fileInputRef.current?.click()}>Browse files</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 size-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">Extraction workflow</p>
                  <p className="mt-1 text-sm text-blue-700">Uploaded files are categorized, processed, and returned with extracted amount, date, and vendor placeholders from the Python API.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          {documents.items.map((doc) => (
            <Card key={doc.id} className="border-border/70 bg-card/92 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="rounded-2xl bg-secondary p-3 text-primary">
                      {doc.type === "PDF" ? <FileText className="size-6" /> : <Image className="size-6" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{doc.name}</p>
                        <Badge variant="outline">{doc.category}</Badge>
                        <Badge variant={doc.status === "processed" ? "default" : "secondary"}>{doc.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{doc.size} • Uploaded {new Date(doc.uploadDate).toLocaleDateString()}</p>
                      {doc.extractedData && (
                        <div className="mt-4 grid gap-3 rounded-3xl border border-border/60 bg-background/70 p-4 md:grid-cols-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Amount</p>
                            <p className="mt-1 font-semibold">${doc.extractedData.amount?.toLocaleString() ?? "--"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Date</p>
                            <p className="mt-1 font-semibold">{doc.extractedData.date ? new Date(doc.extractedData.date).toLocaleDateString() : "--"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Vendor</p>
                            <p className="mt-1 font-semibold">{doc.extractedData.vendor ?? "--"}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm"><Eye className="size-4" /></Button>
                    <Button variant="ghost" size="sm"><Download className="size-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => void deleteDocument(doc.id)}><Trash2 className="size-4 text-red-600" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <Card className="border-border/70 bg-card/92 shadow-sm">
            <CardHeader>
              <CardTitle>Required documents</CardTitle>
              <CardDescription>Track required and optional document coverage for filing readiness.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.checklist.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-3xl border border-border/60 bg-background/70 px-5 py-4">
                  <div className="flex items-center gap-3">
                    {item.uploaded ? <CheckCircle className="size-5 text-green-600" /> : item.required ? <AlertCircle className="size-5 text-amber-600" /> : <Clock className="size-5 text-slate-500" />}
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <Badge variant={item.uploaded ? "default" : item.required ? "destructive" : "secondary"}>{item.uploaded ? "Uploaded" : item.required ? "Missing" : "Optional"}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}