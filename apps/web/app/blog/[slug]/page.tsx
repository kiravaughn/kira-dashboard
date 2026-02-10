export const dynamic = 'force-dynamic';

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { isPostApproved } from "@/lib/review";

const CONTENT_DIR = process.env.CONTENT_DIR || "/home/kira/.openclaw/workspace/content/drafts";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

async function getPostData(slug: string) {
  try {
    // Check if post is approved
    const approved = await isPostApproved(slug);
    if (!approved) {
      return null;
    }

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
      date: data.date || null,
      category: data.category || "Uncategorized",
    };
  } catch (error) {
    console.error("Error reading blog post:", error);
    return null;
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostData(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      <header className="space-y-4 border-b pb-8">
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{post.category}</Badge>
          {post.date && (
            <time className="text-sm text-muted-foreground">
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
        </div>
        <h1 className="text-4xl font-bold">{post.title}</h1>
      </header>

      <div className="prose prose-invert prose-lg max-w-none">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostData(slug);
  
  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.content.substring(0, 160),
  };
}
