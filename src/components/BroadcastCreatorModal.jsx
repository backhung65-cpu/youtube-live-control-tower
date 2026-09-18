import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Tv, 
  Calendar, 
  Globe, 
  Sparkles, 
  Image as ImageIcon 
} from './icons';
import { getTodayDateString } from '../utils/formatters';
import { storage } from '../services/storage';
import confetti from 'canvas-confetti';

export default function BroadcastCreatorModal({ 
  isOpen, 
  onClose, 
  onCreate, 
  presets = [], 
  initialData = null 
}) {
  const [selectedPresetId, setSelectedPresetId] = useState(presets[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState('public');
  const [latency] = useState('ultraLow');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyPreset = useCallback((preset) => {
    if (!preset) return;
    const today = getTodayDateString();
    const computedTitle = preset.titleTemplate
      .replace(/{DATE}/g, today)
      .replace(/{YYYY}/g, new Date().getFullYear())
      .replace(/{MM}/g, String(new Date().getMonth() + 1).padStart(2, '0'))
      .replace(/{DD}/g, String(new Date().getDate()).padStart(2, '0'))
      .replace(/{설교제목}/g, '은혜의 강가로 나아가라');

    const computedDesc = preset.descriptionTemplate
      .replace(/{DATE}/g, today)
      .replace(/{성경본문}/g, '에스겔 47:1-12')
      .replace(/{설교제목}/g, '은혜의 강가로 나아가라')
      .replace(/{설교자}/g, preset.speaker || '담임목사');

    setTitle(computedTitle);
    setDescription(computedDesc);
    setPrivacyStatus(preset.privacyStatus || 'public');
    setSelectedPresetId(preset.id);
  }, []);

  // Initialize form
  useEffect(() => {
    if (isOpen) {
      // Default to 20 minutes from now
      const defaultTime = new Date(Date.now() + 1000 * 60 * 20);
      const tzOffset = defaultTime.getTimezoneOffset() * 60000;
      const localISOTime = new Date(defaultTime.getTime() - tzOffset).toISOString().slice(0, 16);
      setScheduledDateTime(localISOTime);

      // Check cached thumbnail
      const cachedThumb = storage.getCachedThumbnail();
      if (initialData?.thumbnailUrl) {
        setThumbnailUrl(initialData.thumbnailUrl);
      } else if (cachedThumb) {
        setThumbnailUrl(cachedThumb);
      }

      // Initial data or default preset
      if (initialData?.title) {
        setTitle(initialData.title);
        setDescription(initialData.description || '');
      } else if (presets.length > 0) {
        applyPreset(presets[0]);
      }
    }
  }, [isOpen, initialData, presets, applyPreset]);

  if (!isOpen) return null;

  const handlePresetChange = (e) => {
    const pId = e.target.value;
    setSelectedPresetId(pId);
    const preset = presets.find((p) => p.id === pId);
    if (preset) {
      applyPreset(preset);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('방송 제목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate({
        title,
        description,
        scheduledStartTime: new Date(scheduledDateTime).toISOString(),
        privacyStatus,
        latency,
        thumbnailUrl,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      onClose();
    } catch (err) {
      console.error('Failed to create broadcast:', err);
      alert('방송 생성 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setThumbnailUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                새 유튜브 라이브 방송 개설 및 예약
              </h3>
              <p className="text-xs text-slate-400">
                여기서 개설하면 스마트폰 유튜브 앱의 ‘예약 목록’에서 바로 송출할 수 있습니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Preset Quick Loader */}
          {presets.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">방송 프리셋 1초 불러오기:</span>
              </div>
              <select
                value={selectedPresetId}
                onChange={handlePresetChange}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-500"
              >
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                방송 제목 <span className="text-red-400">*</span>
              </label>
              <span className={`text-[11px] ${title.length > 90 ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                {title.length} / 100자
              </span>
            </div>
            <input
              type="text"
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              placeholder="예: [2026.09.20] 주일 대예배 실시간 생중계"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              방송 설명 (유튜브 더보기란)
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
              placeholder="예배 안내, 헌금 계좌, 교회 홈페이지 링크 등을 적어주세요."
            />
          </div>

          {/* Schedule & Privacy Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Scheduled Start Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                시작 예정 일시
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Privacy Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                공개 범위
              </label>
              <select
                value={privacyStatus}
                onChange={(e) => setPrivacyStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500"
              >
                <option value="public">🌐 전체 공개 (누구나 시청 가능)</option>
                <option value="unlisted">🔗 일부 공개 (링크가 있는 사람만 시청)</option>
                <option value="private">🔒 비공개 (나만 시청/테스트용)</option>
              </select>
            </div>
          </div>

          {/* Thumbnail Preview & Attachment */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                적용할 16:9 섬네일
              </span>
              <label className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer font-medium">
                PC에서 다른 이미지 선택
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {thumbnailUrl ? (
              <div className="relative w-full aspect-video max-h-48 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 group">
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-xs text-white bg-black/60 px-3 py-1 rounded-full">
                    섬네일 자동 적용 준비됨
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full py-6 rounded-lg border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 text-xs">
                <span>섬네일 스튜디오에서 만든 섬네일이 자동으로 들어옵니다</span>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>방송 개설 중...</span>
              ) : (
                <>
                  <Tv className="w-4 h-4" />
                  유튜브에 방송 생성 & 섬네일 등록
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
