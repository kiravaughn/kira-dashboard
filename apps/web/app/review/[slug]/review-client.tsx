"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Save, CheckCircle, XCircle } from "lucide-react";

interface ReviewClientProps {
  slug: string;
  filePath: string;
  content: string;
  category: string;
}

interface ReviewData {
  id?: number;
  status: string;
  notes: string;
  category: string;
  subcategory: string;
  reviewedAt: string | null;
}

interface AuditLog {
  id: number;
  action: string;
  actor: string;
  fromStatus: string | null;
  toStatus: string | null;
  notes: string | null;
  createdAt: string;
}

export default function ReviewClient({ slug, filePath, content, category }: ReviewClientProps) {
  const [reviewData, setReviewData] = useState<ReviewData>({
    status: "pending",
    notes: "",
    category: "general",
    subcategory: "general",
    reviewedAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localNotes, setLocalNotes] = useState("");
  const [localStatus, setLocalStatus] = useState("pending");
  const [localCategory, setLocalCategory] = useState("general");
  const [localSubcategory, setLocalSubcategory] = useState("general");
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Fetch review data from API
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await fetch(`/api/review?filePath=${encodeURIComponent(filePath)}`);
        if (res.ok) {
          const data = await res.json();
          setReviewData({
            id: data.id,
            status: data.status || "pending",
            notes: data.notes || "",
            category: data.category || "general",
            subcategory: data.subcategory || "general",
            reviewedAt: data.reviewedAt,
          });
          setLocalStatus(data.status || "pending");
          setLocalNotes(data.notes || "");
          setLocalCategory(data.category || "general");
          setLocalSubcategory(data.subcategory || "general");
          
          // Fetch audit logs if we have a review ID
          if (data.id) {
            const auditRes = await fetch(`/api/review?audit=true&contentId=${data.id}`);
            if (auditRes.ok) {
              const logs = await auditRes.json();
              setAuditLogs(logs);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching review:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [slug, filePath]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filePath,
          status: localStatus,
          notes: localNotes,
          category: localCategory,
          subcategory: localSubcategory,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviewData({
          id: data.id,
          status: data.status,
          notes: data.notes || "",
          category: data.category || "general",
          subcategory: data.subcategory || "general",
          reviewedAt: data.reviewedAt,
        });
        setSaveMessage({ type: "success", text: "Review saved successfully!" });
        
        // Refetch audit logs
        if (data.id) {
          const auditRes = await fetch(`/api/review?audit=true&contentId=${data.id}`);
          if (auditRes.ok) {
            const logs = await auditRes.json();
            setAuditLogs(logs);
          }
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setSaveMessage({ type: "error", text: err.error || "Failed to save review" });
      }
    } catch (error) {
      console.error("Error saving review:", error);
      setSaveMessage({ type: "error", text: "Error saving review. Please try again." });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      case "needs-improvement":
        return "warning";
      default:
        return "secondary";
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return then.toLocaleDateString();
  };

  const getActionDescription = (log: AuditLog) => {
    switch (log.action) {
      case "status_change":
        return `Changed status from ${log.fromStatus || "none"} to ${log.toStatus}`;
      case "notes_updated":
        return "Updated notes";
      case "published":
        return "Published content";
      case "revised":
        return "Revised content";
      default:
        return log.action;
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-3 lg:gap-8 overflow-hidden">
      {/* Content Preview */}
      <div className="space-y-4 min-w-0">
        <Card>
          <CardHeader className="p-4 lg:p-6">
            <CardTitle>Content Preview</CardTitle>
          </CardHeader>
          <CardContent className="overflow-hidden p-4 lg:p-6">
            <div className="prose prose-invert prose-sm max-w-none break-words overflow-wrap-anywhere">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Form */}
      <div className="space-y-4 min-w-0">
        <Card>
          <CardHeader className="p-4 lg:p-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="break-words">Review Status</CardTitle>
              {loading ? (
                <Badge variant="secondary">Loading...</Badge>
              ) : (
                <Badge variant={getStatusBadgeVariant(reviewData.status)}>
                  {reviewData.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 lg:p-6">
            {/* Status Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={localStatus === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLocalStatus("pending")}
                >
                  Pending
                </Button>
                <Button
                  variant={localStatus === "approved" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLocalStatus("approved")}
                  className={localStatus === "approved" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Approved
                </Button>
                <Button
                  variant={localStatus === "rejected" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLocalStatus("rejected")}
                  className={localStatus === "rejected" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  Rejected
                </Button>
                <Button
                  variant={localStatus === "needs-improvement" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLocalStatus("needs-improvement")}
                  className={localStatus === "needs-improvement" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                >
                  Needs Work
                </Button>
              </div>
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="e.g., blog, content"
                  value={localCategory}
                  onChange={(e) => setLocalCategory(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="subcategory" className="text-sm font-medium">
                  Subcategory
                </label>
                <input
                  id="subcategory"
                  type="text"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="e.g., tech, tcg"
                  value={localSubcategory}
                  onChange={(e) => setLocalSubcategory(e.target.value)}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <textarea
                id="notes"
                className="w-full min-h-[200px] rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Add your review notes here..."
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
              />
            </div>

            {/* Save Button */}
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={saving || loading}
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Review
                </>
              )}
            </Button>

            {/* Save Feedback */}
            {saveMessage && (
              <div className={`flex items-center justify-center gap-2 text-sm ${saveMessage.type === "success" ? "text-green-400" : "text-red-400"}`}>
                {saveMessage.type === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {saveMessage.text}
              </div>
            )}

            {/* Last Reviewed */}
            {reviewData.reviewedAt && (
              <p className="text-xs text-muted-foreground text-center">
                Last reviewed: {new Date(reviewData.reviewedAt).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Audit Log Panel */}
        {auditLogs.length > 0 && (
          <Card>
            <CardHeader className="p-4 lg:p-6">
              <CardTitle>Audit Log</CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6">
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border-l-2 border-primary/30 pl-4 py-2 text-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-primary">
                        {getActionDescription(log)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(log.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>by {log.actor}</span>
                    </div>
                    {log.notes && (
                      <div className="mt-2 text-xs bg-muted/30 rounded p-2">
                        {log.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
