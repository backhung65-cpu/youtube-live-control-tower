import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  renderThumbnail, 
  exportCanvasToDataURL 
} from '../utils/canvasRenderer';
import { THUMBNAIL_TEMPLATES } from '../services/mockData';
import { storage } from '../services/storage';
import { 
  Download, 
  UploadCloud, 
  Image as ImageIcon, 
  Type, 
  Palette, 
  Sparkles, 
  Check, 
  RefreshCw,
  PlusCircle,
  FolderOpen
} from './icons';
import confetti from 'canvas-confetti';

export default function ThumbnailStudio({ 
  broadcasts = [], 
  onUploadToBroadcast, 
  onCreateBroadcastWithThumbnail 
}) {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  // Template & Background state
  const [selectedTemplate, setSelectedTemplate] = useState(THUMBNAIL_TEMPLATES[0].id);
  const [bgType, setBgType] = useState('gradient'); // 'gradient' | 'image' | 'color'
  const [gradientFrom, setGradientFrom] = useState(THUMBNAIL_TEMPLATES[0].bgGradient.from);
  const [gradientTo, setGradientTo] = useState(THUMBNAIL_TEMPLATES[0].bgGradient.to);
  const [overlayOpacity, setOverlayOpacity] = useState(0.45);
  const [bgImageElement, setBgImageElement] = useState(null);
  const [logoImageElement, setLogoImageElement] = useState(null);

  // Text Content state
  const [badgeText, setBadgeText] = useState('LIVE 생중계');
  const [showBadge, setShowBadge] = useState(true);
  const [title, setTitle] = useState('주일 대예배 실시간 생중계');
  const [subtitle, setSubtitle] = useState('은혜의 강가로 나아가라 | 에스겔 47:1-12');
  const [speaker, setSpeaker] = useState('말씀 : 김요한 담임목사');
  const [dateText, setDateText] = useState('2026.09.20 (주일) 오전 11:00');
  const [channelName, setChannelName] = useState('미라클 스튜디오 TV');

  // Styling state
  const [titleColor, setTitleColor] = useState('#ffffff');
  const [subtitleColor, setSubtitleColor] = useState('#93c5fd');
  const [speakerColor, setSpeakerColor] = useState('#fef08a');
  const [badgeBg, setBadgeBg] = useState('#ef4444');
  const [titleSize, setTitleSize] = useState(68);
  const [showOutline, setShowOutline] = useState(true);
  const [showShadow, setShowShadow] = useState(true);

  // Target broadcast for upload
  const [targetBroadcastId, setTargetBroadcastId] = useState(broadcasts[0]?.id || '');
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Render on canvas whenever any setting changes
  const triggerRender = useCallback(() => {
    if (!canvasRef.current) return;
    renderThumbnail(canvasRef.current, {
      bgType,
      bgGradient: { from: gradientFrom, to: gradientTo, angle: 135 },
      bgImage: bgImageElement,
      overlayOpacity,
      showBadge,
      badgeText,
      badgeBg,
      badgeTextColor: '#ffffff',
      title,
      titleColor,
      titleSize,
      titleWeight: 'bold',
      showTitleOutline: showOutline,
      showTitleShadow: showShadow,
      subtitle,
      subtitleColor,
      subtitleSize: 32,
      speaker,
      speakerColor,
      speakerSize: 30,
      dateText,
      dateColor: '#cbd5e1',
      logoImage: logoImageElement,
      channelName,
    });
  }, [
    bgType,
    gradientFrom,
    gradientTo,
    bgImageElement,
    overlayOpacity,
    showBadge,
    badgeText,
    badgeBg,
    title,
    titleColor,
    titleSize,
    showOutline,
    showShadow,
    subtitle,
    subtitleColor,
    speaker,
    speakerColor,
    dateText,
    logoImageElement,
    channelName,
  ]);

  useEffect(() => {
    triggerRender();
  }, [triggerRender]);

  // Set default target broadcast
  useEffect(() => {
    if (broadcasts.length > 0 && !targetBroadcastId) {
      setTargetBroadcastId(broadcasts[0].id);
    }
  }, [broadcasts, targetBroadcastId]);

  // Apply template
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template.id);
    setBgType('gradient');
    setGradientFrom(template.bgGradient.from);
    setGradientTo(template.bgGradient.to);
    setTitleColor(template.titleColor);
    setSubtitleColor(template.subtitleColor);
    setBadgeBg(template.badgeBg);
  };

  // Upload Custom Background Image
  const handleBgImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setBgImageElement(img);
        setBgType('image');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Upload Logo
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setLogoImageElement(img);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Download high-resolution PNG
  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dataUrl = exportCanvasToDataURL(canvasRef.current);
    const link = document.createElement('a');
    link.download = `youtube-thumbnail-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.85 } });
  };

  // Upload to selected broadcast
  const handleApplyToBroadcast = async () => {
    if (!canvasRef.current || !targetBroadcastId) return;
    setIsApplying(true);
    try {
      const dataUrl = exportCanvasToDataURL(canvasRef.current);
      storage.setCachedThumbnail(dataUrl);

      if (onUploadToBroadcast) {
        await onUploadToBroadcast(targetBroadcastId, dataUrl);
      }
      setApplySuccess(true);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
      setTimeout(() => setApplySuccess(false), 3000);
    } catch (err) {
      console.error('Failed to apply thumbnail:', err);
      alert('섬네일 적용 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsApplying(false);
    }
  };

  // Forward to create new broadcast modal
  const handleCreateNewWithThis = () => {
    if (!canvasRef.current) return;
    const dataUrl = exportCanvasToDataURL(canvasRef.current);
    storage.setCachedThumbnail(dataUrl);
    if (onCreateBroadcastWithThumbnail) {
      onCreateBroadcastWithThumbnail({
        title,
        description: `${title}\n${subtitle}\n${speaker}\n${dateText}`,
        thumbnailUrl: dataUrl,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-red-500" />
            16:9 유튜브 라이브 섬네일 스튜디오
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            예배·모임 템플릿 선택과 텍스트 입력만으로 고화질(1280x720) 섬네일을 완성하고 바로 유튜브에 적용합니다.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold border border-slate-700 transition-colors shadow-md"
          >
            <Download className="w-4 h-4 text-sky-400" />
            PNG 다운로드
          </button>

          <button
            onClick={handleCreateNewWithThis}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-lg shadow-red-600/30 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            이 섬네일로 방송 개설
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls (5 cols) & Right Preview & Apply (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Side: Editor Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Template Selection */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              추천 예배·모임 템플릿 프리셋
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {THUMBNAIL_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    selectedTemplate === tmpl.id
                      ? 'border-red-500 bg-slate-800 ring-2 ring-red-500/20'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div
                    className="w-full h-8 rounded-lg mb-2 shadow-inner"
                    style={{
                      background: `linear-gradient(${tmpl.bgGradient.angle}deg, ${tmpl.bgGradient.from}, ${tmpl.bgGradient.to})`,
                    }}
                  />
                  <div className="text-xs font-semibold text-slate-200 truncate">{tmpl.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Text Content Inputs */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Type className="w-4 h-4 text-sky-400" />
              텍스트 내용 편집
            </h3>

            {/* Main Title */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                메인 타이틀 (설교/방송 제목)
              </label>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="주일 대예배 실시간 생중계"
              />
            </div>

            {/* Subtitle / Scripture */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                서브 타이틀 / 성경 본문
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
                placeholder="은혜의 강가로 나아가라 | 에스겔 47:1-12"
              />
            </div>

            {/* Preacher & Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  설교자 / 강사
                </label>
                <input
                  type="text"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
                  placeholder="말씀 : 김요한 담임목사"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  날짜 / 시간
                </label>
                <input
                  type="text"
                  value={dateText}
                  onChange={(e) => setDateText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
                  placeholder="2026.09.20 (주일) 11:00"
                />
              </div>
            </div>

            {/* Badge & Channel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  상단 뱃지 텍스트
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
                  />
                  <button
                    onClick={() => setShowBadge(!showBadge)}
                    className={`px-2.5 rounded-xl border text-xs font-medium ${
                      showBadge
                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {showBadge ? '표시' : '숨김'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  교회 / 채널명
                </label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
                  placeholder="미라클 스튜디오 TV"
                />
              </div>
            </div>
          </div>

          {/* Background & Styling Controls */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-pink-400" />
              배경 및 디자인 상세 설정
            </h3>

            {/* Background Type Toggle */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium">
              <button
                onClick={() => setBgType('gradient')}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  bgType === 'gradient' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                그라데이션 배경
              </button>
              <button
                onClick={() => setBgType('image')}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  bgType === 'image' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                사진/이미지 배경
              </button>
            </div>

            {bgType === 'gradient' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">시작 색상</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={gradientFrom}
                      onChange={(e) => setGradientFrom(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-300">{gradientFrom}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">종료 색상</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={gradientTo}
                      onChange={(e) => setGradientTo(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-300">{gradientTo}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleBgImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-slate-700 hover:border-red-500 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white transition-all bg-slate-950/40"
                >
                  <FolderOpen className="w-5 h-5 text-red-400" />
                  <span className="text-xs font-medium">내 PC에서 배경 사진(예배당, 강단, 풍경) 불러오기</span>
                  <span className="text-[10px] text-slate-500">JPG, PNG 파일 지원</span>
                </button>
              </div>
            )}

            {/* Logo Upload & Text Colors */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
              <div>
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  교회/채널 로고(PNG) 업로드
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">설교자 색상</span>
                <input
                  type="color"
                  value={speakerColor}
                  onChange={(e) => setSpeakerColor(e.target.value)}
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>
            </div>

            {/* Dark Overlay Opacity Slider */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>글자 가독성 어둡기 필터</span>
                <span className="font-mono text-white">{Math.round(overlayOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.85"
                step="0.05"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>

            {/* Font Size & Effects */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>제목 글꼴 크기</span>
                  <span className="font-mono text-white">{titleSize}px</span>
                </div>
                <input
                  type="range"
                  min="48"
                  max="96"
                  step="2"
                  value={titleSize}
                  onChange={(e) => setTitleSize(parseInt(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOutline}
                    onChange={(e) => setShowOutline(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-red-600 focus:ring-0"
                  />
                  외곽선 강조 (Stroke)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showShadow}
                    onChange={(e) => setShowShadow(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-red-600 focus:ring-0"
                  />
                  입체 그림자 (Shadow)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Live Canvas Preview & Quick Upload */}
        <div className="lg:col-span-7 space-y-6">
          {/* Canvas Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200">16:9 유튜브 표준 섬네일 미리보기</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  1280 × 720 HD
                </span>
              </div>
              <button
                onClick={triggerRender}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                title="다시 렌더링"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                새로고침
              </button>
            </div>

            {/* Responsive Canvas Container with 16:9 Aspect Ratio */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-slate-800/80 bg-slate-950">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain block select-none"
              />
            </div>
            <p className="text-center text-[11px] text-slate-500 mt-2">
              유튜브 검색 및 추천 피드에서 시선을 사로잡는 최적의 16:9 황금비율 레이아웃입니다.
            </p>
          </div>

          {/* Quick Apply to Active/Scheduled Broadcast */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-md">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              유튜브 방송에 즉시 섬네일 업로드
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              스마트폰에서 라이브를 켜기 전에, PC에서 완성된 고화질 섬네일을 선택한 유튜브 방송에 1초 만에 전송합니다.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={targetBroadcastId}
                onChange={(e) => setTargetBroadcastId(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500 truncate"
              >
                {broadcasts.length === 0 && (
                  <option value="">등록된 방송이 없습니다 (새 방송 먼저 개설)</option>
                )}
                {broadcasts.map((b) => (
                  <option key={b.id} value={b.id}>
                    [{b.status === 'live' ? '송출중' : b.status === 'ready' ? '대기' : '종료'}] {b.title}
                  </option>
                ))}
              </select>

              <button
                onClick={handleApplyToBroadcast}
                disabled={isApplying || !targetBroadcastId}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
                  applySuccess
                    ? 'bg-emerald-600 text-white'
                    : isApplying
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                }`}
              >
                {applySuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    업로드 완료!
                  </>
                ) : isApplying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    이 방송에 즉시 적용
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
