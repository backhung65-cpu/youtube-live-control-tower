// LocalStorage service with in-memory fallback for YouTube Live Control Tower

const STORAGE_KEYS = {
  PRESETS: 'yt_control_presets_v1',
  BROADCASTS: 'yt_control_broadcasts_v1',
  ACTIVE_BROADCAST_ID: 'yt_control_active_id_v1',
  SETTINGS: 'yt_control_settings_v1',
  SAVED_THUMBNAIL: 'yt_control_thumbnail_cache_v1',
};

// In-memory fallback for node/test/restricted environments
const memoryStorage = new Map();

function safeGet(key) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {
    // ignore
  }
  return memoryStorage.get(key) || null;
}

function safeSet(key, val) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, val);
      return;
    }
  } catch (e) {
    // ignore
  }
  memoryStorage.set(key, val);
}

function safeRemove(key) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
  } catch (e) {
    // ignore
  }
  memoryStorage.delete(key);
}

// Initial default presets tailored for Korean church & live broadcasting
export const DEFAULT_PRESETS = [
  {
    id: 'preset-sunday-service',
    name: '주일 대예배 (11:00)',
    titleTemplate: '[{DATE}] 주일 대예배 실시간 생중계 - {설교제목}',
    descriptionTemplate: `[주일 대예배 실시간 온라인 생중계]

일시: {DATE} 오전 11:00
성경본문: {성경본문}
설교제목: {설교제목}
설교자: {설교자}

은혜롭고 평안한 예배의 시간 되시기를 축복합니다.

* 헌금 안내: OO은행 000-000-000000 (OO교회)
* 홈페이지: https://example.com`,
    privacyStatus: 'public',
    category: '29',
    tags: ['주일예배', '온라인예배', '실시간라이브', '주일설교', '교회라이브'],
    thumbnailTheme: 'midnight_navy',
    badgeText: '주일 대예배',
    speaker: '담임목사',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'preset-wednesday-prayer',
    name: '수요 기도회 (19:30)',
    titleTemplate: '[{DATE}] 수요 성경강해 및 뜨거운 기도회 - {설교제목}',
    descriptionTemplate: `[수요 말씀 및 중보기도회 실시간 라이브]

일시: {DATE} 저녁 7:30
성경본문: {성경본문}
말씀: {설교제목}

말씀과 기도로 하나님의 임재를 경험하는 시간 되시기를 기도합니다.`,
    privacyStatus: 'public',
    category: '29',
    tags: ['수요예배', '수요기도회', '성경강해', '중보기도'],
    thumbnailTheme: 'burgundy_wine',
    badgeText: '수요 기도회',
    speaker: '부목사',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'preset-friday-night',
    name: '금요 성령집회 (20:30)',
    titleTemplate: '[{DATE}] 금요 심야 성령대망 찬양집회 LIVE',
    descriptionTemplate: `[금요 성령집회 & 찬양과 기도]

찬양과 기도로 부르짖는 은혜의 밤에 여러분을 초대합니다.
실시간 채팅으로 기도제목을 남겨주시면 함께 중보합니다.`,
    privacyStatus: 'public',
    category: '29',
    tags: ['금요철야', '찬양집회', '금요기도회', '성령대망회', '중보기도'],
    thumbnailTheme: 'deep_purple',
    badgeText: '금요 성령집회',
    speaker: '찬양팀 & 교역자',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'preset-special-event',
    name: '특별 부흥성회 / 세미나',
    titleTemplate: '[{DATE}] 특별 부흥성회 실시간 생중계',
    descriptionTemplate: `[2026 특별 부흥성회 & 세미나]

주제: 다시 일어나는 믿음의 공동체
강사: 초청 강사

실시간 온라인 라이브 스트리밍입니다.`,
    privacyStatus: 'public',
    category: '29',
    tags: ['특별부흥회', '세미나', '특별생중계', '온라인라이브'],
    thumbnailTheme: 'gold_amber',
    badgeText: '특별 집회 LIVE',
    speaker: '초청강사',
    createdAt: new Date().toISOString(),
  },
];

// Initial default settings
export const DEFAULT_SETTINGS = {
  isDemoMode: true,
  isConnected: false,
  token: '',
  apiKey: '',
  clientId: '',
  channelName: '미라클 스튜디오 TV',
  channelId: 'UC_MOCK_CHANNEL_12345',
  channelAvatar: '',
  channelCustomUrl: '',
  subscriberCount: '0',
  videoCount: '0',
  defaultPrivacy: 'public',
  latencyPreference: 'ultraLow',
  enableAutoStart: true,
  enableAutoStop: false,
  autoRefresh: true,
};

export const storage = {
  getPresets: () => {
    try {
      const data = safeGet(STORAGE_KEYS.PRESETS);
      return data ? JSON.parse(data) : DEFAULT_PRESETS;
    } catch {
      return DEFAULT_PRESETS;
    }
  },

  savePresets: (presets) => {
    try {
      safeSet(STORAGE_KEYS.PRESETS, JSON.stringify(presets));
    } catch (e) {
      console.error('Failed to save presets:', e);
    }
  },

  getSettings: () => {
    try {
      const data = safeGet(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings) => {
    try {
      safeSet(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  getBroadcasts: () => {
    try {
      const data = safeGet(STORAGE_KEYS.BROADCASTS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveBroadcasts: (broadcasts) => {
    try {
      safeSet(STORAGE_KEYS.BROADCASTS, JSON.stringify(broadcasts));
    } catch (e) {
      console.error('Failed to save broadcasts:', e);
    }
  },

  getActiveBroadcastId: () => {
    return safeGet(STORAGE_KEYS.ACTIVE_BROADCAST_ID) || null;
  },

  setActiveBroadcastId: (id) => {
    if (id) {
      safeSet(STORAGE_KEYS.ACTIVE_BROADCAST_ID, id);
    } else {
      safeRemove(STORAGE_KEYS.ACTIVE_BROADCAST_ID);
    }
  },

  getCachedThumbnail: () => {
    return safeGet(STORAGE_KEYS.SAVED_THUMBNAIL) || null;
  },

  setCachedThumbnail: (dataUrl) => {
    try {
      safeSet(STORAGE_KEYS.SAVED_THUMBNAIL, dataUrl);
    } catch (e) {
      console.warn('Failed to cache thumbnail data URL in storage (likely size limit):', e);
    }
  },
};
