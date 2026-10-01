import React, { useState, useEffect } from 'react';
import { Plus, Link as LinkIcon, User, Sparkles, CheckCircle2, ChevronUp, Edit3, Calendar } from 'lucide-react';
import TodoItem from './TodoItem';
import { getTodayDateStr, getTomorrowDateStr, formatDisplayDate } from '../lib/dates';

export default function SectionColumn({
  ownerKey, // 'me' or 'her'
  ownerName,
  onUpdateOwnerName,
  tasks,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
  activeDateView = 'today', // 'today' | 'tomorrow'
}) {
  const isMe = ownerKey === 'me';
  const themeClass = isMe ? 'clay-card-me' : 'clay-card-her';
  const btnClass = isMe ? 'clay-btn-me' : 'clay-btn-her';
  const progressBarClass = isMe ? 'clay-progress-bar-me' : 'clay-progress-bar-her';
  const badgeClass = isMe ? 'clay-badge-me' : 'clay-badge-her';
  const accentColor = isMe ? 'var(--clay-me-accent)' : 'var(--clay-her-accent)';

  // Dates
  const todayStr = getTodayDateStr();
  const tomorrowStr = getTomorrowDateStr();

  // State
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(ownerName);

  // New task form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [targetDay, setTargetDay] = useState(activeDateView); // 'today' | 'tomorrow'
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setTargetDay(activeDateView);
  }, [activeDateView]);

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.isCompleted;
    if (filter === 'completed') return t.isCompleted;
    return true;
  });

  const handleNameSave = () => {
    if (tempName.trim()) {
      onUpdateOwnerName(ownerKey, tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const scheduledDate = targetDay === 'tomorrow' ? tomorrowStr : todayStr;

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      linkUrl: linkUrl.trim(),
      linkTitle: linkTitle.trim(),
      owner: ownerKey,
      isCompleted: false,
      targetDate: scheduledDate,
    });

    if (targetDay !== activeDateView) {
      setNotification(`Saved to ${targetDay === 'tomorrow' ? "tomorrow's" : "today's"} list!`);
      setTimeout(() => setNotification(null), 3000);
    }

    setTitle('');
    setDescription('');
    setLinkUrl('');
    setLinkTitle('');
    setIsFormOpen(false);
  };

  return (
    <div
      className={themeClass}
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '600px',
        height: '100%',
      }}
    >
      {/* Column Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Clay User Avatar Badge */}
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '16px',
                background: isMe ? 'linear-gradient(135deg, #818cf8, #4f46e5)' : 'linear-gradient(135deg, #fb7185, #e11d48)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: isMe ? '4px 6px 14px rgba(79, 70, 229, 0.35)' : '4px 6px 14px rgba(225, 29, 72, 0.35)',
                border: '2px solid rgba(255,255,255,0.7)',
              }}
            >
              <User size={24} />
            </div>

            {/* Editable Name */}
            <div>
              {isEditingName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="text"
                    className="clay-inset"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                    style={{ padding: '4px 8px', fontSize: '1.1rem', fontWeight: 800, width: '140px' }}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="clay-btn clay-btn-neutral"
                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    onClick={handleNameSave}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.35rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {ownerName}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setTempName(ownerName);
                      setIsEditingName(true);
                    }}
                    title="Rename section"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              )}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {activeDateView === 'today' ? "Today's Focus & Targets" : "Tomorrow's Target Plan"}
              </span>
            </div>
          </div>

          {/* Target Count Badge */}
          <div className={badgeClass} style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
            <CheckCircle2 size={15} />
            <span>{completedTasks} / {totalTasks} done</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <span>{activeDateView === 'today' ? "Today's Completion" : "Tomorrow's Progress"}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="clay-progress-track">
            <div className={progressBarClass} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Temporary Notification Banner */}
      {notification && (
        <div
          className="clay-card animate-pop-in"
          style={{
            padding: '8px 14px',
            marginBottom: '12px',
            background: 'var(--bg-subtle)',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--clay-me-accent)',
            textAlign: 'center',
          }}
        >
          {notification}
        </div>
      )}

      {/* Filter and Add Target Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '8px', flexWrap: 'wrap' }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-subtle)', padding: '4px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
          {['all', 'active', 'completed'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              style={{
                border: 'none',
                background: filter === tab ? (isMe ? '#4f46e5' : '#e11d48') : 'transparent',
                color: filter === tab ? '#ffffff' : 'var(--text-secondary)',
                padding: '4px 12px',
                borderRadius: '10px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                textTransform: 'capitalize',
                boxShadow: filter === tab ? '0 2px 6px rgba(0,0,0,0.18)' : 'none',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Add Target Button */}
        <button
          type="button"
          className={`clay-btn ${btnClass}`}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          onClick={() => setIsFormOpen(!isFormOpen)}
        >
          {isFormOpen ? <ChevronUp size={16} /> : <Plus size={16} />}
          <span>{isFormOpen ? 'Close Form' : 'New Target'}</span>
        </button>
      </div>

      {/* Clay In-line Creation Form */}
      {isFormOpen && (
        <form
          onSubmit={handleCreate}
          className="clay-card animate-pop-in"
          style={{
            padding: '18px',
            marginBottom: '18px',
            background: 'var(--bg-card-white)',
            border: `2px solid ${isMe ? 'rgba(99, 102, 241, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color={accentColor} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Add Target for {ownerName}
              </h4>
            </div>

            {/* Target Day Selector */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setTargetDay('today')}
                style={{
                  padding: '3px 10px',
                  borderRadius: '8px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  border: targetDay === 'today' ? '2px solid var(--clay-me-accent)' : '1px solid var(--border-subtle)',
                  background: targetDay === 'today' ? 'var(--clay-me-badge-bg)' : 'var(--bg-subtle)',
                  color: targetDay === 'today' ? 'var(--clay-me-badge-text)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setTargetDay('tomorrow')}
                style={{
                  padding: '3px 10px',
                  borderRadius: '8px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  border: targetDay === 'tomorrow' ? '2px solid var(--clay-her-accent)' : '1px solid var(--border-subtle)',
                  background: targetDay === 'tomorrow' ? 'var(--clay-her-badge-bg)' : 'var(--bg-subtle)',
                  color: targetDay === 'tomorrow' ? 'var(--clay-her-badge-text)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                Next Day ⏭️
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <input
                type="text"
                className="clay-inset"
                placeholder={targetDay === 'tomorrow' ? "What's the goal for tomorrow?" : "What's today's target?"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', fontSize: '0.9rem' }}
                autoFocus
                required
              />
            </div>

            <div>
              <textarea
                className="clay-inset"
                placeholder="Notes or details (optional)..."
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', resize: 'vertical' }}
              />
            </div>

            {/* Link Input Section */}
            <div style={{
              background: 'var(--bg-subtle)',
              padding: '10px',
              borderRadius: '14px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <LinkIcon size={14} color={accentColor} />
                <span>Attach Link (Resource, PR, Figma, Doc, Video...)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '8px' }}>
                <input
                  type="url"
                  className="clay-inset"
                  placeholder="https://example.com/project"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.82rem' }}
                />
                <input
                  type="text"
                  className="clay-inset"
                  placeholder="Link label (e.g. Project Specs)"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} />
                <span>Scheduling for: <strong>{targetDay === 'tomorrow' ? 'Tomorrow' : 'Today'}</strong></span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="clay-btn clay-btn-neutral"
                  style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`clay-btn ${btnClass}`}
                  style={{ padding: '6px 20px', fontSize: '0.82rem' }}
                >
                  {targetDay === 'tomorrow' ? 'Add for Tomorrow' : 'Add for Today'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Task List */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        {filteredTasks.length === 0 ? (
          <div
            className="clay-inset"
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              borderRadius: '24px',
              backgroundColor: 'var(--bg-subtle)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              marginTop: '10px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: isMe ? 'var(--clay-me-badge-bg)' : 'var(--clay-her-badge-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isMe ? 'var(--clay-me-accent)' : 'var(--clay-her-accent)',
              }}
            >
              <Sparkles size={24} />
            </div>
            <h5 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {filter === 'completed'
                ? 'No completed targets yet!'
                : filter === 'active'
                ? `All ${activeDateView === 'today' ? "today's" : "tomorrow's"} targets completed!`
                : `No targets set for ${activeDateView === 'today' ? 'today' : 'tomorrow'} yet`}
            </h5>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '280px' }}>
              {filter === 'all'
                ? `Click "+ New Target" above to set a target for ${ownerName}!`
                : 'Keep going and crush those goals!'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TodoItem
              key={task.$id}
              task={task}
              ownerTheme={ownerKey}
              onToggle={onToggleTask}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
}
