import fs from 'fs';
import path from 'path';
import { InteractiveDeck } from './InteractiveDeck';

export default function CreativeDeckPage() {
  const filePath = path.join(process.cwd(), 'docs', 'share-templates-creative-brief.md');
  let content = fs.readFileSync(filePath, 'utf-8');

  return (
    <main className="min-h-screen bg-background pb-32">
      <InteractiveDeck rawMarkdown={content} />
    </main>
  );
}
