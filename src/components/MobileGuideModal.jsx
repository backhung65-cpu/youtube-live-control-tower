import React, { useState } from 'react';
import { getQrCodeUrl } from '../utils/qrHelper';
import { 
  X, 
  Smartphone, 
  Calendar, 
  Play, 
  ExternalLink, 
  Copy, 
  Check, 
  Layers
} from './icons';

export default function MobileGuideModal({ isOpen, onClose, activeBroadcast }) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const streamKey = activeBroadcast?.streamKey || 'rtmp-stream-key-demo-korea-001';
  const rtmpUrl = activeBroadcast?.rtmpUrl || 'rtmp://a.rtmp.youtube.com/live2';
  const youtubeLiveUrl = activeBroadcast?.id 
    ? `https://youtube.com/live/${activeBroadcast.id}` 
    : 'https://youtube.com';

  const qrDataUrl = getQrCodeUrl(youtubeLiveUrl, 180);

  if (!isOpen) return null;

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                핸드폰에서 라이브 시작하는 3단계 가이드
              </h3>
              <p className="text-xs text-slate-400">PC에서 방송을 예약하면 스마트폰 유튜브 앱에서 1초 만에 켤 수 있습니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Steps Visual Flow */}
        <div className="my-6 space-y-4">
          {/* Step 1 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-red-600/20 text-red-400 font-bold border border-red-500/30 text-sm">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white text-sm">스마트폰에서 유튜브 앱 실행</h4>
              <p className="text-xs text-slate-400 mt-1">
                스마트폰의 공식 <strong className="text-slate-200">YouTube 앱</strong>을 열고, 화면 하단 중앙의 <span className="inline-block px-1.5 py-0.5 rounded bg-slate-800 text-red-400 font-bold border border-slate-700 text-xs">+ (만들기)</span> 버튼을 터치한 뒤 <span className="text-slate-200 font-medium">‘실시간 스트리밍 시작’</span>을 선택합니다.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 text-sm">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white text-sm flex items-center gap-1.5">
                우측 상단 캘린더 아이콘 <Calendar className="w-3.5 h-3.5 text-amber-400" /> 터치 (예약 목록)
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                화면 오른쪽 위에 있는 <strong className="text-amber-300">달력(예약) 아이콘</strong>을 터치하면, 방금 PC 관제탑에서 생성한 방송 제목과 섬네일이 나타납니다.
              </p>
              {activeBroadcast && (
                <div className="mt-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="truncate font-medium text-slate-200 pr-2">
                    🎯 {activeBroadcast.title}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold flex-shrink-0">
                    대기중
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 text-sm">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white text-sm flex items-center gap-1.5">
                방송 선택 후 [라이브 스트리밍 시작] 터치! <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                방송을 터치하고 스마트폰 카메라 각도를 맞춘 후 하단의 <strong className="text-emerald-400">‘라이브 스트리밍 시작’</strong> 버튼을 누르면 즉시 전 세계로 실시간 방송이 송출됩니다! PC 화면에서 실시간 경과 시간과 시청자를 모니터링하세요.
              </p>
            </div>
          </div>
        </div>

        {/* QR Code & Direct Link */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
          {qrDataUrl && (
            <div className="p-2 rounded-xl bg-white flex-shrink-0 shadow-lg">
              <img src={qrDataUrl} alt="Broadcast QR Code" className="w-28 h-28" />
            </div>
          )}
          <div className="flex-1 text-center sm:text-left">
            <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider">
              스마트폰 빠른 확인 QR코드
            </span>
            <h5 className="font-bold text-white text-sm mt-0.5">
              스마트폰 기본 카메라로 QR을 스캔하세요
            </h5>
            <p className="text-xs text-slate-400 mt-1">
              스캔 시 유튜브 라이브 페이지로 바로 이동하여 방송 화면과 실시간 채팅 상태를 확인할 수 있습니다.
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <a
                href={youtubeLiveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs shadow-md transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                유튜브 라이브 페이지 열기
              </a>
            </div>
          </div>
        </div>

        {/* Alternative: RTMP Key for Third-party Apps (PRISM, Larix) */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              대안: 프리즘 라이브(PRISM) / Larix 앱으로 송출할 때 (RTMP)
            </span>
            <span className="text-[10px] text-slate-500">고화질 맞춤 설정용</span>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
              <span className="text-slate-400 truncate pr-2">RTMP URL: {rtmpUrl}</span>
              <button
                onClick={() => handleCopy(rtmpUrl, 'url')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 flex-shrink-0 transition-colors"
              >
                {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedUrl ? '복사됨' : '복사'}
              </button>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
              <span className="text-slate-400 truncate pr-2">스트림 키: {streamKey}</span>
              <button
                onClick={() => handleCopy(streamKey, 'key')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 flex-shrink-0 transition-colors"
              >
                {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedKey ? '복사됨' : '복사'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
}
