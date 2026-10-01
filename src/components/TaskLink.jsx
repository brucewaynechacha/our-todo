import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Globe } from 'lucide-react';

export default function TaskLink({ url, title }) {
  const [copied, setCopied] = useState(false);

  if (!url) return null;

  // Ensure url has protocol
  let normalizedUrl = url.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  // Extract clean domain for display if no title provided
  let domain = 'link';
  try {
    const parsed = new URL(normalizedUrl);
    domain = parsed.hostname.replace(/^www\./, '');
  } catch (e) {
    domain = url;
  }

  const displayText = title?.trim() || domain;

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(normalizedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', maxWidth: '100%' }}>
      <a
        href={normalizedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="clay-link-chip"
        title={`Open ${normalizedUrl}`}
        onClick={(e) => e.stopPropagation()}
      >
        <Globe size={13} style={{ flexShrink: 0, opacity: 0.8 }} />
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '220px'
        }}>
          {displayText}
        </span>
        <ExternalLink size={12} style={{ flexShrink: 0, opacity: 0.7 }} />
      </a>

      <button
        type="button"
        onClick={handleCopy}
        title="Copy link to clipboard"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          color: copied ? '#10b981' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          transition: 'color 0.2s',
        }}
      >
        {copied ? <Check size={14} /> : <Copy size={13} />}
      </button>
    </div>
  );
}
