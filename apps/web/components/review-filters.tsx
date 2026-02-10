"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

type Status = "pending" | "approved" | "rejected" | "needs-improvement";
type Category = "blog-tech" | "blog-tcg" | "blog-posts" | "job-search" | "linkedin" | "style-guide" | "general";

interface FileData {
  slug: string;
  title: string;
  preview: string;
  category: Category;
  status: Status;
  filePath: string;
  createdAt: string | null;
  reviewedAt: string | null;
}

interface ReviewFiltersProps {
  files: FileData[];
}

const STATUS_VARIANT: Record<Status, "warning" | "success" | "destructive" | "info"> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
  "needs-improvement": "info",
};

const STATUS_LABELS: Record<Status, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  "needs-improvement": "Needs Improvement",
};

const CATEGORY_LABELS: Record<Category, string> = {
  "blog-tech": "Tech Articles",
  "blog-tcg": "TCG Articles",
  "blog-posts": "Blog Posts",
  "job-search": "Job Search",
  "linkedin": "LinkedIn",
  "style-guide": "Style Guide",
  "general": "General",
};

interface Section {
  key: string;
  label: string;
  categories: string[];
}

const SECTIONS: Section[] = [
  { key: "blog", label: "Blog Posts & Articles", categories: ["blog-tech", "blog-tcg", "blog-posts"] },
  { key: "linkedin", label: "Content to Post", categories: ["linkedin"] },
  { key: "job-search", label: "Job Search", categories: ["job-search"] },
  { key: "other", label: "Other", categories: ["style-guide", "general"] },
];

function getSection(category: string): string {
  for (const s of SECTIONS) {
    if (s.categories.includes(category)) return s.key;
  }
  return "other";
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 1) return `${Math.max(1, Math.round(diffMs / 60000))}m ago`;
  if (diffHours < 24) return `${Math.round(diffHours)}h ago`;
  if (diffHours < 48) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateShort(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function GridIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5h10" /><path d="M11 9h7" /><path d="M11 13h4" /><path d="m3 17 3 3 3-3" /><path d="M6 18V4" />
    </svg>
  );
}

