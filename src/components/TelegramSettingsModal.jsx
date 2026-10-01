import React, { useState } from 'react';
import { getStoredTelegramConfig, saveTelegramConfig, clearTelegramConfig, testTelegramConnection, todoApi } from '../lib/telegramDb';
import { Send, X, CheckCircle, AlertTriangle, Key, HelpCircle, RefreshCw, MessageSquare, Terminal } from 'lucide-react';

export default function TelegramSettingsModal({ isOpen, onClose, onConfigSaved, isConnected }) {
  const current = getStoredTelegramConfig();
  const [botToken, setBotToken] = useState(current.botToken);
  const [channelId, setChannelId] = useState(current.channelId);
  const [showGuide, setShowGuide] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleSaveAndTest = async (e) => {
    e.preventDefault();
    if (!botToken.trim() || !channelId.trim()) {
      alert('Please provide both Bot Token and Channel Username or ID.');
      return;
    }

    setTesting(true);
    setTestResult(null);

    const trimmedToken = botToken.trim();
    let trimmedChannel = channelId.trim();

    // If username without @ was entered and it's not a numeric ID
    if (!trimmedChannel.startsWith('@') && !trimmedChannel.startsWith('-') && !/^\d+$/.test(trimmedChannel)) {
      trimmedChannel = '@' + trimmedChannel;
    }

    const res = await testTelegramConnection(trimmedToken, trimmedChannel);

    if (res.success) {
      saveTelegramConfig({
        botToken: trimmedToken,
        channelId: trimmedChannel,
      });

      // Push current tasks to initialize or sync the master pinned database in Telegram
      try {
        const localTasks = (await todoApi.listTodos()).data || [];
        await todoApi.syncFullDatabaseToTelegram(localTasks, { botToken: trimmedToken, channelId: trimmedChannel });
      } catch (syncErr) {
        console.warn('Initial sync notice:', syncErr);
      }

      setTestResult({
        success: true,
        message: `Connected successfully to "${res.chatTitle}" with bot @${res.botUsername}! Database JSON initialized.`,
      });

      setTimeout(() => {
        setTesting(false);
        onConfigSaved();
        onClose();
      }, 1200);
    } else {
      setTesting(false);
      setTestResult({
        success: false,
        message: `Connection failed: ${res.error}. Make sure the bot is added as an Administrator to your channel.`,
      });
    }
  };

  const handleResetToDemo = () => {
    clearTelegramConfig();
    setBotToken('');
    setChannelId('');
    setTestResult(null);
    onConfigSaved();
    onClose();
  };

  return (
    <div className="clay-overlay animate-pop-in" onClick={onClose}>
      <div
        className="clay-card"
        style={{
          width: '100%',
          maxWidth: '580px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          position: 'relative',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #229ed9, #0088cc)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '4px 6px 14px rgba(0, 136, 204, 0.35)',
              }}
            >
              <Send size={22} style={{ transform: 'translateX(-1px) translateY(1px)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Telegram Channel Database
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Store &amp; sync all todos in JSON format inside your Telegram Channel
              </p>
            </div>
          </div>

          <button
            type="button"
            className="clay-btn clay-btn-neutral"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: '12px' }}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Current status pill */}
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: '16px',
            background: isConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: `1.5px solid ${isConnected ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {isConnected ? (
            <CheckCircle size={22} color="#10b981" />
          ) : (
            <AlertTriangle size={22} color="#f59e0b" />
          )}
          <div style={{ fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 800, color: isConnected ? '#10b981' : '#f59e0b' }}>
              {isConnected ? 'Telegram Channel DB Connected' : 'Currently in Local / Offline Mode'}
            </span>
            <p style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '0.8rem' }}>
              {isConnected
                ? 'All targets are stored & synced in JSON format to your Telegram channel in real time.'
                : 'Targets are stored locally. Connect your Telegram bot & channel below to sync.'}
            </p>
          </div>
        </div>

        {/* Setup Guide Toggle */}
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          style={{
            background: 'none',
            border: 'none',
            color: '#0088cc',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            marginBottom: '16px',
            padding: 0,
          }}
        >
          <HelpCircle size={16} />
          {showGuide ? 'Hide 3-Step Setup Instructions' : 'How to set up Telegram Channel Database in 1 minute?'}
        </button>

        {showGuide && (
          <div
            style={{
              background: 'var(--bg-subtle)',
              padding: '16px',
              borderRadius: '16px',
              fontSize: '0.82rem',
              marginBottom: '20px',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <h4 style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
              Quick 3-Step Telegram Setup:
            </h4>
            <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>
                <strong>Create Bot:</strong> Open Telegram, search <code>@BotFather</code>, send <code>/newbot</code>, give it a name, and copy the <strong>HTTP API Token</strong>.
              </li>
              <li>
                <strong>Create Channel:</strong> Create a Telegram Channel (public or private) for you and your friend.
              </li>
              <li>
                <strong>Add Bot as Admin:</strong> In your Channel Settings &gt; Administrators &gt; Add your bot as Admin with <em>Post Messages</em>, <em>Edit Messages</em>, and <em>Pin Messages</em> permissions.
              </li>
              <li>
                <strong>Paste credentials below:</strong> Enter the token and your channel username (e.g. <code>@our_targets_channel</code>) or channel ID.
              </li>
            </ol>
            <div style={{ marginTop: '4px', fontSize: '0.78rem', background: 'var(--bg-card-white)', padding: '8px 12px', borderRadius: '10px' }}>
              💡 <strong>JSON Storage Format:</strong> The bot posts structured JSON messages for every target created/completed, and updates a pinned <code>OUR_TODO_DATABASE_MASTER</code> JSON record in the channel!
            </div>
          </div>
        )}

        {/* Configuration Form */}
        <form onSubmit={handleSaveAndTest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              <Key size={14} color="#0088cc" /> Telegram Bot API Token
            </label>
            <input
              type="password"
              className="clay-inset"
              style={{ width: '100%', padding: '10px 14px', fontSize: '0.9rem' }}
              placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              <MessageSquare size={14} color="#0088cc" /> Telegram Channel Username or ID
            </label>
            <input
              type="text"
              className="clay-inset"
              style={{ width: '100%', padding: '10px 14px', fontSize: '0.9rem' }}
              placeholder="e.g. @our_daily_targets or -1001234567890"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              required
            />
          </div>

          {/* Test result banner */}
          {testResult && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                background: testResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: testResult.success ? '#10b981' : '#ef4444',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              }}
            >
              {testResult.message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="submit"
              disabled={testing}
              className="clay-btn"
              style={{
                flex: 1,
                padding: '12px',
                background: 'linear-gradient(135deg, #229ed9, #0088cc)',
                color: '#ffffff',
                boxShadow: '4px 6px 14px rgba(0, 136, 204, 0.35)',
              }}
            >
              {testing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Connecting &amp; Initializing JSON...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Save &amp; Connect Telegram DB</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="clay-btn clay-btn-neutral"
              onClick={handleResetToDemo}
              title="Reset to local offline mode"
            >
              Reset to Local
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
