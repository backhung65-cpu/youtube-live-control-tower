// YouTube Data API v3 Service & Hybrid Mock Handler

import { INITIAL_MOCK_BROADCASTS } from './mockData.js';
import { storage } from './storage.js';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export const youtubeApi = {
  /**
   * Fetch Real YouTube Channel Profile (Title, Avatar, Subscribers, ID)
   */
  async getChannelProfile(token) {
    if (!token) throw new Error('Google OAuth 인증 토큰이 필요합니다.');

    const res = await fetch(
      `${YOUTUBE_API_BASE}/channels?part=snippet,statistics&mine=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.error?.message || `YouTube API 응답 오류: ${res.status}`;
      if (res.status === 401) {
        throw new Error('Google 인증 토큰이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.');
      }
      throw new Error(msg);
    }

    const data = await res.json();
    if (!data.items || data.items.length === 0) {
      throw new Error('로그인한 구글 계정에 개설된 YouTube 채널이 없습니다. 먼저 유튜브 채널을 생성해주세요.');
    }

    const item = data.items[0];
    return {
      id: item.id,
      title: item.snippet?.title || '내 채널',
      customUrl: item.snippet?.customUrl || '',
      avatar: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
      subscriberCount: item.statistics?.subscriberCount || '0',
      videoCount: item.statistics?.videoCount || '0',
    };
  },

  /**
   * Fetch Live Broadcasts (Real YouTube or Local Demo)
   */
  async getBroadcasts(options = {}) {
    const { isDemoMode = true, token = '' } = options;

    if (isDemoMode || !token) {
      const stored = storage.getBroadcasts();
      if (!stored) {
        storage.saveBroadcasts(INITIAL_MOCK_BROADCASTS);
        return INITIAL_MOCK_BROADCASTS;
      }
      return stored;
    }

    try {
      const response = await fetch(
        `${YOUTUBE_API_BASE}/liveBroadcasts?part=id,snippet,contentDetails,status&broadcastType=all&mine=true&maxResults=30`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `YouTube API 오류: ${response.status}`);
      }

      const data = await response.json();
      const items = data.items || [];

      // If we have broadcasts, fetch live viewer counts and statistics from videos endpoint
      const videoIds = items.map((i) => i.id).filter(Boolean);
      let videoStatsMap = {};

      if (videoIds.length > 0) {
        try {
          const videoRes = await fetch(
            `${YOUTUBE_API_BASE}/videos?part=liveStreamingDetails,statistics&id=${videoIds.join(',')}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              },
            }
          );
          if (videoRes.ok) {
            const videoData = await videoRes.json();
            for (const v of videoData.items || []) {
              videoStatsMap[v.id] = {
                concurrentViewers: parseInt(v.liveStreamingDetails?.concurrentViewers || '0', 10),
                likeCount: parseInt(v.statistics?.likeCount || '0', 10),
              };
            }
          }
        } catch (e) {
          console.warn('동영상 실시간 통계 조회 건너뜀:', e);
        }
      }

      const broadcasts = items.map((item) => {
        let status = 'ready';
        const ytStatus = item.status?.lifeCycleStatus;
        if (ytStatus === 'live' || ytStatus === 'liveStarting') {
          status = 'live';
        } else if (ytStatus === 'complete' || ytStatus === 'revoked') {
          status = 'complete';
        }

        const stats = videoStatsMap[item.id] || {};

        return {
          id: item.id,
          title: item.snippet?.title || '제목 없음',
          description: item.snippet?.description || '',
          status: status,
          scheduledStartTime: item.snippet?.scheduledStartTime,
          actualStartTime: item.snippet?.actualStartTime,
          actualEndTime: item.snippet?.actualEndTime,
          privacyStatus: item.status?.privacyStatus || 'public',
          viewerCount: stats.concurrentViewers || 0,
          likeCount: stats.likeCount || 0,
          streamHealth: 'good',
          thumbnailUrl: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
          channelTitle: item.snippet?.channelTitle || '내 채널',
          liveChatId: item.snippet?.liveChatId || '',
          boundStreamId: item.contentDetails?.boundStreamId || '',
          studioUrl: `https://studio.youtube.com/video/${item.id}/livestreaming`,
          watchUrl: `https://youtube.com/live/${item.id}`,
          chatPopoutUrl: `https://www.youtube.com/live_chat?v=${item.id}&is_popout=1`,
        };
      });

      // Save real cache to local storage
      storage.saveBroadcasts(broadcasts);
      return broadcasts;
    } catch (err) {
      console.warn('YouTube API 호출 실패, 로컬 캐시 사용:', err);
      // If unauthorized, notify caller
      if (err.message?.includes('401') || err.message?.includes('token')) {
        throw err;
      }
      return storage.getBroadcasts() || INITIAL_MOCK_BROADCASTS;
    }
  },

  /**
   * Create a new Live Broadcast on YouTube (or Demo)
   */
  async createBroadcast(broadcastData, options = {}) {
    const { isDemoMode = true, token = '', channelName = '내 채널' } = options;
    const now = new Date();

    if (isDemoMode || !token) {
      const newBroadcast = {
        id: `yt_live_${Date.now()}`,
        title: broadcastData.title,
        description: broadcastData.description || '',
        status: 'ready',
        scheduledStartTime: broadcastData.scheduledStartTime || new Date(now.getTime() + 1000 * 60 * 30).toISOString(),
        actualStartTime: null,
        actualEndTime: null,
        privacyStatus: broadcastData.privacyStatus || 'public',
        viewerCount: 0,
        likeCount: 0,
        streamHealth: 'good',
        latency: broadcastData.latency || 'ultraLow',
        thumbnailUrl: broadcastData.thumbnailUrl || '',
        streamKey: `rtmp-stream-key-${Math.random().toString(36).substring(2, 9)}`,
        rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
        channelTitle: channelName,
        studioUrl: `https://studio.youtube.com/video/demo/livestreaming`,
        watchUrl: `https://youtube.com/live/demo`,
      };

      const current = storage.getBroadcasts() || INITIAL_MOCK_BROADCASTS;
      const updated = [newBroadcast, ...current];
      storage.saveBroadcasts(updated);
      return newBroadcast;
    }

    // Real YouTube API: 1) liveBroadcasts.insert -> 2) liveStreams.insert -> 3) liveBroadcasts.bind
    try {
      const scheduledTime = broadcastData.scheduledStartTime || new Date(now.getTime() + 1000 * 60 * 15).toISOString();

      const broadcastBody = {
        snippet: {
          title: broadcastData.title,
          description: broadcastData.description || '',
          scheduledStartTime: scheduledTime,
        },
        status: {
          privacyStatus: broadcastData.privacyStatus || 'public',
          selfDeclaredMadeForKids: false,
        },
        contentDetails: {
          enableAutoStart: broadcastData.enableAutoStart ?? true,
          enableAutoStop: broadcastData.enableAutoStop ?? false,
          latencyPreference: broadcastData.latency || 'ultraLow',
          enableDvr: true,
          recordFromStart: true,
        },
      };

      const res = await fetch(`${YOUTUBE_API_BASE}/liveBroadcasts?part=snippet,status,contentDetails`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(broadcastBody),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `유튜브 방송 생성 실패 (${res.status})`);
      }

      const created = await res.json();
      let streamKey = '';
      let rtmpUrl = 'rtmp://a.rtmp.youtube.com/live2';

      // Attempt to create RTMP stream & bind it
      try {
        const streamRes = await fetch(`${YOUTUBE_API_BASE}/liveStreams?part=snippet,cdn`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            snippet: {
              title: `${broadcastData.title} - RTMP 송출 스트림`,
            },
            cdn: {
              frameRate: 'variable',
              ingestionType: 'rtmp',
              resolution: 'variable',
            },
          }),
        });

        if (streamRes.ok) {
          const streamData = await streamRes.json();
          streamKey = streamData.cdn?.ingestionInfo?.streamName || '';
          rtmpUrl = streamData.cdn?.ingestionInfo?.ingestionAddress || rtmpUrl;

          // Bind broadcast to stream
          await fetch(
            `${YOUTUBE_API_BASE}/liveBroadcasts/bind?id=${created.id}&part=id,contentDetails&streamId=${streamData.id}`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      } catch (streamErr) {
        console.warn('스트림 키 바인딩 경고 (모바일 앱 송출에는 영향 없음):', streamErr);
      }

      const broadcast = {
        id: created.id,
        title: created.snippet.title,
        description: created.snippet.description,
        status: 'ready',
        scheduledStartTime: created.snippet.scheduledStartTime,
        privacyStatus: created.status.privacyStatus,
        viewerCount: 0,
        likeCount: 0,
        streamHealth: 'good',
        thumbnailUrl: '',
        channelTitle: created.snippet.channelTitle,
        streamKey: streamKey,
        rtmpUrl: rtmpUrl,
        studioUrl: `https://studio.youtube.com/video/${created.id}/livestreaming`,
        watchUrl: `https://youtube.com/live/${created.id}`,
        chatPopoutUrl: `https://www.youtube.com/live_chat?v=${created.id}&is_popout=1`,
      };

      // Also save to local storage cache
      const current = storage.getBroadcasts() || [];
      storage.saveBroadcasts([broadcast, ...current]);
      return broadcast;
    } catch (error) {
      console.error('YouTube API createBroadcast error:', error);
      throw error;
    }
  },

  /**
   * Upload Custom Thumbnail directly to YouTube Live Broadcast
   */
  async uploadThumbnail(broadcastId, imageBlobOrDataUrl, options = {}) {
    const { isDemoMode = true, token = '' } = options;

    let dataUrl = typeof imageBlobOrDataUrl === 'string' ? imageBlobOrDataUrl : null;

    if (!dataUrl && imageBlobOrDataUrl instanceof Blob) {
      dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(imageBlobOrDataUrl);
      });
    }

    if (isDemoMode || !token) {
      const broadcasts = storage.getBroadcasts() || INITIAL_MOCK_BROADCASTS;
      const updated = broadcasts.map((b) => {
        if (b.id === broadcastId) {
          return { ...b, thumbnailUrl: dataUrl };
        }
        return b;
      });
      storage.saveBroadcasts(updated);
      return { success: true, thumbnailUrl: dataUrl };
    }

    try {
      let blob = imageBlobOrDataUrl;
      if (typeof imageBlobOrDataUrl === 'string') {
        const res = await fetch(imageBlobOrDataUrl);
        blob = await res.blob();
      }

      const res = await fetch(
        `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${broadcastId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': blob.type || 'image/png',
          },
          body: blob,
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `섬네일 업로드 실패: ${res.status}`);
      }

      const data = await res.json();
      const uploadedUrl = data.items?.[0]?.default?.url || dataUrl;

      const broadcasts = storage.getBroadcasts() || [];
      const updated = broadcasts.map((b) => {
        if (b.id === broadcastId) {
          return { ...b, thumbnailUrl: uploadedUrl };
        }
        return b;
      });
      storage.saveBroadcasts(updated);

      return { success: true, thumbnailUrl: uploadedUrl };
    } catch (error) {
      console.error('Failed to upload thumbnail:', error);
      throw error;
    }
  },

  /**
   * Transition Broadcast Lifecycle (ready -> live -> complete)
   */
  async transitionBroadcast(broadcastId, newStatus, options = {}) {
    const { isDemoMode = true, token = '' } = options;

    if (isDemoMode || !token) {
      const broadcasts = storage.getBroadcasts() || INITIAL_MOCK_BROADCASTS;
      const updated = broadcasts.map((b) => {
        if (b.id === broadcastId) {
          return {
            ...b,
            status: newStatus,
            actualStartTime: newStatus === 'live' ? new Date().toISOString() : b.actualStartTime,
            actualEndTime: newStatus === 'complete' ? new Date().toISOString() : b.actualEndTime,
            viewerCount: newStatus === 'live' ? Math.floor(Math.random() * 80) + 120 : b.viewerCount,
          };
        }
        return b;
      });
      storage.saveBroadcasts(updated);
      return updated.find((b) => b.id === broadcastId);
    }

    try {
      const broadcastStatus = newStatus === 'live' ? 'live' : newStatus === 'complete' ? 'complete' : 'testing';
      const res = await fetch(
        `${YOUTUBE_API_BASE}/liveBroadcasts/transition?broadcastStatus=${broadcastStatus}&id=${broadcastId}&part=status`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `상태 변경 실패 (${res.status})`);
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Failed to transition broadcast status:', error);
      throw error;
    }
  },

  /**
   * Real-time metadata update (Title & Description) on YouTube
   */
  async updateBroadcast(broadcastId, updates, options = {}) {
    const { isDemoMode = true, token = '' } = options;

    const broadcasts = storage.getBroadcasts() || INITIAL_MOCK_BROADCASTS;
    const updated = broadcasts.map((b) => {
      if (b.id === broadcastId) {
        return { ...b, ...updates };
      }
      return b;
    });
    storage.saveBroadcasts(updated);

    if (!isDemoMode && token) {
      try {
        const res = await fetch(`${YOUTUBE_API_BASE}/liveBroadcasts?part=snippet,status`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: broadcastId,
            snippet: {
              title: updates.title,
              description: updates.description,
              scheduledStartTime: updates.scheduledStartTime,
            },
            status: {
              privacyStatus: updates.privacyStatus,
            },
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || '실시간 방송 정보 업데이트 실패');
        }
      } catch (err) {
        console.error('Failed to update metadata via API:', err);
        throw err;
      }
    }

    return updated.find((b) => b.id === broadcastId);
  },

  /**
   * Delete Broadcast from YouTube
   */
  async deleteBroadcast(broadcastId, options = {}) {
    const { isDemoMode = true, token = '' } = options;

    const broadcasts = storage.getBroadcasts() || INITIAL_MOCK_BROADCASTS;
    const filtered = broadcasts.filter((b) => b.id !== broadcastId);
    storage.saveBroadcasts(filtered);

    if (!isDemoMode && token) {
      try {
        const res = await fetch(`${YOUTUBE_API_BASE}/liveBroadcasts?id=${broadcastId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok && res.status !== 404) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || '방송 삭제 실패');
        }
      } catch (err) {
        console.error('Failed to delete broadcast via API:', err);
        throw err;
      }
    }

    return true;
  },

  /**
   * Fetch Live Chat Messages from YouTube
   */
  async getLiveChatMessages(liveChatId, token) {
    if (!liveChatId || !token) return [];
    try {
      const res = await fetch(
        `${YOUTUBE_API_BASE}/liveChat/messages?liveChatId=${liveChatId}&part=snippet,authorDetails&maxResults=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.items || []).map((msg) => ({
        id: msg.id,
        user: msg.authorDetails?.displayName || '시청자',
        avatar: msg.authorDetails?.profileImageUrl,
        isModerator: msg.authorDetails?.isChatModerator || msg.authorDetails?.isChatOwner,
        message: msg.snippet?.displayMessage || '',
        time: new Date(msg.snippet?.publishedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      }));
    } catch (e) {
      console.warn('Failed to fetch live chat:', e);
      return [];
    }
  },

  /**
   * Send Live Chat Message to YouTube
   */
  async sendLiveChatMessage(liveChatId, messageText, token) {
    if (!liveChatId || !token || !messageText.trim()) return false;
    try {
      const res = await fetch(`${YOUTUBE_API_BASE}/liveChat/messages?part=snippet`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            liveChatId: liveChatId,
            type: 'textMessageEvent',
            textMessageDetails: {
              messageText: messageText.trim(),
            },
          },
        }),
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to send live chat message:', e);
      return false;
    }
  },
};