export function ReviewFilters({ files }: ReviewFiltersProps) {
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [sortAsc, setSortAsc] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [sectionStatusFilter, setSectionStatusFilter] = useState<Record<string, string>>({});

  // Restore preferences and section states on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("review-view-mode");
      if (saved === "list" || saved === "card") setViewMode(saved);
      const savedSort = localStorage.getItem("review-sort-asc");
      if (savedSort) setSortAsc(savedSort === "true");
      
      // Restore collapsed state for each section from sessionStorage
      const restoredCollapsed: Record<string, boolean> = {};
      for (const section of SECTIONS) {
        const key = `review-section-${section.key}`;
        const savedState = sessionStorage.getItem(key);
        if (savedState !== null) {
          restoredCollapsed[section.key] = savedState === "true";
        }
      }
      if (Object.keys(restoredCollapsed).length > 0) {
        setCollapsed(restoredCollapsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("review-view-mode", viewMode); } catch {}
  }, [viewMode]);

  useEffect(() => {
    try { localStorage.setItem("review-sort-asc", String(sortAsc)); } catch {}
  }, [sortAsc]);

  const sortedFiles = [...files].sort((a, b) => {
    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return sortAsc ? da - db : db - da;
  });

  // Group into sections
  const grouped: Record<string, FileData[]> = {};
  for (const section of SECTIONS) {
    grouped[section.key] = [];
  }
  for (const file of sortedFiles) {
    const sKey = getSection(file.category);
    if (!grouped[sKey]) grouped[sKey] = [];
    grouped[sKey].push(file);
  }

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => {
      const newState = !prev[key];
      // Persist to sessionStorage
      try {
        sessionStorage.setItem(`review-section-${key}`, String(newState));
      } catch {}
      return { ...prev, [key]: newState };
    });
  };

  const getSectionStatusFilter = (key: string) => sectionStatusFilter[key] ?? "all";
  const setSectionStatus = (key: string, value: string) => {
    setSectionStatusFilter((prev) => ({ ...prev, [key]: value }));
  };

  const visibleSections = SECTIONS.filter((s) => (grouped[s.key] ?? []).length > 0);

  const totalShown = visibleSections.reduce((acc, s) => {
    const statusF = getSectionStatusFilter(s.key);
    const items = grouped[s.key] ?? [];
    return acc + (statusF === "all" ? items.length : items.filter((f) => f.status === statusF).length);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Toolbar - only sort and view toggle */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="text-sm text-muted-foreground">
          Showing {totalShown} of {files.length} items
        </div>

        <div className="flex-1" />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortAsc(!sortAsc)}
          className="gap-1.5"
        >
          <SortIcon />
          {sortAsc ? "Oldest first" : "Newest first"}
        </Button>

        <div className="flex border rounded-md overflow-hidden">
          <Button
            variant={viewMode === "card" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-none"
            onClick={() => setViewMode("card")}
            title="Card view"
          >
            <GridIcon />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-none"
            onClick={() => setViewMode("list")}
            title="List view"
          >
            <ListIcon />
          </Button>
        </div>
      </div>

      {/* Sections */}
      {visibleSections.map((section) => {
        const allItems = grouped[section.key] ?? [];
        const statusF = getSectionStatusFilter(section.key);
        const items = statusF === "all" ? allItems : allItems.filter((f) => f.status === statusF);
        const isCollapsed = collapsed[section.key] ?? false;

        return (
          <div key={section.key}>
            {/* Section header with inline status filter */}
            <div className="flex items-center gap-2 py-2">
              <button
                onClick={() => toggleCollapse(section.key)}
                className="flex items-center gap-2 group"
              >
                <ChevronDown open={!isCollapsed} />
                <h2 className="text-lg font-semibold">{section.label}</h2>
                <Badge variant="secondary" className="ml-1">{allItems.length}</Badge>
              </button>

              <div className="flex-1" />

              <Select value={statusF} onValueChange={(v) => setSectionStatus(section.key, v)}>
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <span className="text-muted-foreground mr-1">Status:</span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isCollapsed && items.length === 0 && (
              <p className="text-sm text-muted-foreground ml-7 mt-1">No items match this filter.</p>
            )}

            {!isCollapsed && items.length > 0 && (
              viewMode === "card" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                  {items.map((file) => (
                    <Link key={file.slug} href={`/review/${file.slug}`}>
                      <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                        <CardHeader className="py-4 px-4">
                          <CardTitle className="text-sm font-medium leading-snug line-clamp-2">
                            {file.title}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <Badge variant="secondary" className="text-[11px]">
                              {CATEGORY_LABELS[file.category]}
                            </Badge>
                            <Badge variant={STATUS_VARIANT[file.status]} className="text-[11px]">
                              {STATUS_LABELS[file.status]}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDateShort(file.createdAt)}
                          </p>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-2 border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-2 px-3 font-medium">Title</th>
                        <th className="text-left py-2 px-3 font-medium w-28">Category</th>
                        <th className="text-left py-2 px-3 font-medium w-32">Status</th>
                        <th className="text-left py-2 px-3 font-medium w-24">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((file) => (
                        <tr key={file.slug} className="border-b last:border-0 hover:bg-accent transition-colors">
                          <td className="py-2 px-3">
                            <Link href={`/review/${file.slug}`} className="hover:underline font-medium">
                              {file.title}
                            </Link>
                          </td>
                          <td className="py-2 px-3">
                            <Badge variant="secondary" className="text-[11px]">
                              {CATEGORY_LABELS[file.category]}
                            </Badge>
                          </td>
                          <td className="py-2 px-3">
                            <Badge variant={STATUS_VARIANT[file.status]} className="text-[11px]">
                              {STATUS_LABELS[file.status]}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-muted-foreground text-xs">
                            {formatDateShort(file.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        );
      })}

      {files.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No files to review.
        </div>
      )}
    </div>
  );
}
