import React, { useState } from 'react';
import { 
  BookmarkCheck, 
  Plus, 
  Trash2, 
  Copy, 
  Edit, 
  Tv, 
  Info,
  X,
  Save
} from './icons';

export default function PresetManager({ presets = [], onPresetsChange, onUsePreset }) {
  const [editingPreset, setEditingPreset] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [titleTemplate, setTitleTemplate] = useState('');
  const [descriptionTemplate, setDescriptionTemplate] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState('public');
  const [badgeText, setBadgeText] = useState('주일 대예배');
  const [speaker, setSpeaker] = useState('담임목사');
  const [tagsInput, setTagsInput] = useState('');

  const openCreateModal = () => {
    setEditingPreset(null);
    setName('');
    setTitleTemplate('[{DATE}] 주일 대예배 실시간 생중계 - {설교제목}');
    setDescriptionTemplate(`[주일 대예배 실시간 생중계]

일시: {DATE} 오전 11:00
성경본문: {성경본문}
설교: {설교자}`);
    setPrivacyStatus('public');
    setBadgeText('주일 대예배');
    setSpeaker('담임목사');
    setTagsInput('주일예배, 온라인예배, 실시간라이브');
    setIsModalOpen(true);
  };

  const openEditModal = (preset) => {
    setEditingPreset(preset);
    setName(preset.name || '');
    setTitleTemplate(preset.titleTemplate || '');
    setDescriptionTemplate(preset.descriptionTemplate || '');
    setPrivacyStatus(preset.privacyStatus || 'public');
    setBadgeText(preset.badgeText || '');
    setSpeaker(preset.speaker || '');
    setTagsInput((preset.tags || []).join(', '));
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('정말 이 프리셋을 삭제하시겠습니까?')) return;
    const updated = presets.filter((p) => p.id !== id);
    onPresetsChange(updated);
  };

  const handleDuplicate = (preset) => {
    const duplicated = {
      ...preset,
      id: `preset-${Date.now()}`,
      name: `${preset.name} (복사본)`,
      createdAt: new Date().toISOString(),
    };
    onPresetsChange([duplicated, ...presets]);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingPreset) {
      // Update existing
      const updated = presets.map((p) =>
        p.id === editingPreset.id
          ? {
              ...p,
              name,
              titleTemplate,
              descriptionTemplate,
              privacyStatus,
              badgeText,
              speaker,
              tags,
            }
          : p
      );
      onPresetsChange(updated);
    } else {
      // Add new
      const newPreset = {
        id: `preset-${Date.now()}`,
        name,
        titleTemplate,
        descriptionTemplate,
        privacyStatus,
        badgeText,
        speaker,
        tags,
        thumbnailTheme: 'midnight_navy',
        createdAt: new Date().toISOString(),
      };
      onPresetsChange([newPreset, ...presets]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <BookmarkCheck className="w-6 h-6 text-red-500" />
            방송 프리셋 템플릿 관리
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            주일예배, 수요기도회, 집회 등 자주 쓰는 제목/설명/태그를 저장해두고 1초 만에 방송을 세팅합니다.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-600/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 프리셋 추가
        </button>
      </div>

      {/* Dynamic Placeholder Guide */}
      <div className="mt-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300">
          <strong className="text-sky-300 font-semibold">자동 치환 변수 팁: </strong>
          프리셋 제목이나 설명에{' '}
          <code className="px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800 font-mono">
            {'{DATE}'}
          </code>
          (오늘 날짜 YYYY.MM.DD),{' '}
          <code className="px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800 font-mono">
            {'{설교제목}'}
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800 font-mono">
            {'{성경본문}'}
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800 font-mono">
            {'{설교자}'}
          </code>
          를 입력해두시면, 방송 개설 시 오늘 날짜와 입력된 정보로 자동 치환됩니다.
        </div>
      </div>

      {/* Presets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between hover:border-slate-700 transition-all group"
          >
            <div>
              {/* Card Top */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <h3 className="font-bold text-white text-base">{preset.name}</h3>
                </div>
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDuplicate(preset)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="복제"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(preset)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="수정"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(preset.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title Template */}
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  제목 서식
                </span>
                <p className="text-sm font-medium text-slate-200 mt-0.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 font-mono break-all">
                  {preset.titleTemplate}
                </p>
              </div>

              {/* Description Preview */}
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  설명 서식 (미리보기)
                </span>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-3 bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 whitespace-pre-line">
                  {preset.descriptionTemplate}
                </p>
              </div>

              {/* Tags & Badges */}
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                  {preset.badgeText || '예배'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                  {preset.privacyStatus === 'public' ? '전체공개' : '일부공개'}
                </span>
                {(preset.tags || []).slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Action */}
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end">
              <button
                onClick={() => onUsePreset(preset)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white text-xs font-bold border border-red-500/30 hover:border-transparent transition-all shadow-sm"
              >
                <Tv className="w-3.5 h-3.5" />
                이 프리셋으로 방송 만들기
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preset Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-red-500" />
                {editingPreset ? '프리셋 수정' : '새 방송 프리셋 추가'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  프리셋 이름 (구분용)
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
                  placeholder="예: 주일 2부 예배 (11:00)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  방송 제목 서식 ({'{DATE}'}, {'{설교제목}'} 등 사용 가능)
                </label>
                <input
                  type="text"
                  required
                  value={titleTemplate}
                  onChange={(e) => setTitleTemplate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
                  placeholder="[{DATE}] 주일 대예배 - {설교제목}"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  설명 서식 ({'{성경본문}'}, {'{설교자}'} 등 사용 가능)
                </label>
                <textarea
                  rows={4}
                  value={descriptionTemplate}
                  onChange={(e) => setDescriptionTemplate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    상단 뱃지명
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500"
                    placeholder="주일 대예배"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    기본 설교자/강사
                  </label>
                  <input
                    type="text"
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500"
                    placeholder="담임목사"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  태그 목록 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500"
                  placeholder="주일예배, 온라인예배, 찬양집회"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md"
                >
                  <Save className="w-4 h-4" />
                  저장 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
