import React, { useState } from 'react';
import { 
  X, 
  Tv, 
  Key, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  LogOut,
  GoogleIcon,
  Search,
  Radio
} from './icons';
import { youtubeAuth } from '../services/youtubeAuth';

export default function YouTubeConnectModal({ 
  isOpen, 
  onClose, 
  settings, 
  onSaveSettings, 
  onConnected 
}) {
  // 'channel' (ID/Handle) | 'token' (Playground OAuth) | 'oauth' (GIS Client ID)
  const [tab, setTab] = useState('channel');
  
  // Channel ID / Handle / API Key Tab State
  const [channelInput, setChannelInput] = useState(settings?.channelHandle || settings?.channelId || '');
  const [apiKeyInput, setApiKeyInput] = useState(settings?.apiKey || '');

  // OAuth Token Tab State
  const [tokenInput, setTokenInput] = useState(settings?.token || '');

  // GIS Client ID Tab State
  const [clientIdInput, setClientIdInput] = useState(settings?.clientId || '');

  // Status State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showGcpGuide, setShowGcpGuide] = useState(false);

  if (!isOpen) return null;

  const isConnected = !!settings?.isConnected;

  // Handle Channel ID / Handle / API Key Connect
  const handleConnectChannel = async (e) => {
    e?.preventDefault();
    if (!channelInput.trim()) {
      setErrorMsg('유튜브 채널 주소, 핸들(@아이디), 또는 채널 ID를 입력해주세요.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const updated = await youtubeAuth.connectWithChannelIdAndApiKey(
        channelInput,
        apiKeyInput,
        settings
      );
      setSuccessMsg(`성공! [${updated.channelName}] 채널이 관제탑에 연결되었습니다.`);
      onSaveSettings(updated);
      if (onConnected) onConnected(updated);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || '채널 정보를 찾을 수 없습니다. 아이디를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // Handle direct OAuth token submit
  const handleConnectToken = async (e) => {
    e?.preventDefault();
    if (!tokenInput.trim()) {
      setErrorMsg('Google OAuth 액세스 토큰(Access Token)을 입력해주세요.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const updated = await youtubeAuth.verifyAndSaveToken(tokenInput, settings);
      setSuccessMsg(`성공! [${updated.channelName}] 채널과 OAuth 실시간 연동되었습니다.`);
      onSaveSettings(updated);
      if (onConnected) onConnected(updated);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || '채널 정보를 불러오지 못했습니다. 토큰을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // Handle 1-Click GIS Google Login
  const handleGoogleLoginGIS = async () => {
    if (!clientIdInput.trim()) {
      setErrorMsg('Google OAuth Client ID를 먼저 입력해주세요.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const updated = await youtubeAuth.loginWithGoogleGIS(clientIdInput, settings);
      setSuccessMsg(`성공! [${updated.channelName}] 채널과 로그인 연동되었습니다.`);
      onSaveSettings(updated);
      if (onConnected) onConnected(updated);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Google 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Disconnect / Logout
  const handleDisconnect = () => {
    if (window.confirm('실제 유튜브 채널 연동을 해제하고 데모 모드로 돌아가시겠습니까?')) {
      const updated = youtubeAuth.logout(settings);
      onSaveSettings(updated);
      setTokenInput('');
      setSuccessMsg('연동이 해제되었습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                내 YouTube 채널 & API 연동
              </h3>
              <p className="text-xs text-slate-400">내 유튜브 채널 아이디를 등록하거나 구글 API를 연동하여 실시간 관제탑을 가동합니다.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Connection Status Box */}
        {isConnected ? (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              {settings.channelAvatar ? (
                <img
                  src={settings.channelAvatar}
                  alt=""
                  className="w-12 h-12 rounded-full border-2 border-emerald-400 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-white text-lg">
                  {settings.channelName?.slice(0, 1) || 'Y'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-bold text-emerald-300">내 채널 연동 완료</span>
                </div>
                <h4 className="text-base font-black text-white mt-0.5">{settings.channelName}</h4>
                <p className="text-[11px] text-slate-400">
                  {settings.channelHandle && <span>{settings.channelHandle} • </span>}
                  구독자 {Number(settings.subscriberCount || 0).toLocaleString()}명
                </p>
              </div>
            </div>

            <button
              onClick={handleDisconnect}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              연동 해제
            </button>
          </div>
        ) : (
          <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">현재 가상 데모 상태입니다.</strong>
              <p className="text-slate-300 text-[11px] mt-0.5">
                내 유튜브 채널 주소나 아이디를 입력하시면, 내 채널의 실제 라이브 화면과 실시간 정보가 관제탑에 즉시 연결됩니다.
              </p>
            </div>
          </div>
        )}

        {/* Tab Selection: Channel ID (Easy) vs OAuth Token vs GIS Client ID */}
        <div className="mt-6 flex border-b border-slate-800 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setTab('channel')}
            className={`pb-3 px-3.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              tab === 'channel'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>방법 1. 유튜브 아이디 / 채널 등록 (가장 쉬움)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('token')}
            className={`pb-3 px-3.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              tab === 'token'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>방법 2. OAuth 토큰 연동</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('oauth')}
            className={`pb-3 px-3.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              tab === 'oauth'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GoogleIcon className="w-3.5 h-3.5" />
            <span>방법 3. Google 로그인</span>
          </button>
        </div>

        {/* TAB 1: Channel ID / Handle / API Key (The Most Direct & Intuitive Way) */}
        {tab === 'channel' && (
          <form onSubmit={handleConnectChannel} className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-red-500" />
                내 유튜브 채널 정보 직접 등록
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                운영 중이신 유튜브 채널 주소나 핸들 아이디(@아이디)를 입력하세요. 복잡한 인증 절차 없이 내 채널의 실제 프로필, 실시간 라이브 스트림 화면, 유튜브 공식 관제실이 즉시 연결됩니다.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                내 유튜브 채널 주소 또는 핸들 아이디 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
                placeholder="예: @miracletv 또는 https://youtube.com/@mychurch 또는 채널ID"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-red-500 placeholder-slate-600"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                유튜브 앱이나 브라우저 주소창의 내 채널 링크(https://youtube.com/@...)를 그대로 붙여넣으셔도 됩니다.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Google YouTube Data API v3 Key <span className="text-slate-500 text-[10px] font-normal">(선택사항)</span>
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy... (API 키가 있으면 실시간 방송을 자동으로 더 정확하게 검색합니다)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-red-500 placeholder-slate-600"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !channelInput.trim()}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? '내 채널 정보 불러오는 중...' : '내 유튜브 채널 관제탑에 등록하기'}
            </button>
          </form>
        )}

        {/* TAB 2: OAuth Token (Google OAuth Playground) */}
        {tab === 'token' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  Google OAuth Playground에서 30초 만에 토큰 복사
                </span>
                <a
                  href="https://developers.google.com/oauthplayground/#step1&apisSelect=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 bg-sky-950/50 px-2.5 py-1.5 rounded-lg border border-sky-800/60"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  OAuth Playground 열기 ↗
                </a>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                PC에서 라이브를 <strong>원격 생성하고, 제목을 바꾸고, 방송을 종료</strong>하려면 Google OAuth 토큰이 필요합니다.
              </p>
              <ol className="list-decimal pl-4 space-y-1 text-slate-400 text-[11px]">
                <li>위 링크를 누르고, Step 1에서 <strong>[Authorize APIs]</strong> 파란색 버튼을 클릭합니다.</li>
                <li>내 유튜브 구글 계정으로 로그인 후 [허용]을 누릅니다.</li>
                <li>Step 2에서 <strong>[Exchange authorization code for tokens]</strong> 버튼을 누릅니다.</li>
                <li>우측에 나타난 <strong>Access token (ya29...)</strong> 문자열을 복사하여 아래에 붙여넣습니다.</li>
              </ol>
            </div>

            <form onSubmit={handleConnectToken} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Google OAuth Access Token (ya29.a0...)
                </label>
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="ya29.a0AfH6SM..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-red-500 placeholder-slate-600"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !tokenInput.trim()}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                {loading ? '채널 정보 확인 및 연동 중...' : 'OAuth 토큰으로 유튜브 연동하기'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: GIS 1-Click Login with Client ID */}
        {tab === 'oauth' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Google OAuth Client ID 등록</span>
                <button
                  type="button"
                  onClick={() => setShowGcpGuide(!showGcpGuide)}
                  className="text-sky-400 hover:text-sky-300 text-xs font-semibold underline"
                >
                  {showGcpGuide ? '가이드 닫기' : 'Client ID 발급 가이드 (3분)'}
                </button>
              </div>

              {showGcpGuide && (
                <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px] text-slate-400">
                  <p>1. <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-sky-400 underline">Google Cloud Console</a> &gt; 프로젝트 생성</p>
                  <p>2. [API 및 서비스] &gt; <strong>YouTube Data API v3</strong> [사용 설정]</p>
                  <p>3. [OAuth 동의 화면] 설정 (테스트 사용자에 본인 구글 이메일 추가)</p>
                  <p>4. [사용자 인증 정보] &gt; [OAuth 클라이언트 ID 만들기] (웹 애플리케이션)</p>
                  <p>5. 승인된 자바스크립트 원본에 아래 주소를 등록하세요:</p>
                  <code className="block p-1.5 rounded bg-slate-900 text-amber-300 font-mono text-[10px]">
                    {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}
                  </code>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 mt-3">
                  Google Client ID (.apps.googleusercontent.com)
                </label>
                <input
                  type="text"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  placeholder="123456789-abcdefg.apps.googleusercontent.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleLoginGIS}
              disabled={loading || !clientIdInput.trim()}
              className="w-full py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs sm:text-sm font-bold shadow-lg flex items-center justify-center gap-2.5 disabled:opacity-50 transition-all"
            >
              <GoogleIcon className="w-4 h-4" />
              {loading ? 'Google 로그인 진행 중...' : 'Google 계정으로 유튜브 연동하기'}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>인증 정보는 본인 PC 브라우저에만 안전하게 저장됩니다.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
