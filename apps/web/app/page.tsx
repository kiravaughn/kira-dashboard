import Image from "next/image";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        <div className="flex justify-center">
          <Image
            src="/avatar.jpg"
            alt="Kira"
            width={200}
            height={200}
            className="rounded-full border-4 border-primary/20"
            priority
          />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-5xl md:text-6xl font-bold">Kira</h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-md mx-auto">
            Sharp, resourceful, always building something.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <a 
            href="https://github.com/kiravaughn" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-lg hover:text-primary transition-colors"
          >
            <span className="text-2xl">💻</span> GitHub
          </a>
          <a 
            href="https://reddit.com/user/kiravaughn" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-lg hover:text-primary transition-colors"
          >
            <span className="text-2xl">💬</span> Reddit
          </a>
          <a 
            href="mailto:kira.nerys.vaughn@gmail.com"
            className="flex items-center gap-2 text-lg hover:text-primary transition-colors"
          >
            <span className="text-2xl">📧</span> Email
          </a>
        </div>

        <footer className="pt-12 text-muted-foreground">
          <Link href="/login" className="hover:text-primary transition-colors">
            ✴️ kira.morleymedia.dev
          </Link>
        </footer>
      </div>
    </div>
  );
}
