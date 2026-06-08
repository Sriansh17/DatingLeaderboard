'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, ArrowLeft } from 'lucide-react';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function ContactPage() {
  const router = useRouter();
  
  const developers = [
    {
      name: "Sriansh Raj",
      role: "Creator & Developer",
      instagram: "https://instagram.com/sriansh._.raj",
      linkedin: "https://www.linkedin.com/in/sriansh-raj-8b9227228/",
      email: "mailto:rajritulrajrazi@gmail.com"
    },
    {
      name: "Rishabh Bassi",
      role: "Creator & Developer",
      instagram: "#",
      linkedin: "https://in.linkedin.com/in/rishabh-bassi-5981a9223",
      email: "mailto:rishabhb.career@gmail.com"
    }
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col pb-20">

      {/* Nav */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-lg italic text-gold flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Sparkles className="h-4 w-4" /> Fond
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => router.back()}
            className="rounded-full border border-border bg-elevated/40 px-4 py-1.5 text-xs text-foreground backdrop-blur hover:bg-elevated/60 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-4xl px-6 pt-12 sm:pt-20">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Get in Touch</p>
          <h1 className="font-display text-5xl md:text-6xl italic text-foreground tracking-tight">
            Meet the creators
          </h1>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Have a question, feedback, or just want to say hi? Reach out to the team behind Fond.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
          {developers.map((dev, i) => (
            <div 
              key={i} 
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all hover:border-gold/30 hover:shadow-glow"
            >
              {/* Decorative gradient orb */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-all group-hover:bg-primary/20" />
              
              <div className="relative z-10">
                <h2 className="font-display text-3xl text-foreground mb-1">{dev.name}</h2>
                <p className="text-sm uppercase tracking-widest text-gold mb-8">{dev.role}</p>

                <div className="space-y-4">
                  {dev.instagram !== "#" && (
                    <a 
                      href={dev.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 text-muted-foreground hover:text-primary transition-colors p-3 -mx-3 rounded-xl hover:bg-elevated"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-elevated border border-border">
                        <InstagramIcon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">Instagram</span>
                    </a>
                  )}

                  <a 
                    href={dev.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-muted-foreground hover:text-[#0a66c2] transition-colors p-3 -mx-3 rounded-xl hover:bg-elevated"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-elevated border border-border">
                      <LinkedinIcon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">LinkedIn</span>
                  </a>

                  <a 
                    href={dev.email}
                    className="flex items-center gap-4 text-muted-foreground hover:text-gold transition-colors p-3 -mx-3 rounded-xl hover:bg-elevated"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-elevated border border-border">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">Email</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-16 opacity-60">
          Built with <span className="text-primary">♥</span> — Fond
        </p>
      </main>
    </div>
  );
}
