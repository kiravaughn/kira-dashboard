import { prisma } from "@/lib/db";

export interface ContentReview {
  id: number;
  filePath: string;
  category: string;
  status: string;
  notes: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getApprovedPosts(): Promise<Set<string>> {
  try {
    const reviews = await prisma.contentReview.findMany({
      where: { status: "approved", blog: true },
      select: { filePath: true },
    });

    const approvedSlugs = new Set<string>();
    for (const review of reviews) {
      // Extract slug from any format: full path, relative path, with or without .md
      const fp = review.filePath;
      const basename = fp.split("/").pop() || fp;
      const slug = basename.replace(/\.md$/, "");
      if (slug) {
        approvedSlugs.add(slug);
      }
    }

    return approvedSlugs;
  } catch (error) {
    console.error("Error fetching approved posts:", error);
    return new Set();
  }
}

export async function isPostApproved(slug: string): Promise<boolean> {
  try {
    const review = await prisma.contentReview.findFirst({
      where: {
        OR: [
          { filePath: { endsWith: `/${slug}.md` } },
          { filePath: { endsWith: `/${slug}` } },
        ],
        status: "approved",
      },
    });
    return !!review;
  } catch (error) {
    console.error("Error checking post approval:", error);
    return false;
  }
}
