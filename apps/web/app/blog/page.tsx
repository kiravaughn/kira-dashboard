export const dynamic = 'force-dynamic';

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getApprovedPosts } from "@/lib/review";

const CONTENT_DIR = process.env.CONTENT_DIR || "/home/kira/.openclaw/workspace/content/drafts";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string | null;
  category: string;
}

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    // Get approved posts from the API
    const approvedSlugs = await getApprovedPosts();
    
    if (approvedSlugs.size === 0) {
      return [];
    }

    const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
    const posts: BlogPost[] = [];

    for (const file of files) {
      const slug = file.replace(".md", "");
      
      // Skip if not approved
      if (!approvedSlugs.has(slug)) {
        continue;
      }

      const filePath = path.join(CONTENT_DIR, file);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContent);

      // Extract title
      let title = data.title;
      if (!title) {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        title = titleMatch ? titleMatch[1] : slug;
      }

      // Extract excerpt
      let excerpt = data.excerpt || "";
      if (!excerpt) {
        const paragraphs = content.split(/\n\n+/);
        for (const para of paragraphs) {
          if (para.trim() && !para.startsWith("#") && !para.startsWith("```")) {
            excerpt = para.trim().substring(0, 200);
            if (para.trim().length > 200) excerpt += "...";
            break;
          }
        }
      }

      posts.push({
        slug,
        title,
        excerpt,
        date: data.date || null,
        category: data.category || "Uncategorized",
      });
    }

    // Sort by date (newest first)
    posts.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    return posts;
  } catch (error) {
    console.error("Error reading blog posts:", error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="text-muted-foreground">
          Thoughts, ideas, and explorations
        </p>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground text-lg">
              No articles published yet
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back soon for new content
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle>{post.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {post.excerpt}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                </CardHeader>
                {post.date && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
