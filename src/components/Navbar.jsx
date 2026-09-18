import React from 'react';
import { 
  Tv, 
  Image as ImageIcon, 
  BookmarkCheck, 
  Smartphone, 
  Settings as SettingsIcon, 
  Radio, 
  Sparkles
} from './icons';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  isDemoMode, 
  setIsDemoMode, 
  openSettings, 
  openMobileGuide,
  activeBroadcast 
}) {
  const isLive = activeBroadcast?.status === 'live';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 shadow-lg shadow-red-600/30">
            <Radio className="w-5 h-5 text-white animate-pulse" />
            {isLive && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                유튜브 라이브 <span className="text-red-500">관제탑</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">모바일 라이브 & PC 원격 컨트롤타워</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Tv className="w-4 h-4" />
            관제 대시보드
            {isLive && (
              <span className="inline-block w-2 h-2 rounded-full bg-white animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('thumbnail')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'thumbnail'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            섬네일 스튜디오
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'presets'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            방송 프리셋
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Guide Button */}
          <button
            onClick={openMobileGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-colors"
            title="스마트폰 유튜브 앱에서 시작하는 방법"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">모바일 폰 연동 가이드</span>
            <span className="sm:hidden">폰 연동</span>
          </button>

          {/* Demo Mode Toggle Badge */}
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              isDemoMode
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
            title="데모 모드 / 실제 유튜브 API 전환"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isDemoMode ? '체험 데모 모드' : 'YouTube API 연동'}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={openSettings}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800 transition-colors"
            title="환경 설정 및 API 연결"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile sub-tabs bar for small screens */}
      <div className="flex md:hidden border-t border-slate-800/80 bg-slate-950 px-2 py-1 gap-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-1.5 text-xs font-medium text-center rounded-md ${
            activeTab === 'dashboard' ? 'bg-red-600 text-white' : 'text-slate-400'
          }`}
        >
          관제 대시보드
        </button>
        <button
          onClick={() => setActiveTab('thumbnail')}
          className={`flex-1 py-1.5 text-xs font-medium text-center rounded-md ${
            activeTab === 'thumbnail' ? 'bg-red-600 text-white' : 'text-slate-400'
          }`}
        >
          섬네일 제작
        </button>
        <button
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-1.5 text-xs font-medium text-center rounded-md ${
            activeTab === 'presets' ? 'bg-red-600 text-white' : 'text-slate-400'
          }`}
        >
          방송 프리셋
        </button>
      </div>
    </header>
  );
}
