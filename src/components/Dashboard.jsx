import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Radio, 
  Play, 
  Square, 
  Clock, 
  Users, 
  ThumbsUp, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Image as ImageIcon, 
  Plus, 
  Smartphone, 
  Search,
  MessageSquare,
  Send,
  Sparkles,
  QrCode,
  RefreshCw
} from './icons';
import { formatDuration, formatKoreanDateTime, getStatusBadge } from '../utils/formatters';
import { MOCK_CHAT_MESSAGES } from '../services/mockData';
import { getQrCodeUrl } from '../utils/qrHelper';

export default function Dashboard({ 
  broadcasts = [], 
  onOpenCreator, 
  onOpenThumbnail, 
  onOpenMobileGuide, 
  onStatusChange, 
  onDeleteBroadcast,
  onEditMetadata,
  isDemoMode,
  settings,
  openConnectModal,
  onRefresh,
  isRefreshing
}) {
  // Find active broadcast (live first, then ready, then most recent)
  const liveBroadcast = broadcasts.find((b) => b.status === 'live');
  const readyBroadcast = broadcasts.find((b) => b.status === 'ready');
  const activeBroadcast = liveBroadcast || readyBroadcast || broadcasts[0] || null;

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all'); // all, live, ready, complete
  const [searchQuery, setSearchQuery] = useState('');

  // Live Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live Chat state (Simulation)
  const [chatMessages, setChatMessages] = useState(MOCK_CHAT_MESSAGES);
  const [newChatInput, setNewChatInput] = useState('');
  const [qrModalUrl, setQrModalUrl] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [screenMode, setScreenMode] = useState('thumbnail'); // 'thumbnail' | 'player'

  // Calculate elapsed time if live
  useEffect(() => {
    let interval = null;
    if (activeBroadcast?.status === 'live') {
      const startTime = activeBroadcast.actualStartTime 
        ? new Date(activeBroadcast.actualStartTime).getTime() 
        : Date.now() - 1000 * 60 * 15; // default 15 mins ago

      interval = setInterval(() => {
        const diff = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
        setElapsedSeconds(diff);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeBroadcast]);

  // Periodic random chat simulator in demo mode when live
  useEffect(() => {
    if (!isDemoMode || activeBroadcast?.status !== 'live') return;

    const phrases = [
      '목사님 말씀에 큰 은혜 받습니다! 🙏',
      '화면 화질과 음향이 아주 깨끗하네요 👍',
      '모두 평안한 주일 되세요~!',
      '아멘! 귀한 나눔 감사합니다.',
      '기도제목 나누며 함께 예배합니다 ❤️',
    ];
    const users = ['은혜충만', '믿음의가정', '찬양지기', '희망청년', '샬롬'];

    const chatTimer = setInterval(() => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      setChatMessages((prev) => [
        ...prev.slice(-15),
        {
          id: String(Date.now()),
          user: randomUser,
          message: randomPhrase,
          time: timeStr,
        },
      ]);
    }, 12000);

    return () => clearInterval(chatTimer);
  }, [isDemoMode, activeBroadcast]);

  // Send Moderator Chat Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newChatInput.trim()) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setChatMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        user: '관리자 (미라클TV)',
        message: newChatInput.trim(),
        time: timeStr,
        isModerator: true,
      },
    ]);
    setNewChatInput('');
  };

  // Open QR for broadcast
  const handleShowQr = (broadcast) => {
    const url = `https://youtube.com/live/${broadcast.id}`;
    setQrModalUrl(getQrCodeUrl(url, 220));
    setShowQrModal(true);
  };

  // Filtered broadcasts list
  const filteredBroadcasts = broadcasts.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const isLive = activeBroadcast?.status === 'live';
  const badgeInfo = activeBroadcast ? getStatusBadge(activeBroadcast.status) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Tv className="w-7 h-7 text-red-500" />
              라이브 관제탑 메인 대시보드
            </h1>
            {isDemoMode && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 데모 시뮬레이션
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            PC에서 방송을 생성·예약하고 섬네일을 올리면, 스마트폰 유튜브 앱에서 원터치로 송출할 수 있습니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenMobileGuide}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-700 text-xs font-semibold shadow-sm transition-all"
          >
            <Smartphone className="w-4 h-4" />
            폰에서 켜는 법 (가이드)
          </button>

          <button
            onClick={onOpenThumbnail}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition-all"
          >
            <ImageIcon className="w-4 h-4 text-pink-400" />
            섬네일 제작실
          </button>

          <button
            onClick={() => onOpenCreator()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            새 라이브 방송 개설
          </button>
        </div>
      </div>

      {/* Real YouTube Connection Status Banner */}
      {!settings?.isConnected || !settings?.token ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border border-red-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex-shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  데모 모드 동작중
                </span>
                <h4 className="text-sm font-bold text-white">
                  실제 YouTube 채널이 아직 연결되지 않았습니다
                </h4>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                스마트폰 유튜브 앱으로 켠 방송을 PC 관제탑에서 실시간 감지하고 제어하려면, 내 유튜브 채널을 연결하세요 (30초 완료).
              </p>
            </div>
          </div>

          <button
            onClick={openConnectModal}
            className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Radio className="w-4 h-4" />
            <span>내 유튜브 채널 연동하기 →</span>
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            {settings.channelAvatar ? (
              <img
                src={settings.channelAvatar}
                alt=""
                className="w-8 h-8 rounded-full border border-emerald-400 object-cover"
              />
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">실제 채널 연동됨:</span>
                <span className="font-extrabold text-emerald-300 text-sm">{settings.channelName}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                  LIVE 동기화중
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                구독자 {Number(settings.subscriberCount || 0).toLocaleString()}명 • 스마트폰과 PC가 실시간으로 연결되어 있습니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium border border-slate-700 transition-colors"
              title="유튜브 방송 목록 실시간 갱신"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-500' : ''}`} />
              <span>{isRefreshing ? '새로고침 중...' : '실시간 새로고침'}</span>
            </button>

            <button
              onClick={openConnectModal}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              연동 관리
            </button>
          </div>
        </div>
      )}

      {/* Main Active Live Command Center */}
      {activeBroadcast ? (
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 lg:p-8">
          {/* Subtle Ambient Glow */}
          {isLive && (
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: 16:9 Thumbnail / Live Screen (5 cols) */}
            <div className="lg:col-span-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">화면 모니터</span>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                  <button
                    onClick={() => setScreenMode('thumbnail')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      screenMode === 'thumbnail' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    섬네일 보기
                  </button>
                  <button
                    onClick={() => setScreenMode('player')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      screenMode === 'player' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    실시간 영상 (Live Player)
                  </button>
                </div>
              </div>

              <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950 group">
                {screenMode === 'player' ? (
                  <iframe
                    src={activeBroadcast.liveEmbedUrl || `https://www.youtube.com/embed/${activeBroadcast.id}?autoplay=1&mute=1`}
                    title="Live Stream Player"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : activeBroadcast.thumbnailUrl ? (
                  <img
                    src={activeBroadcast.thumbnailUrl}
                    alt={activeBroadcast.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950 p-4 text-center">
                    <ImageIcon className="w-10 h-10 mb-2 text-slate-700" />
                    <span className="text-xs">등록된 섬네일이 없습니다</span>
                    <button
                      onClick={onOpenThumbnail}
                      className="mt-2 text-xs text-red-400 hover:underline"
                    >
                      지금 섬네일 만들기 →
                    </button>
                  </div>
                )}

                {/* Status Badge Overlay */}
                <div className="absolute top-3 left-3 pointer-events-none">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md ${badgeInfo?.className}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${badgeInfo?.dotClass}`}></span>
                    {badgeInfo?.label}
                  </span>
                </div>

                {/* Duration Overlay when Live */}
                {isLive && (
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white font-mono text-xs font-bold border border-white/10 flex items-center gap-1.5 pointer-events-none">
                    <Clock className="w-3 h-3 text-red-500" />
                    {formatDuration(elapsedSeconds)}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Broadcast Info, Live Metrics & Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <span>{activeBroadcast.channelTitle || '미라클 스튜디오 TV'}</span>
                  <span>•</span>
                  <span>{formatKoreanDateTime(activeBroadcast.scheduledStartTime)}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {activeBroadcast.title}
                </h2>
                {activeBroadcast.description && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {activeBroadcast.description}
                  </p>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    실시간 시청자
                  </span>
                  <div className="text-lg font-black text-white mt-1">
                    {isLive ? `${activeBroadcast.viewerCount || 142}명` : '대기중'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    방송 진행 시간
                  </span>
                  <div className="text-lg font-mono font-bold text-white mt-1">
                    {isLive ? formatDuration(elapsedSeconds) : '00:00:00'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5 text-pink-400" />
                    좋아요 수
                  </span>
                  <div className="text-lg font-bold text-white mt-1">
                    {isLive ? `${activeBroadcast.likeCount || 38}개` : '0개'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    스트림 상태
                  </span>
                  <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    우수 (Good)
                  </div>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {/* Watch on YouTube Link */}
                <a
                  href={`https://youtube.com/live/${activeBroadcast.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/30 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  유튜브 시청 페이지
                </a>

                {/* Studio Live Control Room Deep Link */}
                {activeBroadcast.studioUrl && (
                  <a
                    href={activeBroadcast.studioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs sm:text-sm font-medium border border-slate-700 transition-colors"
                    title="YouTube 공식 스튜디오 라이브 관제실 열기"
                  >
                    <ExternalLink className="w-4 h-4" />
                    스튜디오 관제실
                  </a>
                )}

                {/* Live Chat Popout */}
                {activeBroadcast.chatPopoutUrl && (
                  <button
                    onClick={() => {
                      window.open(activeBroadcast.chatPopoutUrl, '_blank', 'width=450,height=650,resizable=yes');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs sm:text-sm font-medium border border-slate-700 transition-colors"
                    title="독립된 창으로 실시간 채팅 열기"
                  >
                    <MessageSquare className="w-4 h-4" />
                    채팅 팝업
                  </button>
                )}

                {/* Edit Metadata */}
                <button
                  onClick={() => onEditMetadata(activeBroadcast)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-sky-400" />
                  제목/설명 수정
                </button>

                {/* QR Code Quick Share */}
                <button
                  onClick={() => handleShowQr(activeBroadcast)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 transition-colors"
                  title="스마트폰 빠른 확인용 QR코드"
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  모바일 QR
                </button>

                {/* Status Toggle Controls */}
                {activeBroadcast.status === 'ready' && (
                  <button
                    onClick={() => onStatusChange(activeBroadcast.id, 'live')}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    송출 시작 (Go Live)
                  </button>
                )}

                {activeBroadcast.status === 'live' && (
                  <button
                    onClick={() => {
                      if (window.confirm('정말로 방송을 종료하시겠습니까?')) {
                        onStatusChange(activeBroadcast.id, 'complete');
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-700/30 transition-all"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    방송 종료 (End Stream)
                  </button>
                )}

                {activeBroadcast.status === 'complete' && (
                  <button
                    onClick={() => onStatusChange(activeBroadcast.id, 'ready')}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
                  >
                    대기 상태로 되돌리기
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 shadow-lg">
          <Tv className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">등록된 라이브 방송이 없습니다</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            상단의 ‘새 라이브 방송 개설’ 버튼을 눌러 첫 방송을 시작해 보세요.
          </p>
          <button
            onClick={() => onOpenCreator()}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold shadow-md shadow-red-600/20"
          >
            <Plus className="w-4 h-4" />새 방송 개설하기
          </button>
        </div>
      )}

      {/* Two Column Grid: Left Broadcasts Table (8 cols) & Right Live Chat Simulator (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Broadcasts Management List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Tv className="w-5 h-5 text-red-500" />
              방송 관리 목록 ({broadcasts.length}개)
            </h3>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium">
              {[
                { id: 'all', label: '전체' },
                { id: 'ready', label: '대기중' },
                { id: 'live', label: '송출중' },
                { id: 'complete', label: '종료' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    statusFilter === tab.id
                      ? 'bg-red-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="방송 제목 또는 내용 검색..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Broadcasts Cards */}
          <div className="space-y-3">
            {filteredBroadcasts.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800/80 text-slate-500 text-xs">
                일치하는 방송 내역이 없습니다.
              </div>
            ) : (
              filteredBroadcasts.map((item) => (
                <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                  >
                    {/* Thumbnail & Meta */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800">
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-700">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        <span
                          className={`absolute bottom-1 left-1 text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            item.status === 'live'
                              ? 'bg-red-600 text-white animate-pulse'
                              : item.status === 'ready'
                              ? 'bg-amber-500 text-black'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {item.status === 'live' ? 'LIVE' : item.status === 'ready' ? '예약' : '종료'}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-white text-sm truncate">{item.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span>{formatKoreanDateTime(item.scheduledStartTime)}</span>
                          <span>•</span>
                          <span className="text-slate-300">
                            {item.privacyStatus === 'public'
                              ? '전체공개'
                              : item.privacyStatus === 'unlisted'
                              ? '일부공개'
                              : '비공개'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
                      <button
                        onClick={() => onEditMetadata(item)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        title="방송 정보 수정"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleShowQr(item)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        title="모바일 QR"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <a
                        href={`https://youtube.com/live/${item.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                        title="유튜브에서 시청"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => {
                          if (window.confirm('이 방송을 삭제하시겠습니까?')) {
                            onDeleteBroadcast(item.id);
                          }
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Right: Live Chat Simulator Panel */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col h-[520px]">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-white">실시간 채팅 모니터링</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {isLive ? '실시간 연결됨' : '대기 모드'}
              </span>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-xl border ${
                    msg.isModerator
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className={`font-bold ${msg.isModerator ? 'text-red-400' : 'text-slate-300'}`}>
                      {msg.user} {msg.isModerator && '👑'}
                    </span>
                    <span className="text-[10px] text-slate-500">{msg.time}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed break-words">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* Send Message Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={newChatInput}
                onChange={(e) => setNewChatInput(e.target.value)}
                placeholder="채팅 메시지 작성 (운영자 공지)..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-6 max-w-sm w-full text-center text-slate-100 shadow-2xl">
            <h4 className="text-base font-bold text-white mb-1">스마트폰 빠른 연결 QR코드</h4>
            <p className="text-xs text-slate-400 mb-4">기본 카메라로 스캔하면 유튜브 라이브로 바로 이동합니다.</p>
            {qrModalUrl && (
              <div className="p-3 bg-white rounded-2xl inline-block shadow-lg mb-4">
                <img src={qrModalUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
              </div>
            )}
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
