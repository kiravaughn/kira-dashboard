export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { ReviewFilters } from "@/components/review-filters";

const CONTENT_DIR = process.env.CONTENT_DIR || "/home/kira/.openclaw/workspace/content/drafts";

type Status = "pending" | "approved" | "rejected" | "needs-improvement";

interface FileData {
  slug: string;
  title: string;
  preview: string;
  category: string;
  subcategory: string;
  status: Status;
  filePath: string;
  createdAt: string | null;
  reviewedAt: string | null;
}

async function getContentFiles(): Promise<FileData[]> {
  try {
    // Read files from disk
    const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
    
    // Fetch all review metadata from database
    const reviews = await prisma.contentReview.findMany();
    const reviewMap = new Map(reviews.map((r) => [r.filePath, r]));

    const fileData: FileData[] = [];

    for (const file of files) {
      const filePath = path.join(CONTENT_DIR, file);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContent);

      // Extract title
      let title = data.title;
      if (!title) {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        title = titleMatch ? titleMatch[1] : file.replace(".md", "");
      }

      // Extract preview
      let preview = "";
      const paragraphs = content.split(/\n\n+/);
      for (const para of paragraphs) {
        if (para.trim() && !para.startsWith("#") && !para.startsWith("```")) {
          preview = para.trim().substring(0, 150);
          if (para.trim().length > 150) preview += "...";
          break;
        }
      }

      // Get review metadata from database
      const review = reviewMap.get(filePath);
      
      // Determine category and subcategory (DB takes priority, then frontmatter, then filename heuristics)
      let category = "general";
      let subcategory = "general";
      
      if (review?.category) {
        category = review.category;
        subcategory = review.subcategory || "general";
      } else if (data.category) {
        category = data.category;
        subcategory = data.subcategory || "general";
      } else {
        // Fallback to filename heuristics
        const tcgKeywords = ["riftbound", "pokemon", "magic", "onepiece", "tcg", "deck", "mtg", "yugioh", "lorcana"];
        const techKeywords = ["nextjs", "react", "typescript", "prisma", "stripe", "api", "docker", "node", "deploy", "ci-cd", "ai-", "server-components"];
        const lowerFile = file.toLowerCase();
        if (tcgKeywords.some(k => lowerFile.includes(k))) {
          category = "blog";
          subcategory = "tcg";
        } else if (techKeywords.some(k => lowerFile.includes(k))) {
          category = "blog";
          subcategory = "tech";
        } else if (file.includes("blog") || file.includes("post")) {
          category = "blog";
          subcategory = "tech";
        } else if (file.includes("job") || file.includes("resume")) {
          category = "job-search";
          subcategory = "general";
        } else if (file.includes("linkedin")) {
          category = "content";
          subcategory = "linkedin";
        } else if (file.includes("style")) {
          category = "reference";
          subcategory = "style-guide";
        }
      }

      // Get status from DB (default to pending if not in DB)
      const status: Status = (review?.status as Status) || "pending";

      fileData.push({
        slug: file.replace(".md", ""),
        title,
        preview,
        category,
        subcategory,
        status,
        filePath,
        createdAt: review?.createdAt?.toISOString() ?? null,
        reviewedAt: review?.reviewedAt?.toISOString() ?? null,
      });
    }

    return fileData;
  } catch (error) {
    console.error("Error reading content files:", error);
    return [];
  }
}

export default async function ReviewPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const files = await getContentFiles();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Content Review</h1>
        <p className="text-muted-foreground">
          Review and manage draft content
        </p>
      </div>

      <ReviewFilters files={files} />
    </div>
  );
}
