'use client';

import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useUser } from '@/components/providers/AuthProvider';
import { Share2 } from 'lucide-react';
import { tierForScore, TIER_MAP, scoreColor } from '@/lib/mock-data';
import type { Post } from '@/types/database';

interface ShareCardProps {
  post: Post;
  rank?: number;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let lineY = y;
  for (const word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line.trim(), x, lineY);
      line = word + ' ';
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, lineY);
  return lineY + lineHeight;
}

export function ShareCard({ post, rank }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { addToast } = useToast();
  const { profile } = useUser();

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const w = canvas.width;  // 540
    const h = canvas.height; // 960
    const pad = 40;

    // ── Background: Fond "After Midnight" velvet gradient ──
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#1E1017');
    bg.addColorStop(0.35, '#160C12');
    bg.addColorStop(0.65, '#281620');
    bg.addColorStop(1, '#160C12');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Ambient orbs — rose glow (top left) and gold glow (bottom right)
    ctx.globalAlpha = 0.1;
    const orb1 = ctx.createRadialGradient(w * 0.15, h * 0.08, 0, w * 0.15, h * 0.08, w * 0.55);
    orb1.addColorStop(0, '#EE6A8C');
    orb1.addColorStop(1, 'transparent');
    ctx.fillStyle = orb1;
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 0.07;
    const orb2 = ctx.createRadialGradient(w * 0.85, h * 0.72, 0, w * 0.85, h * 0.72, w * 0.5);
    orb2.addColorStop(0, '#DCBE78');
    orb2.addColorStop(1, 'transparent');
    ctx.fillStyle = orb2;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    // ── Header: Fond brand mark ──
    ctx.fillStyle = '#DCBE78';
    ctx.font = 'bold 13px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('✦ Fond', pad, pad + 14);

    ctx.fillStyle = 'rgba(180,160,168,0.5)';
    ctx.font = '9px "DM Sans", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Verdict Nº ${Math.floor((post.ai_score || 50) * 137) % 9999}`, w - pad, pad + 14);

    // ── Score circle — centered, dramatic ──
    const score = post.ai_score || 0;
    const sColorRGB = scoreColor(score);
    const scoreCY = 300;

    // Outer glow
    ctx.shadowColor = sColorRGB;
    ctx.shadowBlur = 50;
    ctx.beginPath();
    ctx.arc(w / 2, scoreCY, 90, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Dark score circle bg
    ctx.beginPath();
    ctx.arc(w / 2, scoreCY, 74, 0, Math.PI * 2);
    ctx.fillStyle = '#281620';
    ctx.fill();
    ctx.strokeStyle = sColorRGB;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Score number — big, bold
    ctx.fillStyle = sColorRGB;
    ctx.font = 'bold 90px "Bebas Neue", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(score), w / 2, scoreCY - 6);

    // "/ 100"
    ctx.fillStyle = 'rgba(180,160,168,0.7)';
    ctx.font = '14px "DM Sans", system-ui, sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('/ 100', w / 2, scoreCY + 52);

    // ── Tier badge ──
    const tierInfo = TIER_MAP[tierForScore(score)];
    const badgeY = scoreCY + 120;
    const badgeW = 240;
    const badgeH = 44;
    const badgeX = (w - badgeW) / 2;

    // Badge bg
    ctx.fillStyle = 'rgba(220,190,120,0.12)';
    ctx.strokeStyle = 'rgba(220,190,120,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 22);
    ctx.fill();
    ctx.stroke();

    // Tier name — centered in badge
    ctx.fillStyle = '#FAF5F3';
    ctx.font = 'bold 16px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${tierInfo.emoji}  ${tierInfo.name}`, w / 2, badgeY + badgeH / 2);
    ctx.textBaseline = 'alphabetic';

    // ── Verdict quote ──
    const verdictY = badgeY + 80;
    ctx.fillStyle = 'rgba(250,245,243,0.9)';
    ctx.font = 'italic 17px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    const quoteY = wrapText(ctx, `“${post.ai_feedback || 'A gesture worth recording.'}”`, w / 2, verdictY, w - pad * 2 - 20, 30);

    // ── Score progress bar ──
    const barY = quoteY + 45;
    const barW = w - pad * 2;
    const barH = 6;
    const barX = pad;

    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 3);
    ctx.fill();

    const fillW = Math.max((score / 100) * barW, 8);
    const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    barGrad.addColorStop(0, '#EE6A8C');
    barGrad.addColorStop(0.5, '#DCBE78');
    barGrad.addColorStop(1, '#EE6A8C');
    ctx.fillStyle = barGrad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, fillW, barH, 3);
    ctx.fill();

    // ── Attribution line ──
    const attrY = barY + 40;
    const username = post.profile?.username || 'you';
    const partnerName = post.partner?.name || 'someone';

    ctx.fillStyle = 'rgba(250,245,243,0.8)';
    ctx.font = '14px "DM Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`@${username}  ×  ${post.partner?.emoji || '❤️'} ${partnerName}`, w / 2, attrY);

    // City / rank
    const city = profile?.city;
    if (city || rank) {
      ctx.fillStyle = 'rgba(180,160,168,0.75)';
      ctx.font = '11px "DM Sans", system-ui, sans-serif';
      const rankText = rank ? `Ranked #${rank}${city ? ` in ${city}` : ''}` : city || '';
      ctx.fillText(rankText, w / 2, attrY + 24);
    }

    // ── Bottom brand ──
    ctx.fillStyle = 'rgba(180,160,168,0.3)';
    ctx.font = '12px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ Fond — Your Relationship Has a Score', w / 2, h - pad);

    // Subtle gradient overlay at bottom
    const overlay = ctx.createLinearGradient(0, h - 140, 0, h);
    overlay.addColorStop(0, 'transparent');
    overlay.addColorStop(1, 'rgba(22,12,18,0.6)');
    ctx.fillStyle = overlay;
    ctx.fillRect(0, h - 140, w, 140);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  }, [post, rank, profile]);

  const handleShare = async () => {
    const blob = await generateImage();
    if (!blob) {
      addToast('Could not generate image', 'error');
      return;
    }

    const file = new File([blob], `fond-${post.ai_score || 'score'}.png`, {
      type: 'image/png',
    });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'My Fond Verdict',
          text: `My partner scored ${post.ai_score || 0}/100 on Fond! ✨`,
          files: [file],
        });
      } catch {
        // User cancelled
      }
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fond-${post.ai_score || 'score'}.png`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Saved! Share it on Instagram Stories 📸', 'success');
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={540}
        height={960}
        style={{ display: 'none' }}
      />

      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 text-primary px-5 py-2.5 text-sm font-semibold hover:bg-primary/10 hover:border-primary/40 transition-all"
      >
        <Share2 className="h-4 w-4" />
        Share Score Card
      </button>
    </>
  );
}
