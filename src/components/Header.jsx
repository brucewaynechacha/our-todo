import React from 'react';
import { Send, Calendar, Award, Settings, Sparkles, Sun, Moon, ArrowRight, LayoutGrid, CalendarDays, Search, X } from 'lucide-react';
import { getTodayDateStr, getTomorrowDateStr } from '../lib/dates';

export default function Header({
  tasks,
  isConnected,
  onOpenSettings,
  meName = 'Me',
  herName = 'Her',
  isDarkMode,
  onToggleDarkMode,
  activeDateView,
  onSelectDateView,
  todayCount,
  tomorrowCount,
  viewMode = 'board', // 'board' | 'allByDate'
  onSelectViewMode,
  searchQuery,
  onSearchChange,
}) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.isCompleted).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <header
      className="clay-card"
      style={{
        padding: '20px 28px',
        marginBottom: '22px',
        background: 'var(--bg-card-white)',
        border: '3px solid var(--border-subtle)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* App Title & Duo Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #6366f1, #f43f5e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '6px 6px 16px rgba(99, 102, 241, 0.35)',
              border: '2px solid rgba(255,255,255,0.8)',
            }}
          >
            <Sparkles size={28} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Our Daily Targets
              </h1>
              <span
                style={{
                  background: isDarkMode ? 'linear-gradient(135deg, #1e274a, #401927)' : 'linear-gradient(135deg, #e0e7ff, #ffe4e6)',
                  color: isDarkMode ? '#e2e8f0' : '#4338ca',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {meName} &amp; {herName}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Dual accountability board • Track, support &amp; celebrate together
            </p>
          </div>
        </div>

        {/* View Mode Navigation Tabs: Daily Board vs All by Date */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-inset)',
            padding: '4px',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => onSelectViewMode('board')}
            style={{
              border: 'none',
              background: viewMode === 'board' ? 'var(--bg-card-white)' : 'transparent',
              color: viewMode === 'board' ? 'var(--text-primary)' : 'var(--text-secondary)',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: viewMode === 'board' ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <LayoutGrid size={15} color="var(--clay-me-accent)" />
            <span>Daily Board</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectViewMode('allByDate')}
            style={{
              border: 'none',
              background: viewMode === 'allByDate' ? 'var(--bg-card-white)' : 'transparent',
              color: viewMode === 'allByDate' ? 'var(--text-primary)' : 'var(--text-secondary)',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: viewMode === 'allByDate' ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <CalendarDays size={15} color="var(--clay-her-accent)" />
            <span>All by Date</span>
          </button>
        </div>

        {/* Center / Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Quick Header Search input */}
          <div style={{ position: 'relative', width: '190px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              className="clay-inset"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 26px 6px 30px',
                fontSize: '0.8rem',
                borderRadius: '14px',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* If on Daily Board, show Day Switcher: Today vs Tomorrow */}
          {viewMode === 'board' && (
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-inset)',
                padding: '4px',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                gap: '4px',
              }}
            >
              <button
                type="button"
                onClick={() => onSelectDateView('today')}
                style={{
                  border: 'none',
                  background: activeDateView === 'today' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                  color: activeDateView === 'today' ? '#ffffff' : 'var(--text-secondary)',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: activeDateView === 'today' ? '0 2px 8px rgba(79, 70, 229, 0.35)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <Calendar size={13} />
                <span>Today ({todayCount})</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectDateView('tomorrow')}
                style={{
                  border: 'none',
                  background: activeDateView === 'tomorrow' ? 'linear-gradient(135deg, #fb7185, #e11d48)' : 'transparent',
                  color: activeDateView === 'tomorrow' ? '#ffffff' : 'var(--text-secondary)',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: activeDateView === 'tomorrow' ? '0 2px 8px rgba(225, 29, 72, 0.35)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>Next Day ({tomorrowCount})</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}

          {/* Goal Progress Pill */}
          <div
            className="clay-inset"
            style={{
              padding: '7px 14px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Award size={16} color="var(--clay-her-accent)" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {viewMode === 'board' ? (activeDateView === 'today' ? 'Today' : 'Tomorrow') : 'Total'}: {completed}/{total}
              </span>
              <div
                style={{
                  width: '85px',
                  height: '7px',
                  background: 'var(--bg-subtle)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  marginTop: '2px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${percent}%`,
                    background: activeDateView === 'today' 
                      ? 'linear-gradient(90deg, #6366f1, #e11d48)' 
                      : 'linear-gradient(90deg, #f59e0b, #ec4899)',
                    borderRadius: '999px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {percent}%
            </span>
          </div>

          {/* Dark / Light Mode Toggle Button */}
          <button
            type="button"
            className="clay-btn clay-btn-neutral"
            onClick={onToggleDarkMode}
            style={{
              padding: '7px 12px',
              borderRadius: '16px',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <>
                <Sun size={15} color="#fbbf24" />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Light</span>
              </>
            ) : (
              <>
                <Moon size={15} color="#6366f1" />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Dark</span>
              </>
            )}
          </button>

          {/* Telegram Channel DB status & settings */}
          <button
            type="button"
            className="clay-btn clay-btn-neutral"
            onClick={onOpenSettings}
            style={{
              padding: '7px 12px',
              borderRadius: '16px',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title={isConnected ? 'Telegram Channel DB connected' : 'Click to setup Telegram Channel DB'}
          >
            {isConnected ? (
              <>
                <Send size={14} color="#0088cc" style={{ transform: 'translateX(-1px)' }} />
                <span style={{ color: '#0088cc', fontWeight: 800 }}>Telegram DB</span>
              </>
            ) : (
              <>
                <Send size={14} color="#f59e0b" style={{ transform: 'translateX(-1px)' }} />
                <span style={{ color: '#f59e0b', fontWeight: 800 }}>Connect Telegram</span>
              </>
            )}
            <Settings size={13} style={{ opacity: 0.6, marginLeft: '2px' }} />
          </button>
        </div>
      </div>
    </header>
  );
}
