'use client';

import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useUser } from '@/components/providers/AuthProvider';
import { Share2, Sparkles } from 'lucide-react';
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
    const pad = 36;

    // ── Background: Rich velvet gradient ──
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#1E1017');
    bg.addColorStop(0.3, '#160C12');
    bg.addColorStop(0.6, '#281620');
    bg.addColorStop(1, '#160C12');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // ── Ambient glow orbs ──
    ctx.globalAlpha = 0.12;
    const orb1 = ctx.createRadialGradient(w * 0.15, h * 0.05, 0, w * 0.15, h * 0.05, w * 0.6);
    orb1.addColorStop(0, '#EE6A8C');
    orb1.addColorStop(1, 'transparent');
    ctx.fillStyle = orb1;
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 0.08;
    const orb2 = ctx.createRadialGradient(w * 0.85, h * 0.75, 0, w * 0.85, h * 0.75, w * 0.5);
    orb2.addColorStop(0, '#DCBE78');
    orb2.addColorStop(1, 'transparent');
    ctx.fillStyle = orb2;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    // ── Top bar: Fond brand + verdict number ──
    ctx.fillStyle = '#DCBE78';
    ctx.font = 'bold 14px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('✦ Fond', pad, pad + 14);

    ctx.fillStyle = 'rgba(180,160,168,0.4)';
    ctx.font = '9px "DM Sans", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Verdict Nº ${Math.floor((post.ai_score || 50) * 137) % 9999}`, w - pad, pad + 14);

    // ── Divider line ──
    ctx.strokeStyle = 'rgba(220,190,120,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad + 28);
    ctx.lineTo(w - pad, pad + 28);
    ctx.stroke();

    // ── Score with dramatic glow ──
    const score = post.ai_score || 0;
    const sColor = scoreColor(score);
    const scoreCY = 280;

    // Outer glow ring
    ctx.shadowColor = sColor;
    ctx.shadowBlur = 60;
    ctx.beginPath();
    ctx.arc(w / 2, scoreCY, 86, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Score circle
    ctx.beginPath();
    ctx.arc(w / 2, scoreCY, 72, 0, Math.PI * 2);
    ctx.fillStyle = '#281620';
    ctx.fill();
    ctx.strokeStyle = sColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Score number
    ctx.fillStyle = sColor;
    ctx.font = 'bold 88px "Bebas Neue", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(score), w / 2, scoreCY - 4);

    // "/ 100" label
    ctx.fillStyle = 'rgba(180,160,168,0.6)';
    ctx.font = '13px "DM Sans", system-ui, sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('/ 100', w / 2, scoreCY + 50);

    // ── Tier badge ──
    const tierInfo = TIER_MAP[tierForScore(score)];
    const badgeY = scoreCY + 110;
    const badgeW = 260;
    const badgeH = 42;
    const badgeX = (w - badgeW) / 2;

    ctx.fillStyle = 'rgba(220,190,120,0.1)';
    ctx.strokeStyle = 'rgba(220,190,120,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 21);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FAF5F3';
    ctx.font = 'bold 16px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${tierInfo.emoji}  ${tierInfo.name}`, w / 2, badgeY + badgeH / 2);
    ctx.textBaseline = 'alphabetic';

    // ── Verdict quote ──
    const quoteY = badgeY + 72;
    ctx.fillStyle = 'rgba(250,245,243,0.92)';
    ctx.font = 'italic 18px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    const endQuoteY = wrapText(ctx, `"${post.ai_feedback || 'A gesture worth recording.'}"`, w / 2, quoteY, w - pad * 2 - 16, 32);

    // ── Score progress bar ──
    const barY = endQuoteY + 36;
    const barW = w - pad * 2;
    const barH = 5;
    const barX = pad;

    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 2.5);
    ctx.fill();

    const fillW = Math.max((score / 100) * barW, 8);
    const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    barGrad.addColorStop(0, '#EE6A8C');
    barGrad.addColorStop(0.5, '#DCBE78');
    barGrad.addColorStop(1, '#EE6A8C');
    ctx.fillStyle = barGrad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, fillW, barH, 2.5);
    ctx.fill();

    // ── Attribution ──
    const attrY = barY + 42;
    const username = post.profile?.username || 'someone';
    const partnerName = post.partner?.name || 'their partner';

    ctx.fillStyle = 'rgba(250,245,243,0.85)';
    ctx.font = '15px "DM Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`@${username}  ×  ${post.partner?.emoji || '❤️'} ${partnerName}`, w / 2, attrY);

    // City / rank line
    const city = post.post_city || profile?.city;
    if (city || rank) {
      ctx.fillStyle = 'rgba(180,160,168,0.7)';
      ctx.font = '11px "DM Sans", system-ui, sans-serif';
      const parts = [];
      if (rank) parts.push(`Ranked #${rank} Globally`);
      if (city) parts.push(city);
      ctx.fillText(parts.join(' · '), w / 2, attrY + 26);
    }

    // ── CTA bar at bottom ──
    const ctaY = h - 68;
    ctx.fillStyle = 'rgba(220,190,120,0.12)';
    ctx.strokeStyle = 'rgba(220,190,120,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(pad + 20, ctaY, w - pad * 2 - 40, 36, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#DCBE78';
    ctx.font = 'bold 13px "DM Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦  Your Relationship Has a Score  ✦', w / 2, ctaY + 18);
    ctx.textBaseline = 'alphabetic';

    // ── Bottom gradient overlay ──
    const overlay = ctx.createLinearGradient(0, h - 100, 0, h);
    overlay.addColorStop(0, 'transparent');
    overlay.addColorStop(1, 'rgba(22,12,18,0.4)');
    ctx.fillStyle = overlay;
    ctx.fillRect(0, h - 100, w, 100);

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
        className="flex items-center justify-center gap-2 rounded-full glass-btn px-6 py-3 text-sm font-semibold shadow-[var(--shadow-glow)] hover:opacity-90 active:opacity-80 transition-all"
      >
        <Sparkles className="h-4 w-4" />
        Share Score Card
      </button>
    </>
  );
}
