import React from 'react';
import { 
  Tv, 
  Image as ImageIcon, 
  BookmarkCheck, 
  Smartphone, 
  Settings as SettingsIcon, 
  Radio, 
  RefreshCw
} from './icons';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  openSettings, 
  openMobileGuide,
  activeBroadcast,
  settings,
  openConnectModal,
  onRefresh,
  isRefreshing
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
          {/* Real YouTube Channel Status / Connect Button */}
          {settings?.isConnected && settings?.token ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                title="유튜브 실시간 방송 목록 새로고침"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-500' : ''}`} />
              </button>

              <button
                onClick={openConnectModal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-sm transition-all"
                title="클릭하여 유튜브 연결 관리"
              >
                {settings.channelAvatar ? (
                  <img src={settings.channelAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
                <span className="max-w-[120px] truncate">{settings.channelName}</span>
                <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.2 rounded text-emerald-400">연동됨</span>
              </button>
            </div>
          ) : (
            <button
              onClick={openConnectModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all animate-pulse"
              title="실제 내 유튜브 채널과 연동하기"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>내 유튜브 채널 연결</span>
            </button>
          )}

          {/* Mobile Guide Button */}
          <button
            onClick={openMobileGuide}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 transition-colors"
            title="스마트폰 유튜브 앱에서 시작하는 방법"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>폰 연동 가이드</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={openSettings}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800 transition-colors"
            title="환경 설정"
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
