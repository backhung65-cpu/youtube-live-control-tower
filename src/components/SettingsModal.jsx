import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Key, 
  ExternalLink, 
  HelpCircle, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Sparkles,
  ShieldAlert,
  Save,
  Radio
} from './icons';
import { storage } from '../services/storage';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  settings, 
  onSaveSettings, 
  onResetData,
  openConnectModal 
}) {
  const [isDemoMode, setIsDemoMode] = useState(settings?.isDemoMode ?? true);
  const [apiKey, setApiKey] = useState(settings?.apiKey || '');
  const [clientId, setClientId] = useState(settings?.clientId || '');
  const [channelName, setChannelName] = useState(settings?.channelName || '미라클 스튜디오 TV');
  const [isSaved, setIsSaved] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      isDemoMode,
      apiKey,
      clientId,
      channelName,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  const handleExportData = () => {
    const backup = {
      presets: storage.getPresets(),
      broadcasts: storage.getBroadcasts(),
      settings: storage.getSettings(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-control-tower-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.presets) storage.savePresets(parsed.presets);
        if (parsed.broadcasts) storage.saveBroadcasts(parsed.broadcasts);
        if (parsed.settings) storage.saveSettings(parsed.settings);
        alert('데이터를 성공적으로 복원했습니다! 화면을 새로고침합니다.');
        window.location.reload();
      } catch {
        alert('올바르지 않은 백업 파일입니다.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">환경 설정 및 YouTube API 연동</h3>
              <p className="text-xs text-slate-400">데모 모드와 실제 유튜브 API 연동 환경을 설정합니다.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-6">
          {/* Demo Mode Toggle Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">체험 데모 모드 (Demo Mode)</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                활성화 시 Google API 키 없이도 방송 생성, 섬네일 제작/적용, 실시간 관제 등 모든 기능을 100% 가상 시뮬레이션으로 테스트할 수 있습니다.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDemoMode}
                onChange={(e) => setIsDemoMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Channel Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              표시용 유튜브 채널명 / 교회명
            </label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500"
              placeholder="예: 미라클 스튜디오 TV"
            />
          </div>

          {/* Real API Credentials Section (Collapsible/Conditional) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-bold text-white">Google Cloud YouTube Data API 연동</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showGuide ? '가이드 접기' : '발급 방법 가이드 보기'}
              </button>
            </div>

            {/* Quick Connect Trigger Button */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">
                  {settings?.isConnected ? `🟢 연동 완료: ${settings?.channelName}` : '내 YouTube 채널 간편 연동'}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {settings?.isConnected
                    ? '현재 실제 유튜브 채널과 실시간으로 연결되어 있습니다.'
                    : 'Google 로그인 또는 30초 토큰 복사로 채널을 바로 연결하세요.'}
                </span>
              </div>
              <button
                type="button"
                onClick={openConnectModal}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
              >
                <Radio className="w-3.5 h-3.5" />
                {settings?.isConnected ? '연동 관리' : '유튜브 채널 연동창 열기'}
              </button>
            </div>

            {/* Google Cloud API Step-by-Step Guide */}
            {showGuide && (
              <div className="p-4 rounded-xl bg-slate-900 border border-sky-500/20 text-xs text-slate-300 space-y-2 leading-relaxed">
                <h5 className="font-bold text-sky-300 text-xs flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Google Cloud Console 발급 5단계 요약
                </h5>
                <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                  <li>
                    <a
                      href="https://console.cloud.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-400 underline"
                    >
                      Google Cloud Console
                    </a>
                    에 접속하여 새 프로젝트를 생성합니다.
                  </li>
                  <li>[API 및 서비스] &gt; [라이브러리]에서 <strong>YouTube Data API v3</strong>를 검색하여 [사용 설정]을 누릅니다.</li>
                  <li>[OAuth 동의 화면]에서 앱 이름을 입력하고 테스트 사용자(내 구글 계정)를 등록합니다.</li>
                  <li>[사용자 인증 정보] &gt; [사용자 인증 정보 만들기] &gt; <strong>OAuth 클라이언트 ID</strong>(웹 애플리케이션)를 생성합니다.</li>
                  <li>승인된 자바스크립트 원본에 <code className="text-amber-300">http://localhost:5173</code>를 추가하고 발급된 Client ID를 아래에 붙여넣습니다.</li>
                </ol>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Google OAuth Client ID
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={isDemoMode}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-sky-500 disabled:opacity-40"
                placeholder="xxxx.apps.googleusercontent.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                YouTube Data API v3 Key (선택)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isDemoMode}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-sky-500 disabled:opacity-40"
                placeholder="AIzaSy..."
              />
            </div>

            {isDemoMode && (
              <p className="text-[11px] text-amber-400/90 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                현재 데모 모드가 활성화되어 있어 API 키 입력 없이도 모든 기능이 가상 작동합니다.
              </p>
            )}
          </div>

          {/* Backup & Restore */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs font-bold text-slate-300 block mb-2">
              데이터 백업 및 초기화
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportData}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                설정/프리셋 JSON 백업
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                백업 JSON 복원
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('모든 프리셋과 방송 기록을 초기화하시겠습니까?')) {
                    onResetData();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs font-medium border border-red-800/40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                기본값 초기화
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              닫기
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/30"
            >
              {isSaved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
              {isSaved ? '저장 완료!' : '설정 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
