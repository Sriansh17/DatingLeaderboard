'use client';

import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useUser } from '@/components/providers/AuthProvider';
import { Share2 } from 'lucide-react';
import type { Post } from '@/types/database';

interface ShareCardProps {
  post: Post;
  rank?: number;
}

const TIERS = [
  { min: 90, label: 'Legendary', emoji: '👑', color: '#f59e0b' },
  { min: 80, label: 'Amazing', emoji: '💎', color: '#06b6d4' },
  { min: 70, label: 'Great', emoji: '⭐', color: '#8b5cf6' },
  { min: 60, label: 'Sweet', emoji: '💕', color: '#ec4899' },
  { min: 50, label: 'Nice', emoji: '😊', color: '#22c55e' },
  { min: 0, label: 'Cute', emoji: '🌱', color: '#a855f7' },
];

function getTier(score: number) {
  return TIERS.find((t) => score >= t.min) || TIERS[TIERS.length - 1];
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

    // ── Background ──
    const gradient = ctx.createLinearGradient(0, 0, w * 0.3, h);
    gradient.addColorStop(0, '#be185d');
    gradient.addColorStop(0.3, '#e11d48');
    gradient.addColorStop(0.6, '#f43f5e');
    gradient.addColorStop(1, '#7c3aed');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Decorative blobs
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(w * 0.85, h * 0.12, 160, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * 0.1, h * 0.75, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * 0.9, h * 0.85, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // ── Subtle watermark top-right ──
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('LoveBoard', w - 20, 30);
    ctx.restore();

    // ── Funny AI Quip (front and centre) ──
    const quip = post.ai_feedback || 'Love is in the air! 🫶';
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'italic 18px sans-serif';
    ctx.textAlign = 'center';
    const quipY = wrapText(ctx, `"${quip}"`, w / 2, 80, 380, 28);

    // ── Partner name ──
    if (post.partner) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '15px sans-serif';
      ctx.fillText('— for', w / 2, quipY + 10);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`${post.partner.emoji} ${post.partner.name}`, w / 2, quipY + 50);
    }

    // ── Score ──
    const score = post.ai_score || 0;
    const tier = getTier(score);
    const scoreCY = quipY + 150;

    // Glow ring
    ctx.shadowColor = 'rgba(255,255,255,0.25)';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(w / 2, scoreCY, 95, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Score circle
    ctx.beginPath();
    ctx.arc(w / 2, scoreCY, 80, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Score number
    ctx.fillStyle = '#be185d';
    ctx.font = 'bold 72px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(score), w / 2, scoreCY + 25);

    // "/100"
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '16px sans-serif';
    ctx.fillText('/ 100', w / 2, scoreCY + 55);

    // ── Tier badge ──
    const badgeY = scoreCY + 100;
    const badgeW = 160;
    const badgeH = 36;
    const badgeX = (w - badgeW) / 2;

    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 18);
    ctx.fillStyle = tier.color;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${tier.emoji} ${tier.label}`, w / 2, badgeY + 24);

    // ── Progress bar ──
    const barY = badgeY + 65;
    const barW = 320;
    const barH = 10;
    const barX = (w - barW) / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 5);
    ctx.fill();

    const fillW = Math.max((score / 100) * barW, 4);
    const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    fillGrad.addColorStop(0, '#fbbf24');
    fillGrad.addColorStop(0.5, '#f97316');
    fillGrad.addColorStop(1, '#ec4899');
    ctx.fillStyle = fillGrad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, fillW, barH, 5);
    ctx.fill();

    // ── City Rank ──
    const city = profile?.city;
    if (city || rank) {
      const rankText = rank
        ? `Ranked #${rank}${city ? ` in ${city}` : ''} 🏆`
        : `📍 ${city}`;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(rankText, w / 2, barY + 55);
    }

    // ── Subtle LoveBoard watermark at bottom ──
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#fff';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('❤️ LoveBoard — Share the love', w / 2, h - 30);
    ctx.restore();

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

    const file = new File([blob], `loveboard-${post.ai_score || 'score'}.png`, {
      type: 'image/png',
    });

    // Try native share with file (works on mobile)
    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'LoveBoard Score',
          text: `My partner scored ${post.ai_score || 0}/100! 🏆`,
          files: [file],
        });
      } catch {
        // User cancelled
      }
    } else {
      // Fallback: download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `loveboard-${post.ai_score || 'score'}.png`;
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

      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share2 className="h-4 w-4" />
        Share Score Card
      </Button>
    </>
  );
}
