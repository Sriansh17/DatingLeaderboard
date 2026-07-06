'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, X, Menu } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ─── PARSED STRUCTURE ───

interface TemplateEntry {
  number: string;
  name: string;
  content: string;
  raw: string;
}

interface Section {
  heading: string;
  content: string;
  templates: TemplateEntry[];
  isPart: boolean;
  partNumber?: number;
  partLabel?: string;
}

function parseMarkdown(md: string): { sections: Section[] } {
  const lines = md.split('\n');
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let currentTemplate: TemplateEntry | null = null;
  let i = 0;

  while (i < lines.length && !lines[i].startsWith('## ')) i++;

  for (; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('## ') && !line.startsWith('### ')) {
      if (currentTemplate && currentSection) { currentSection.templates.push(currentTemplate); currentTemplate = null; }
      if (currentSection) sections.push(currentSection);
      const heading = line.replace(/^## /, '').trim();
      const isPart = heading.startsWith('PART ');
      let partNumber: number | undefined;
      let partLabel: string | undefined;
      if (isPart) {
        const match = heading.match(/PART (\d+):\s*(.+)/);
        if (match) { partNumber = parseInt(match[1]); partLabel = match[2].trim(); }
      }
      currentSection = { heading, content: '', templates: [], isPart, partNumber, partLabel };
    } else if (line.startsWith('### ') && currentSection) {
      if (currentTemplate) currentSection.templates.push(currentTemplate);
      const rest = line.replace(/^### /, '').trim();
      const match = rest.match(/^(\d+)\.\s*(.+)/);
      currentTemplate = { number: match ? match[1] : '', name: match ? match[2].trim() : rest, content: '', raw: line + '\n' };
    } else if (currentTemplate) {
      currentTemplate.raw += line + '\n';
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }

  if (currentTemplate && currentSection) currentSection.templates.push(currentTemplate);
  if (currentSection) sections.push(currentSection);
  return { sections };
}

// ─── STYLED MARKDOWN RENDERER ───

const markdownComponents = {
  h1: ({ children }: any) => <h1 className="font-display italic text-2xl sm:text-3xl text-foreground mt-8 mb-4 leading-tight">{children}</h1>,
  h2: ({ children }: any) => <h2 className="font-display italic text-xl sm:text-2xl text-foreground mt-6 mb-3 leading-tight">{children}</h2>,
  h3: ({ children }: any) => <h3 className="font-display italic text-lg sm:text-xl text-foreground mt-5 mb-2 leading-tight">{children}</h3>,
  h4: ({ children }: any) => <h4 className="font-sans text-sm font-bold text-gold uppercase tracking-[0.2em] mt-6 mb-2">{children}</h4>,
  p: ({ children }: any) => <p className="text-sm sm:text-base text-foreground/80 leading-[1.75] mb-3">{children}</p>,
  ul: ({ children }: any) => <ul className="space-y-1 mb-4 ml-5 list-disc marker:text-muted-foreground/30">{children}</ul>,
  ol: ({ children }: any) => <ol className="space-y-1 mb-4 ml-5 list-decimal marker:text-muted-foreground/30">{children}</ol>,
  li: ({ children }: any) => <li className="text-sm text-foreground/70 leading-relaxed pl-1">{children}</li>,
  strong: ({ children }: any) => <strong className="font-bold text-foreground">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-foreground/90">{children}</em>,
  blockquote: ({ children }: any) => <blockquote className="border-l-2 border-gold/40 pl-4 py-2 my-4 bg-gold/[0.03] rounded-r-xl text-sm italic text-muted-foreground leading-relaxed">{children}</blockquote>,
  hr: () => <hr className="border-border my-6" />,
  code: ({ children, className }: any) => {
    if (!className) return <code className="px-1.5 py-0.5 rounded-md bg-muted text-foreground text-xs font-mono">{children}</code>;
    return <pre className="bg-muted rounded-xl p-4 overflow-x-auto my-4 border border-border"><code className="text-xs font-mono text-foreground/80 leading-relaxed">{children}</code></pre>;
  },
};

// ─── SIDEBAR ───

function TocSidebar({ sections, activeSection, onSectionClick, open, onClose }: {
  sections: Section[]; activeSection: number; onSectionClick: (i: number) => void; open: boolean; onClose: () => void;
}) {
  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 space-y-1">
          <div className="text-[9px] uppercase tracking-[0.25em] font-bold text-gold mb-3">Contents</div>
          {sections.map((s, i) => (
            <button key={i} onClick={() => onSectionClick(i)}
              className={`w-full text-left text-xs py-1.5 px-3 rounded-lg transition-all ${activeSection === i ? 'glass-btn text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
            >
              <span className="block truncate">{s.isPart ? `Part ${s.partNumber}` : s.heading}</span>
              {s.isPart && s.partLabel && <span className="block text-[9px] text-muted-foreground/60 truncate">{s.partLabel}</span>}
            </button>
          ))}
        </div>
      </aside>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r border-border p-5 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-gold">Contents</span>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              {sections.map((s, i) => (
                <button key={i} onClick={() => { onSectionClick(i); onClose(); }}
                  className={`w-full text-left text-xs py-2 px-3 rounded-lg transition-all mb-0.5 ${activeSection === i ? 'glass-btn text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                >
                  <div className="truncate">{s.isPart ? `Part ${s.partNumber}: ${s.partLabel}` : s.heading}</div>
                  <div className="text-[9px] text-muted-foreground/50">{s.templates.length} templates</div>
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── TEMPLATE RENDERER ───

function TemplateEntryBlock({ template, searchQuery }: { template: TemplateEntry; searchQuery: string }) {
  const nameLower = template.name.toLowerCase();
  const rawLower = template.raw.toLowerCase();
  const queryLower = searchQuery.toLowerCase();
  const matchesSearch = !searchQuery.trim() || nameLower.includes(queryLower) || rawLower.includes(queryLower);
  if (!matchesSearch) return null;

  return (
    <div className="mb-8 last:mb-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {template.raw}
      </ReactMarkdown>
    </div>
  );
}

// ─── MAIN ───

export function InteractiveDeck({ rawMarkdown }: { rawMarkdown: string }) {
  const { sections } = useMemo(() => parseMarkdown(rawMarkdown), [rawMarkdown]);
  const [activeSection, setActiveSection] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (sections.length > 3 && sectionRefs.current[3]) {
      setTimeout(() => sectionRefs.current[3]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }, []);

  const visibleSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter(s =>
      s.heading.toLowerCase().includes(q) ||
      (s.partLabel?.toLowerCase().includes(q)) ||
      s.templates.some(t => t.name.toLowerCase().includes(q) || t.raw.toLowerCase().includes(q))
    );
  }, [sections, searchQuery]);

  const totalTemplates = sections.reduce((sum, s) => sum + s.templates.length, 0);
  const filteredCount = visibleSections.reduce((sum, s) => sum + s.templates.length, 0);
  const partSections = sections.filter(s => s.isPart);

  const scrollToSection = (index: number) => {
    setActiveSection(index);
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(209,47,88,0.03),transparent)]" />
        <div className="max-w-6xl mx-auto px-5 pt-10 pb-8 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-gold">Creative Director's Deck</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display italic text-4xl sm:text-5xl text-foreground leading-tight">Share Templates</h1>
              <p className="text-muted-foreground text-sm mt-2 max-w-xl leading-relaxed">
                <strong className="text-foreground">{totalTemplates}</strong> total concepts across <strong className="text-foreground">{partSections.length}</strong> categories
              </p>
            </div>
            <Link href="/share-templates-preview" className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full glass-btn text-xs font-semibold whitespace-nowrap shrink-0">
              View Gallery →
            </Link>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input type="text" placeholder="Search templates..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-full border border-border bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground" />
                </button>
              )}
            </div>
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-full border border-border bg-muted/50 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="w-3.5 h-3.5" />
            </button>
            <Link href="/share-templates-preview" className="sm:hidden flex items-center gap-1.5 px-4 py-2.5 rounded-full glass-btn text-xs font-semibold">
              Gallery
            </Link>
          </div>
          {searchQuery && (
            <div className="mt-3 text-xs text-muted-foreground">
              Found <span className="text-foreground font-semibold">{filteredCount}</span> matching templates
              in <span className="text-foreground font-semibold">{visibleSections.length}</span> sections
            </div>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-8 flex gap-8 relative">
        <TocSidebar sections={sections} activeSection={activeSection} onSectionClick={scrollToSection} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 min-w-0 max-w-3xl">
          {visibleSections.map((section, idx) => {
            const actualIdx = sections.indexOf(section);
            return (
              <div key={actualIdx} ref={(el) => { sectionRefs.current[actualIdx] = el; }} className="scroll-mt-24 mb-14 last:mb-0">
                {section.isPart && section.partNumber && (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full glass-btn-gold flex items-center justify-center shrink-0">
                      <span className="font-score text-sm text-gold">{section.partNumber}</span>
                    </div>
                    <div>
                      <h2 className="font-display italic text-2xl sm:text-3xl text-foreground">
                        {section.isPart ? `Part ${section.partNumber}: ${section.partLabel}` : section.heading}
                      </h2>
                      {section.templates.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">{section.templates.length} template{section.templates.length !== 1 ? 's' : ''}</p>
                      )}
                    </div>
                  </div>
                )}

                {!section.isPart && section.content.trim() && (
                  <div className="mb-6">
                    <h2 className="font-display italic text-2xl sm:text-3xl text-foreground mb-4">{section.heading}</h2>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {section.content.trim()}
                    </ReactMarkdown>
                  </div>
                )}

                {section.templates.map((t, ti) => (
                  <TemplateEntryBlock key={ti} template={t} searchQuery={searchQuery} />
                ))}
              </div>
            );
          })}

          {visibleSections.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="font-display italic text-lg text-foreground mb-1">No templates found</h3>
              <p className="text-sm text-muted-foreground">Try a different search term</p>
              <button onClick={() => setSearchQuery('')} className="mt-4 px-4 py-2 rounded-full glass-btn text-xs font-semibold">Clear search</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
