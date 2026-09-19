// YouTube OAuth 2.0 & Google Identity Services (GIS) Handler

import { storage } from './storage.js';
import { youtubeApi } from './youtubeApi.js';

const YOUTUBE_SCOPES = 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.force-ssl';

/**
 * Dynamically load Google Identity Services script if not already present
 */
export function loadGoogleGsiScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.google?.accounts?.oauth2) return resolve(true);

    const existing = document.getElementById('google-gsi-client');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = (e) => reject(new Error('Google Identity Services 스크립트 로드 실패: ' + e));
    document.head.appendChild(script);
  });
}

export const youtubeAuth = {
  /**
   * Verify an access token by fetching the actual YouTube channel profile
   */
  async verifyAndSaveToken(token, existingSettings = {}) {
    if (!token || typeof token !== 'string') {
      throw new Error('유효한 토큰이 제공되지 않았습니다.');
    }

    const cleanToken = token.trim();
    // Fetch real channel details
    const channel = await youtubeApi.getChannelProfile(cleanToken);

    // Update settings in storage
    const updated = {
      ...existingSettings,
      token: cleanToken,
      isConnected: true,
      isDemoMode: false,
      channelName: channel.title,
      channelId: channel.id,
      channelAvatar: channel.avatar,
      channelCustomUrl: channel.customUrl,
      subscriberCount: channel.subscriberCount,
      videoCount: channel.videoCount,
      lastConnectedAt: new Date().toISOString(),
    };

    storage.saveSettings(updated);
    return updated;
  },

  /**
   * 1-Click Google Login Popup via Google Identity Services (GIS)
   */
  async loginWithGoogleGIS(clientId, currentSettings = {}) {
    if (!clientId) {
      throw new Error('Google OAuth Client ID가 필요합니다. 설정에서 Client ID를 입력하시거나, 토큰 직접 입력 방식을 사용해주세요.');
    }

    await loadGoogleGsiScript();

    if (!window.google?.accounts?.oauth2) {
      throw new Error('Google Identity Services SDK를 초기화할 수 없습니다.');
    }

    return new Promise((resolve, reject) => {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId.trim(),
          scope: YOUTUBE_SCOPES,
          callback: async (response) => {
            if (response.error) {
              return reject(new Error(response.error_description || response.error));
            }
            if (!response.access_token) {
              return reject(new Error('액세스 토큰을 받지 못했습니다.'));
            }

            try {
              const updatedSettings = await youtubeAuth.verifyAndSaveToken(
                response.access_token,
                { ...currentSettings, clientId }
              );
              resolve(updatedSettings);
            } catch (err) {
              reject(err);
            }
          },
          error_callback: (nonOAuthError) => {
            reject(new Error(nonOAuthError?.message || 'Google 로그인 창이 닫혔거나 차단되었습니다.'));
          },
        });

        // Request token popup
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        reject(err);
      }
    });
  },

  /**
   * Disconnect YouTube account and revert to demo mode
   */
  logout(currentSettings = {}) {
    const updated = {
      ...currentSettings,
      token: '',
      isConnected: false,
      isDemoMode: true,
      channelName: '미라클 스튜디오 TV',
      channelId: '',
      channelAvatar: '',
      channelCustomUrl: '',
      subscriberCount: '0',
    };
    storage.saveSettings(updated);
    return updated;
  },
};
