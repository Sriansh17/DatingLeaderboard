'use client';

import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Share2 } from 'lucide-react';
import type { Post } from '@/types/database';

interface ShareCardProps {
  post: Post;
}

export function ShareCard({ post }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { addToast } = useToast();

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const w = canvas.width;
    const h = canvas.height;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#ec4899');
    gradient.addColorStop(0.5, '#f43f5e');
    gradient.addColorStop(1, '#a855f7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Decorative circles
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(w * 0.8, h * 0.2, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * 0.15, h * 0.8, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Heart icon
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = '60px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('❤️', w / 2, 100);

    // App name
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LoveBoard', w / 2, 150);

    // Score circle
    const score = post.ai_score || 0;
    const scoreRadius = 80;
    const scoreY = 340;

    // Outer glow
    ctx.shadowColor = 'rgba(255,255,255,0.3)';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(w / 2, scoreY, scoreRadius + 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Score circle background
    ctx.beginPath();
    ctx.arc(w / 2, scoreY, scoreRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Score text
    ctx.fillStyle = '#ec4899';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText(String(score), w / 2, scoreY + 22);

    // "/100" label
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '20px sans-serif';
    ctx.fillText('/ 100', w / 2, scoreY + 55);

    // Percentage bar
    const barY = 460;
    const barW = 300;
    const barH = 12;
    const barX = (w - barW) / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 6);
    ctx.fill();

    const fillW = (score / 100) * barW;
    const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    fillGrad.addColorStop(0, '#fbbf24');
    fillGrad.addColorStop(0.5, '#f97316');
    fillGrad.addColorStop(1, '#ec4899');
    ctx.fillStyle = fillGrad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, fillW, barH, 6);
    ctx.fill();

    // Partner name
    if (post.partner) {
      ctx.fillStyle = '#fff';
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${post.partner.emoji} ${post.partner.name}`, w / 2, 520);
    }

    // AI Feedback
    if (post.ai_feedback) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';

      const maxWidth = 320;
      const words = post.ai_feedback.split(' ');
      let line = '';
      let lineY = 570;
      for (const word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth) {
          ctx.fillText(`"${line.trim()}"`, w / 2, lineY);
          line = word + ' ';
          lineY += 28;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(`"${line.trim()}"`, w / 2, lineY);
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Made with ❤️ on LoveBoard', w / 2, 680);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  }, [post]);

  const handleShare = async () => {
    const blob = await generateImage();
    if (!blob) {
      addToast('Could not generate image', 'error');
      return;
    }

    const file = new File([blob], `loveboard-score-${post.ai_score || 0}.png`, { type: 'image/png' });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'LoveBoard Score',
          text: `My partner scored ${post.ai_score || 0}/100! ❤️`,
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
      a.download = `loveboard-score-${post.ai_score || 0}.png`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Score card downloaded! Share it on Instagram 📸', 'success');
    }
  };

  return (
    <>
      {/* Hidden canvas for generation */}
      <canvas
        ref={canvasRef}
        width={500}
        height={740}
        style={{ display: 'none' }}
      />

      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share2 className="h-4 w-4" />
        Share Score Card
      </Button>
    </>
  );
}
