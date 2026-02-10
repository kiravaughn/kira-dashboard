import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import ReviewClient from "./review-client";

const CONTENT_DIR = process.env.CONTENT_DIR || "/home/kira/.openclaw/workspace/content/drafts";

interface ReviewPageProps {
  params: Promise<{ slug: string }>;
}

async function getFileData(slug: string) {
  try {
    const filePath = path.join(CONTENT_DIR, `${slug}.md`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContent);

    // Extract title
    let title = data.title;
    if (!title) {
      const titleMatch = content.match(/^#\s+(.+)$/m);
      title = titleMatch ? titleMatch[1] : slug;
    }

    return {
      title,
      content,
      category: data.category || "general",
    };
  } catch (error) {
    console.error("Error reading file:", error);
    return null;
  }
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { slug } = await params;
  const fileData = await getFileData(slug);

  if (!fileData) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{fileData.title}</h1>
        <p className="text-muted-foreground">Review and provide feedback</p>
      </div>

      <ReviewClient 
        slug={slug} 
        filePath={path.join(CONTENT_DIR, `${slug}.md`)}
        content={fileData.content} 
        category={fileData.category}
      />
    </div>
  );
}
