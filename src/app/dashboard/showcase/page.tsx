import { StoryCard } from "@/components/ui/StoryCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ShowcasePage() {
  const dummyStory = {
    id: `variant-test`,
    username: '@jessica_m',
    partnerNickname: 'Alex',
    city: 'New York',
    headline: 'He remembered I casually mentioned a specific obscure book a month ago and tracked down a first edition for my birthday.',
    score: 9.8,
    verdict: 'Extremely high thoughtfulness. Requires active listening and delayed execution. 9.8/10.',
    reactions: { heart: 0, fire: 0, laugh: 0, trophy: 0 },
    believable: 0,
    sus: 0,
    postedAt: 'Just now'
  } as any;

  const dummyStory2 = {
    ...dummyStory,
    username: '@Sriansh',
    partnerNickname: 'Meow',
    city: 'Bangalore',
    postedAt: '07/06/2026',
    headline: 'she cooked chicken and roti for me with salad and my...',
    score: 6.9,
    verdict: 'A home-cooked meal is the...'
  };

  const dummyStory3 = {
    ...dummyStory,
    username: '@Sriansh',
    partnerNickname: 'Meow',
    city: 'Banglore',
    postedAt: '06/06/2026',
    headline: 'she bought a bouquet for me aft...',
    score: 5.0,
    verdict: 'Your partner did something wonderful! ❤️'
  };

  return (
    <main className="w-full min-h-dvh bg-transparent py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/dashboard"
          className="mb-8 rounded-full glass-btn px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
        
        <header className="mb-16 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-primary mb-4 font-bold">Design Prototypes</p>
          <h1 className="font-display text-5xl md:text-6xl italic text-foreground mb-4">Story Card Showcase</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Testing different visual treatments for the core feed unit. 
            These cards explore frosted glass, sharp editorial lines, and absolute minimalism.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 max-w-6xl mx-auto pb-12">
          
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h3 className="text-xs uppercase tracking-[0.2em] text-primary mb-1 font-bold">Concept 2</h3>
              <h2 className="font-display italic text-3xl text-foreground">Frosted Glass</h2>
              <p className="text-sm text-muted-foreground mt-2">Translucent, blurred backgrounds letting the ambient global gradient shine through.</p>
            </div>
            <StoryCard variant="B" story={dummyStory} />
          </div>

          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h3 className="text-xs uppercase tracking-[0.2em] text-red-500 mb-1 font-bold">Concept 3</h3>
              <h2 className="font-display italic text-3xl text-foreground">Hybrid Variant</h2>
              <p className="text-sm text-muted-foreground mt-2">Deep contrast, large golden score ring, extremely clean editorial typography.</p>
            </div>
            <StoryCard variant="C" story={dummyStory2} />
          </div>

          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 font-bold">Concept 4</h3>
              <h2 className="font-display italic text-3xl text-foreground">Luxury Paper</h2>
              <p className="text-sm text-muted-foreground mt-2">Print-design inspired. Completely flat, pure typography, sharp borders.</p>
            </div>
            <StoryCard variant="D" story={dummyStory} />
          </div>

          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h3 className="text-xs uppercase tracking-[0.2em] text-blue-400 mb-1 font-bold">Concept 5</h3>
              <h2 className="font-display italic text-3xl text-foreground">The Classic</h2>
              <p className="text-sm text-muted-foreground mt-2">Dark mode, user avatars, focus on clean typography and quotes.</p>
            </div>
            <StoryCard variant={"G" as any} story={dummyStory3} />
          </div>

        </div>
      </div>
    </main>
  );
}
