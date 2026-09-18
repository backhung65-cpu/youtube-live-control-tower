import React, { useState, useEffect } from 'react';
import { X, Edit3, Globe, Save } from './icons';

export default function LiveMetadataModal({ isOpen, onClose, broadcast, onSave }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState('public');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (broadcast) {
      setTitle(broadcast.title || '');
      setDescription(broadcast.description || '');
      setPrivacyStatus(broadcast.privacyStatus || 'public');
    }
  }, [broadcast, isOpen]);

  if (!isOpen || !broadcast) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(broadcast.id, {
        title,
        description,
        privacyStatus,
      });
      onClose();
    } catch (err) {
      alert('수정 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">방송 정보 실시간 수정</h3>
              <p className="text-xs text-slate-400">송출 중에도 유튜브 라이브 제목과 설명을 즉시 변경할 수 있습니다.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              방송 제목
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              방송 설명
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              공개 설정
            </label>
            <select
              value={privacyStatus}
              onChange={(e) => setPrivacyStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
            >
              <option value="public">🌐 전체 공개</option>
              <option value="unlisted">🔗 일부 공개</option>
              <option value="private">🔒 비공개</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md"
            >
              <Save className="w-4 h-4" />
              {isSaving ? '저장 중...' : '유튜브에 즉시 반영'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
