// YouTube Data API v3 Service & Hybrid Mock Handler

import { INITIAL_MOCK_BROADCASTS } from './mockData.js';
import { storage } from './storage.js';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export const youtubeApi = {
  /**
   * Fetch Live Broadcasts
   */
  async getBroadcasts(options = {}) {
    const { isDemoMode = true, token = '', apiKey: _apiKey = '' } = options;

    if (isDemoMode || !token) {
      // Return local stored or initial mock broadcasts
      const stored = storage.getBroadcasts();
      if (!stored) {
        storage.saveBroadcasts(INITIAL_MOCK_BROADCASTS);
        return INITIAL_MOCK_BROADCASTS;
      }
      return stored;
    }

    try {
      const response = await fetch(
        `${YOUTUBE_API_BASE}/liveBroadcasts?part=id,snippet,contentDetails,status&broadcastType=all&mine=true&maxResults=25`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `YouTube API Error: ${response.status}`);
      }

      const data = await response.json();
      const broadcasts = (data.items || []).map((item) => {
        let status = 'ready';
        const ytStatus = item.status?.lifeCycleStatus;
        if (ytStatus === 'live' || ytStatus === 'liveStarting') {
          status = 'live';
        } else if (ytStatus === 'complete' || ytStatus === 'revoked') {
          status = 'complete';
        }

        return {
          id: item.id,
          title: item.snippet?.title || '제목 없음',
          description: item.snippet?.description || '',
          status: status,
          scheduledStartTime: item.snippet?.scheduledStartTime,
          actualStartTime: item.snippet?.actualStartTime,
          actualEndTime: item.snippet?.actualEndTime,
          privacyStatus: item.status?.privacyStatus || 'public',
          viewerCount: 0,
          likeCount: 0,
          streamHealth: 'good',
          thumbnailUrl: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
          channelTitle: item.snippet?.channelTitle || '내 채널',
        };
      });

      return broadcasts;
    } catch (err) {
      console.warn('Failed to fetch from YouTube API, falling back to local cache:', err);
      return storage.getBroadcasts() || INITIAL_MOCK_BROADCASTS;
    }
  },

  /**
   * Create a new Live Broadcast
   */
  async createBroadcast(broadcastData, options = {}) {
    const { isDemoMode = true, token = '' } = options;

    const newId = isDemoMode ? `yt_live_${Date.now()}` : null;
    const now = new Date();

    if (isDemoMode || !token) {
      const newBroadcast = {
        id: newId,
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
        channelTitle: options.channelName || '미라클 스튜디오 TV',
      };

      const current = storage.getBroadcasts() || INITIAL_MOCK_BROADCASTS;
      const updated = [newBroadcast, ...current];
      storage.saveBroadcasts(updated);
      return newBroadcast;
    }

    // Real YouTube API Live Broadcasts Insert
    try {
      const body = {
        snippet: {
          title: broadcastData.title,
          description: broadcastData.description,
          scheduledStartTime: broadcastData.scheduledStartTime,
        },
        status: {
          privacyStatus: broadcastData.privacyStatus || 'public',
          selfDeclaredMadeForKids: false,
        },
        contentDetails: {
          enableAutoStart: broadcastData.enableAutoStart ?? true,
          enableAutoStop: broadcastData.enableAutoStop ?? false,
          latencyPreference: broadcastData.latency || 'ultraLow',
        },
      };

      const res = await fetch(`${YOUTUBE_API_BASE}/liveBroadcasts?part=snippet,status,contentDetails`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Failed to create broadcast: ${res.status}`);
      }

      const created = await res.json();
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
   * Upload Thumbnail
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
      // Update local storage
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
        throw new Error(err.error?.message || `Thumbnail upload failed: ${res.status}`);
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
   * Transition broadcast status (e.g. ready -> live -> complete)
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
        throw new Error(err.error?.message || `Status transition failed: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Failed to transition broadcast status:', error);
      throw error;
    }
  },

  /**
   * Update broadcast metadata (title, description, privacy)
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
        await fetch(`${YOUTUBE_API_BASE}/liveBroadcasts?part=snippet,status`, {
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
            },
            status: {
              privacyStatus: updates.privacyStatus,
            },
          }),
        });
      } catch (err) {
        console.warn('Failed to update metadata via API:', err);
      }
    }

    return updated.find((b) => b.id === broadcastId);
  },

  /**
   * Delete broadcast
   */
  async deleteBroadcast(broadcastId, options = {}) {
    const { isDemoMode = true, token = '' } = options;

    const broadcasts = storage.getBroadcasts() || INITIAL_MOCK_BROADCASTS;
    const filtered = broadcasts.filter((b) => b.id !== broadcastId);
    storage.saveBroadcasts(filtered);

    if (!isDemoMode && token) {
      try {
        await fetch(`${YOUTUBE_API_BASE}/liveBroadcasts?id=${broadcastId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.warn('Failed to delete broadcast via API:', err);
      }
    }

    return true;
  },
};
