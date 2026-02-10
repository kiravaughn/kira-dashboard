"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const isLandingPage = pathname === "/";
  const isBlogPage = pathname?.startsWith("/blog") || false;
  const isPublicPage = isLandingPage || isBlogPage;

  // Close menus on pathname change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Minimal nav for landing page - just "Blog" link in top right
  if (isLandingPage && !session) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-end">
            <Link href="/blog">
              <Button variant="ghost" size="sm">
                Blog
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  // Minimal nav for blog pages - "Home" and "Blog"
  if (isBlogPage && !session) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-lg font-semibold hover:text-primary transition-colors">
              Kira
            </Link>
            
            {/* Desktop nav */}
            <div className="hidden md:flex gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  Home
                </Button>
              </Link>
              <Link href="/blog">
                <Button variant="ghost" size="sm">
                  Blog
                </Button>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <div className="md:hidden" ref={mobileMenuRef}>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-accent rounded-md transition-colors"
                aria-label="Toggle menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

              {/* Mobile dropdown */}
              {mobileMenuOpen && (
                <div className="absolute right-4 top-16 w-48 bg-background border rounded-md shadow-lg py-2 z-50">
                  <Link href="/" className="block px-4 py-2 hover:bg-accent transition-colors">
                    Home
                  </Link>
                  <Link href="/blog" className="block px-4 py-2 hover:bg-accent transition-colors">
                    Blog
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Full nav for authenticated users or protected pages
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold">
              Kira's Dashboard
            </Link>
            
            {/* Desktop nav - Home and Blog only */}
            <div className="hidden md:flex gap-4">
              <Link href="/" className="text-sm hover:text-primary">
                Home
              </Link>
              <Link href="/blog" className="text-sm hover:text-primary">
                Blog
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <div className="md:hidden" ref={mobileMenuRef}>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-accent rounded-md transition-colors"
                aria-label="Toggle menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

              {/* Mobile dropdown */}
              {mobileMenuOpen && (
                <div className="absolute right-4 top-16 w-48 bg-background border rounded-md shadow-lg py-2 z-50">
                  <Link href="/" className="block px-4 py-2 hover:bg-accent transition-colors">
                    Home
                  </Link>
                  <Link href="/blog" className="block px-4 py-2 hover:bg-accent transition-colors">
                    Blog
                  </Link>
                </div>
              )}
            </div>

            {/* User avatar menu or Login button */}
            {session ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  aria-label="User menu"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="User avatar"
                      className="w-8 h-8 rounded-full border-2 border-primary"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                      {session.user?.email?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </button>

                {/* User dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-background border rounded-md shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                    </div>
                    <Link href="/dashboard" className="block px-4 py-2 hover:bg-accent transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/review" className="block px-4 py-2 hover:bg-accent transition-colors">
                      Review
                    </Link>
                    <Link href="/todos" className="block px-4 py-2 hover:bg-accent transition-colors">
                      Todos
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 hover:bg-accent transition-colors border-t"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
