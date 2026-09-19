import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ThumbnailStudio from './components/ThumbnailStudio';
import PresetManager from './components/PresetManager';
import BroadcastCreatorModal from './components/BroadcastCreatorModal';
import MobileGuideModal from './components/MobileGuideModal';
import SettingsModal from './components/SettingsModal';
import LiveMetadataModal from './components/LiveMetadataModal';
import YouTubeConnectModal from './components/YouTubeConnectModal';
import { youtubeApi } from './services/youtubeApi';
import { storage, DEFAULT_PRESETS, DEFAULT_SETTINGS } from './services/storage';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'thumbnail' | 'presets'

  // Application State
  const [settings, setSettings] = useState(storage.getSettings());
  const [isDemoMode, setIsDemoMode] = useState(settings?.isDemoMode ?? true);
  const [presets, setPresets] = useState(storage.getPresets());
  const [broadcasts, setBroadcasts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isMobileGuideOpen, setIsMobileGuideOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [creatorInitialData, setCreatorInitialData] = useState(null);
  const [selectedBroadcastForEdit, setSelectedBroadcastForEdit] = useState(null);

  // Load broadcasts
  const loadBroadcasts = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true);
    try {
      const data = await youtubeApi.getBroadcasts({
        isDemoMode: settings.isDemoMode,
        apiKey: settings.apiKey,
        token: settings.token,
      });
      setBroadcasts(data);
    } catch (e) {
      console.error('Failed to load broadcasts:', e);
    } finally {
      if (showIndicator) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  }, [settings.isDemoMode, settings.apiKey, settings.token]);

  useEffect(() => {
    loadBroadcasts();
  }, [loadBroadcasts]);

  // Background auto-refresh polling when connected to real YouTube (every 15 seconds)
  useEffect(() => {
    if (!settings.isConnected || !settings.token || settings.isDemoMode) return;

    const timer = setInterval(() => {
      loadBroadcasts(false);
    }, 15000);

    return () => clearInterval(timer);
  }, [settings.isConnected, settings.token, settings.isDemoMode, loadBroadcasts]);

  // Sync isDemoMode changes
  const handleToggleDemoMode = (newVal) => {
    setIsDemoMode(newVal);
    const updatedSettings = { ...settings, isDemoMode: newVal };
    setSettings(updatedSettings);
    storage.saveSettings(updatedSettings);
  };

  // Find active broadcast
  const activeBroadcast = broadcasts.find((b) => b.status === 'live') || broadcasts.find((b) => b.status === 'ready') || broadcasts[0] || null;

  // Broadcast creation handler
  const handleCreateBroadcast = async (formData) => {
    const created = await youtubeApi.createBroadcast(formData, {
      isDemoMode,
      token: settings.token,
      channelName: settings.channelName,
    });

    // If thumbnail provided, upload it as well
    if (formData.thumbnailUrl) {
      await youtubeApi.uploadThumbnail(created.id, formData.thumbnailUrl, {
        isDemoMode,
        token: settings.token,
      });
    }

    await loadBroadcasts();
    // Open mobile guide modal so user knows how to start on phone!
    setIsMobileGuideOpen(true);
  };

  // Thumbnail upload handler from Thumbnail Studio
  const handleUploadThumbnailToBroadcast = async (broadcastId, dataUrl) => {
    await youtubeApi.uploadThumbnail(broadcastId, dataUrl, {
      isDemoMode,
      token: settings.token,
    });
    await loadBroadcasts();
  };

  // Status transition handler (ready <-> live <-> complete)
  const handleStatusChange = async (broadcastId, newStatus) => {
    await youtubeApi.transitionBroadcast(broadcastId, newStatus, {
      isDemoMode,
      token: settings.token,
    });
    await loadBroadcasts();
  };

  // Delete broadcast handler
  const handleDeleteBroadcast = async (broadcastId) => {
    await youtubeApi.deleteBroadcast(broadcastId, {
      isDemoMode,
      token: settings.token,
    });
    await loadBroadcasts();
  };

  // Metadata edit handler
  const handleSaveMetadata = async (broadcastId, updates) => {
    await youtubeApi.updateBroadcast(broadcastId, updates, {
      isDemoMode,
      token: settings.token,
    });
    await loadBroadcasts();
  };

  // Preset update handler
  const handlePresetsChange = (newPresets) => {
    setPresets(newPresets);
    storage.savePresets(newPresets);
  };

  // Use Preset to open creator modal
  const handleUsePreset = (preset) => {
    setCreatorInitialData({
      presetId: preset.id,
      title: preset.titleTemplate,
      description: preset.descriptionTemplate,
    });
    setIsCreatorOpen(true);
  };

  // Create broadcast from Thumbnail Studio
  const handleCreateWithThumbnail = (data) => {
    setCreatorInitialData(data);
    setIsCreatorOpen(true);
  };

  // Settings save handler
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    setIsDemoMode(newSettings.isDemoMode);
    storage.saveSettings(newSettings);
    loadBroadcasts();
  };

  // Reset data handler
  const handleResetData = () => {
    storage.savePresets(DEFAULT_PRESETS);
    storage.saveSettings(DEFAULT_SETTINGS);
    storage.saveBroadcasts(null);
    setPresets(DEFAULT_PRESETS);
    setSettings(DEFAULT_SETTINGS);
    setIsDemoMode(true);
    loadBroadcasts();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-red-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDemoMode={isDemoMode}
        setIsDemoMode={handleToggleDemoMode}
        openSettings={() => setIsSettingsOpen(true)}
        openMobileGuide={() => setIsMobileGuideOpen(true)}
        activeBroadcast={activeBroadcast}
        settings={settings}
        openConnectModal={() => setIsConnectModalOpen(true)}
        onRefresh={() => loadBroadcasts(true)}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <Dashboard
            broadcasts={broadcasts}
            onOpenCreator={(data) => {
              setCreatorInitialData(data || null);
              setIsCreatorOpen(true);
            }}
            onOpenThumbnail={() => setActiveTab('thumbnail')}
            onOpenMobileGuide={() => setIsMobileGuideOpen(true)}
            onStatusChange={handleStatusChange}
            onDeleteBroadcast={handleDeleteBroadcast}
            onEditMetadata={(b) => {
              setSelectedBroadcastForEdit(b);
              setIsMetadataOpen(true);
            }}
            isDemoMode={isDemoMode}
            settings={settings}
            openConnectModal={() => setIsConnectModalOpen(true)}
            onRefresh={() => loadBroadcasts(true)}
            isRefreshing={isRefreshing}
          />
        )}

        {activeTab === 'thumbnail' && (
          <ThumbnailStudio
            broadcasts={broadcasts}
            onUploadToBroadcast={handleUploadThumbnailToBroadcast}
            onCreateBroadcastWithThumbnail={handleCreateWithThumbnail}
          />
        )}

        {activeTab === 'presets' && (
          <PresetManager
            presets={presets}
            onPresetsChange={handlePresetsChange}
            onUsePreset={handleUsePreset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>YouTube Live Control Tower Studio © 2026</span>
          <span>미라클AI 목회연구소 • 모바일 유튜브 라이브 PC 통합 관제 솔루션</span>
        </div>
      </footer>

      {/* Modals */}
      <BroadcastCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => {
          setIsCreatorOpen(false);
          setCreatorInitialData(null);
        }}
        onCreate={handleCreateBroadcast}
        presets={presets}
        initialData={creatorInitialData}
      />

      <MobileGuideModal
        isOpen={isMobileGuideOpen}
        onClose={() => setIsMobileGuideOpen(false)}
        activeBroadcast={activeBroadcast}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetData={handleResetData}
        openConnectModal={() => {
          setIsSettingsOpen(false);
          setIsConnectModalOpen(true);
        }}
      />

      <YouTubeConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onConnected={(newSettings) => {
          handleSaveSettings(newSettings);
          loadBroadcasts(true);
        }}
      />

      <LiveMetadataModal
        isOpen={isMetadataOpen}
        onClose={() => {
          setIsMetadataOpen(false);
          setSelectedBroadcastForEdit(null);
        }}
        broadcast={selectedBroadcastForEdit}
        onSave={handleSaveMetadata}
      />
    </div>
  );
}
