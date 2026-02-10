"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in with your authorized Google account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error === "AccessDenied" && (
            <div className="bg-destructive/10 border border-destructive rounded-md p-3 text-sm text-destructive">
              Access denied. Only authorized emails can sign in.
            </div>
          )}
          {error === "OAuthAccountNotLinked" && (
            <div className="bg-destructive/10 border border-destructive rounded-md p-3 text-sm text-destructive">
              Another account with this email already exists.
            </div>
          )}
          <Button
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Loading..." : "Sign in with Google"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Sign in with an authorized Google account
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
