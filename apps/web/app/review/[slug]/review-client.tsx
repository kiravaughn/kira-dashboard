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
  status: string;
  notes: string;
  reviewedAt: string | null;
}

export default function ReviewClient({ slug, filePath, content, category }: ReviewClientProps) {
  const [reviewData, setReviewData] = useState<ReviewData>({
    status: "pending",
    notes: "",
    reviewedAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localNotes, setLocalNotes] = useState("");
  const [localStatus, setLocalStatus] = useState("pending");
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch review data from API
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await fetch(`/api/review?filePath=${encodeURIComponent(filePath)}`);
        if (res.ok) {
          const data = await res.json();
          setReviewData({
            status: data.status || "pending",
            notes: data.notes || "",
            reviewedAt: data.reviewedAt,
          });
          setLocalStatus(data.status || "pending");
          setLocalNotes(data.notes || "");
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
          category,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviewData({
          status: data.status,
          notes: data.notes || "",
          reviewedAt: data.reviewedAt,
        });
        setSaveMessage({ type: "success", text: "Review saved successfully!" });
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

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Content Preview */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Content Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Form */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Review Status</CardTitle>
              {loading ? (
                <Badge variant="secondary">Loading...</Badge>
              ) : (
                <Badge variant={getStatusBadgeVariant(reviewData.status)}>
                  {reviewData.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
      </div>
    </div>
  );
}
