import React, { useState } from 'react';
import { getStoredConfig, saveCustomConfig, clearCustomConfig } from '../lib/appwrite';
import { Database, X, CheckCircle, AlertTriangle, Key, Server, Layers, HelpCircle } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, onConfigSaved, isConnected }) {
  const current = getStoredConfig();
  const [endpoint, setEndpoint] = useState(current.endpoint);
  const [projectId, setProjectId] = useState(current.projectId);
  const [databaseId, setDatabaseId] = useState(current.databaseId);
  const [collectionId, setCollectionId] = useState(current.collectionId);
  const [showGuide, setShowGuide] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    saveCustomConfig({
      endpoint: endpoint.trim() || 'https://cloud.appwrite.io/v1',
      projectId: projectId.trim(),
      databaseId: databaseId.trim(),
      collectionId: collectionId.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onConfigSaved();
      onClose();
    }, 900);
  };

  const handleResetToDemo = () => {
    clearCustomConfig();
    setProjectId('');
    setDatabaseId('');
    setCollectionId('');
    onConfigSaved();
    onClose();
  };

  return (
    <div className="clay-overlay animate-pop-in" onClick={onClose}>
      <div 
        className="clay-card" 
        style={{
          width: '100%',
          maxWidth: '560px',
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
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #fd366e, #f02e65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '4px 4px 10px rgba(240, 46, 101, 0.35)'
            }}>
              <Database size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Appwrite DB Settings
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Connect your Appwrite backend to sync todos across devices
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
        <div style={{
          marginBottom: '20px',
          padding: '12px 16px',
          borderRadius: '16px',
          background: isConnected ? 'rgba(5, 150, 105, 0.12)' : 'rgba(217, 119, 6, 0.12)',
          border: `1.5px solid ${isConnected ? 'rgba(5, 150, 105, 0.35)' : 'rgba(217, 119, 6, 0.35)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {isConnected ? (
            <CheckCircle size={20} color="#10b981" />
          ) : (
            <AlertTriangle size={20} color="#f59e0b" />
          )}
          <div style={{ fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 700, color: isConnected ? '#10b981' : '#f59e0b' }}>
              {isConnected ? 'Connected to Appwrite Database' : 'Currently in Local / Demo Mode'}
            </span>
            <p style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '0.8rem' }}>
              {isConnected 
                ? 'Tasks are synced directly to your Appwrite collection.' 
                : 'Tasks are currently saved locally. Fill in your Appwrite keys below to sync.'}
            </p>
          </div>
        </div>

        {/* Guide toggle button */}
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--clay-me-accent)',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            marginBottom: '16px',
            padding: 0
          }}
        >
          <HelpCircle size={16} />
          {showGuide ? 'Hide Appwrite collection schema guide' : 'Need help? View Appwrite collection schema attributes'}
        </button>

        {showGuide && (
          <div style={{
            background: 'var(--bg-subtle)',
            padding: '16px',
            borderRadius: '16px',
            fontSize: '0.82rem',
            marginBottom: '20px',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)'
          }}>
            <h4 style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
              Required Appwrite Collection Attributes:
            </h4>
            <p style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>
              In your Appwrite Console &gt; Databases &gt; Collection, add these attributes (and set Permissions: Read &amp; Write for "Any" or authenticated users):
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li><code>title</code> (String, size 255, required)</li>
              <li><code>description</code> (String, size 1000, optional)</li>
              <li><code>linkUrl</code> (String, size 2048, optional)</li>
              <li><code>linkTitle</code> (String, size 255, optional)</li>
              <li><code>isCompleted</code> (Boolean, required, default false)</li>
              <li><code>owner</code> (String, size 50, required: <em>me</em> or <em>her</em>)</li>
              <li><code>targetDate</code> (String, size 30, optional)</li>
              <li><code>createdAt</code> (String, size 50, optional)</li>
            </ul>
          </div>
        )}

        {/* Configuration Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              <Server size={14} /> Appwrite Endpoint
            </label>
            <input
              type="text"
              className="clay-inset"
              style={{ width: '100%', padding: '10px 14px', fontSize: '0.9rem' }}
              placeholder="https://cloud.appwrite.io/v1"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              <Key size={14} /> Project ID
            </label>
            <input
              type="text"
              className="clay-inset"
              style={{ width: '100%', padding: '10px 14px', fontSize: '0.9rem' }}
              placeholder="e.g. 660f85ab003f0f78"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              <Database size={14} /> Database ID
            </label>
            <input
              type="text"
              className="clay-inset"
              style={{ width: '100%', padding: '10px 14px', fontSize: '0.9rem' }}
              placeholder="e.g. our_daily_targets"
              value={databaseId}
              onChange={(e) => setDatabaseId(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              <Layers size={14} /> Collection ID
            </label>
            <input
              type="text"
              className="clay-inset"
              style={{ width: '100%', padding: '10px 14px', fontSize: '0.9rem' }}
              placeholder="e.g. todos"
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="submit"
              className="clay-btn clay-btn-me"
              style={{ flex: 1, padding: '12px' }}
            >
              {savedSuccess ? 'Saved Successfully! ✓' : 'Save & Connect'}
            </button>
            <button
              type="button"
              className="clay-btn clay-btn-neutral"
              onClick={handleResetToDemo}
              title="Reset to local demo mode"
            >
              Reset to Local
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
