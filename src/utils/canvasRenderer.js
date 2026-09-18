// High performance HTML5 Canvas renderer for 1280x720 16:9 YouTube Thumbnails

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

/**
 * Wraps text into lines that fit within maxWidth on the canvas
 */
function wrapText(ctx, text, maxWidth) {
  if (!text) return [];
  const lines = [];
  const paragraphs = text.split('\n');

  for (const paragraph of paragraphs) {
    let currentLine = '';
    const words = paragraph.split(' ');

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

/**
 * Draws rounded rectangle path
 */
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Main rendering function for thumbnail
 */
export async function renderThumbnail(canvas, options) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const {
    bgType = 'gradient',
    bgColor = '#0f172a',
    bgGradient = { from: '#0f172a', to: '#1e1b4b', angle: 135 },
    bgImage = null, // HTMLImageElement or Image URL
    overlayOpacity = 0.45, // 0.0 to 1.0 dark vignette overlay
    
    // Badge
    showBadge = true,
    badgeText = 'LIVE 생중계',
    badgeBg = '#ef4444',
    badgeTextColor = '#ffffff',

    // Main Title
    title = '주일 대예배 실시간 생중계',
    titleColor = '#ffffff',
    titleSize = 72, // px
    titleWeight = 'bold',
    showTitleOutline = true,
    titleOutlineColor = '#000000',
    titleOutlineWidth = 8,
    showTitleShadow = true,
    titleShadowColor = 'rgba(0, 0, 0, 0.85)',
    titleShadowBlur = 16,

    // Subtitle / Bible Scripture
    subtitle = '은혜의 강가로 나아가라 | 에스겔 47:1-12',
    subtitleColor = '#93c5fd',
    subtitleSize = 34,

    // Speaker / Host
    speaker = '말씀 : 김요한 담임목사',
    speakerColor = '#fef08a',
    speakerSize = 30,

    // Date
    dateText = '2026.09.20 (주일) 오전 11:00',
    dateColor = '#cbd5e1',

    // Logo
    logoImage = null, // HTMLImageElement
    channelName = '미라클 스튜디오 TV',
  } = options;

  // 1. Draw Background
  if (bgType === 'image' && bgImage) {
    try {
      // Draw image scaled to cover canvas
      const imgAspect = bgImage.width / bgImage.height;
      const canvasAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
      let drawW, drawH, drawX, drawY;

      if (imgAspect > canvasAspect) {
        drawH = CANVAS_HEIGHT;
        drawW = CANVAS_HEIGHT * imgAspect;
        drawX = (CANVAS_WIDTH - drawW) / 2;
        drawY = 0;
      } else {
        drawW = CANVAS_WIDTH;
        drawH = CANVAS_WIDTH / imgAspect;
        drawX = 0;
        drawY = (CANVAS_HEIGHT - drawH) / 2;
      }
      ctx.drawImage(bgImage, drawX, drawY, drawW, drawH);
    } catch (e) {
      console.error('Error drawing background image:', e);
      // Fallback to gradient
      drawGradient(ctx, bgGradient);
    }
  } else if (bgType === 'color') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  } else {
    // Default gradient
    drawGradient(ctx, bgGradient);
  }

  // 2. Draw Vignette / Readability Dark Overlay
  if (overlayOpacity > 0) {
    const overlayGrad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    overlayGrad.addColorStop(0, `rgba(0, 0, 0, ${overlayOpacity * 0.9})`);
    overlayGrad.addColorStop(0.5, `rgba(0, 0, 0, ${overlayOpacity})`);
    overlayGrad.addColorStop(1, `rgba(0, 0, 0, ${Math.min(1, overlayOpacity * 1.3)})`);
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // Draw subtle top & bottom cinematic gradient bars
  const topGrad = ctx.createLinearGradient(0, 0, 0, 150);
  topGrad.addColorStop(0, 'rgba(0,0,0,0.5)');
  topGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 150);

  const bottomGrad = ctx.createLinearGradient(0, CANVAS_HEIGHT - 180, 0, CANVAS_HEIGHT);
  bottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
  bottomGrad.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, CANVAS_HEIGHT - 180, CANVAS_WIDTH, 180);

  // 3. Top Header: Channel Name & Top Right Watermark / Logo
  ctx.save();
  ctx.font = '600 26px Pretendard, system-ui, sans-serif';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(channelName, 80, 75);

  if (logoImage) {
    try {
      const logoSize = 60;
      ctx.drawImage(logoImage, CANVAS_WIDTH - 80 - logoSize, 40, logoSize, logoSize);
    } catch {
      // ignore logo draw failure
    }
  }
  ctx.restore();

  // 4. Draw Badge (e.g. LIVE 생중계)
  let startY = 175;
  if (showBadge && badgeText) {
    ctx.save();
    ctx.font = 'bold 24px Pretendard, system-ui, sans-serif';
    const textMetrics = ctx.measureText(badgeText);
    const badgeW = textMetrics.width + 50;
    const badgeH = 46;
    const badgeX = 80;
    const badgeY = startY;

    // Badge background
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 10);
    ctx.fillStyle = badgeBg;
    ctx.fill();

    // Red pulsating dot if live
    if (badgeText.includes('LIVE') || badgeText.includes('생중계') || badgeText.includes('라이브')) {
      ctx.beginPath();
      ctx.arc(badgeX + 22, badgeY + 23, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      
      // Badge text
      ctx.fillStyle = badgeTextColor;
      ctx.fillText(badgeText, badgeX + 38, badgeY + 31);
    } else {
      ctx.fillStyle = badgeTextColor;
      ctx.fillText(badgeText, badgeX + 25, badgeY + 31);
    }

    ctx.restore();
    startY += 75;
  } else {
    startY += 20;
  }

  // 5. Draw Main Title (Multi-line text wrapping)
  ctx.save();
  ctx.font = `${titleWeight} ${titleSize}px Pretendard, system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const maxTitleWidth = CANVAS_WIDTH - 160;
  const titleLines = wrapText(ctx, title, maxTitleWidth);
  const lineHeight = titleSize * 1.25;

  for (let i = 0; i < titleLines.length; i++) {
    const line = titleLines[i];
    const currentY = startY + i * lineHeight;

    // Drop shadow
    if (showTitleShadow) {
      ctx.save();
      ctx.shadowColor = titleShadowColor;
      ctx.shadowBlur = titleShadowBlur;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = titleColor;
      ctx.fillText(line, 80, currentY);
      ctx.restore();
    }

    // Outline stroke
    if (showTitleOutline) {
      ctx.save();
      ctx.strokeStyle = titleOutlineColor;
      ctx.lineWidth = titleOutlineWidth;
      ctx.lineJoin = 'round';
      ctx.strokeText(line, 80, currentY);
      ctx.restore();
    }

    // Text fill
    ctx.fillStyle = titleColor;
    ctx.fillText(line, 80, currentY);
  }

  startY += titleLines.length * lineHeight + 20;
  ctx.restore();

  // 6. Draw Subtitle / Scripture Verse
  if (subtitle) {
    ctx.save();
    ctx.font = `600 ${subtitleSize}px Pretendard, system-ui, sans-serif`;
    ctx.fillStyle = subtitleColor;
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const subLines = wrapText(ctx, subtitle, CANVAS_WIDTH - 160);
    for (let i = 0; i < subLines.length; i++) {
      ctx.fillText(subLines[i], 80, startY + i * (subtitleSize * 1.3));
    }
    startY += subLines.length * (subtitleSize * 1.3) + 20;
    ctx.restore();
  }

  // 7. Bottom Bar: Speaker / Preacher & Date Info
  const bottomY = CANVAS_HEIGHT - 65;
  ctx.save();

  // Accent Line
  const lineGrad = ctx.createLinearGradient(80, bottomY - 30, CANVAS_WIDTH - 80, bottomY - 30);
  lineGrad.addColorStop(0, '#f59e0b');
  lineGrad.addColorStop(0.5, '#38bdf8');
  lineGrad.addColorStop(1, 'rgba(255,255,255,0.1)');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(80, bottomY - 30);
  ctx.lineTo(CANVAS_WIDTH - 80, bottomY - 30);
  ctx.stroke();

  // Speaker name
  if (speaker) {
    ctx.font = `bold ${speakerSize}px Pretendard, system-ui, sans-serif`;
    ctx.fillStyle = speakerColor;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText(speaker, 80, bottomY);
  }

  // Date info (aligned right)
  if (dateText) {
    ctx.font = '500 26px Pretendard, system-ui, sans-serif';
    ctx.fillStyle = dateColor;
    ctx.textAlign = 'right';
    ctx.fillText(dateText, CANVAS_WIDTH - 80, bottomY);
  }

  ctx.restore();
}

function drawGradient(ctx, gradient) {
  const angle = (gradient.angle || 135) * (Math.PI / 180);
  const x1 = 0;
  const y1 = 0;
  const x2 = CANVAS_WIDTH * Math.cos(angle);
  const y2 = CANVAS_HEIGHT * Math.sin(angle);

  const grad = ctx.createLinearGradient(x1, y1, Math.abs(x2), Math.abs(y2));
  grad.addColorStop(0, gradient.from || '#0f172a');
  grad.addColorStop(1, gradient.to || '#1e1b4b');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

/**
 * Exports canvas to PNG Blob
 */
export function exportCanvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png', 0.95);
  });
}

/**
 * Exports canvas to PNG Data URL
 */
export function exportCanvasToDataURL(canvas) {
  return canvas.toDataURL('image/png', 0.95);
}
