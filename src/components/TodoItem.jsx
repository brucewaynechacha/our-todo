import React, { useState } from 'react';
import { Check, Trash2, Edit2, X, Save, Calendar, ArrowRight } from 'lucide-react';
import TaskLink from './TaskLink';
import { formatDisplayDate, getTodayDateStr, getTomorrowDateStr } from '../lib/dates';

export default function TodoItem({ task, onToggle, onUpdate, onDelete, ownerTheme = 'me' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');
  const [editLinkUrl, setEditLinkUrl] = useState(task.linkUrl || '');
  const [editLinkTitle, setEditLinkTitle] = useState(task.linkTitle || '');
  const [editDate, setEditDate] = useState(task.targetDate || getTodayDateStr());

  const isMe = ownerTheme === 'me';
  const checkboxCheckedClass = isMe ? 'clay-checkbox-me-checked' : 'clay-checkbox-her-checked';
  const todayStr = getTodayDateStr();
  const tomorrowStr = getTomorrowDateStr();
  const isTomorrow = task.targetDate === tomorrowStr;

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    onUpdate(task.$id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      linkUrl: editLinkUrl.trim(),
      linkTitle: editLinkTitle.trim(),
      targetDate: editDate,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditLinkUrl(task.linkUrl || '');
    setEditLinkTitle(task.linkTitle || '');
    setEditDate(task.targetDate || getTodayDateStr());
    setIsEditing(false);
  };

  return (
    <div
      className="clay-card animate-pop-in"
      style={{
        padding: '16px 18px',
        marginBottom: '14px',
        backgroundColor: task.isCompleted ? 'var(--bg-subtle)' : 'var(--bg-card-white)',
        border: `2px solid var(--border-subtle)`,
        transition: 'all 0.25s ease',
        opacity: task.isCompleted ? 0.72 : 1,
      }}
    >
      {isEditing ? (
        <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Target Title</label>
            <input
              type="text"
              className="clay-inset"
              style={{ width: '100%', padding: '8px 12px', fontSize: '0.9rem', marginTop: '4px' }}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Notes / Description</label>
            <textarea
              className="clay-inset"
              rows={2}
              style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', marginTop: '4px', resize: 'vertical' }}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Link URL</label>
              <input
                type="text"
                className="clay-inset"
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', marginTop: '4px' }}
                placeholder="https://..."
                value={editLinkUrl}
                onChange={(e) => setEditLinkUrl(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Link Label (optional)</label>
              <input
                type="text"
                className="clay-inset"
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', marginTop: '4px' }}
                placeholder="e.g. Doc / Design"
                value={editLinkTitle}
                onChange={(e) => setEditLinkTitle(e.target.value)}
              />
            </div>
          </div>

          {/* Schedule for Day */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
              Target Day
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setEditDate(todayStr)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: editDate === todayStr ? '2px solid var(--clay-me-accent)' : '1px solid var(--border-subtle)',
                  background: editDate === todayStr ? 'var(--clay-me-badge-bg)' : 'var(--bg-subtle)',
                  color: editDate === todayStr ? 'var(--clay-me-badge-text)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setEditDate(tomorrowStr)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: editDate === tomorrowStr ? '2px solid var(--clay-her-accent)' : '1px solid var(--border-subtle)',
                  background: editDate === tomorrowStr ? 'var(--clay-her-badge-bg)' : 'var(--bg-subtle)',
                  color: editDate === tomorrowStr ? 'var(--clay-her-badge-text)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                Next Day (Tomorrow)
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
            <button
              type="button"
              className="clay-btn clay-btn-neutral"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              onClick={handleCancelEdit}
            >
              <X size={14} /> Cancel
            </button>
            <button
              type="submit"
              className={`clay-btn ${isMe ? 'clay-btn-me' : 'clay-btn-her'}`}
              style={{ padding: '6px 16px', fontSize: '0.8rem' }}
            >
              <Save size={14} /> Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            {/* Clay Checkbox */}
            <div
              className={`clay-checkbox ${task.isCompleted ? checkboxCheckedClass : 'clay-checkbox-uncheck'}`}
              onClick={() => onToggle(task.$id, !task.isCompleted)}
              title={task.isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
            >
              {task.isCompleted && <Check size={16} strokeWidth={3.2} />}
            </div>

            {/* Title & Description */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <h4
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: task.isCompleted ? 'line-through' : 'none',
                    wordBreak: 'break-word',
                    lineHeight: 1.4,
                  }}
                >
                  {task.title}
                </h4>

                {/* Actions: Edit & Delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    title="Edit target"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '5px',
                      color: 'var(--text-muted)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--clay-me-accent)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(task.$id)}
                    title="Delete target"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '5px',
                      color: 'var(--text-muted)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#e11d48')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Description */}
              {task.description && (
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-secondary)',
                    marginTop: '6px',
                    lineHeight: 1.45,
                    wordBreak: 'break-word',
                  }}
                >
                  {task.description}
                </p>
              )}

              {/* Bottom Row: Link & Date */}
              {(task.linkUrl || task.targetDate) && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginTop: '10px',
                  }}
                >
                  {/* External Link Chip */}
                  {task.linkUrl && (
                    <TaskLink url={task.linkUrl} title={task.linkTitle} />
                  )}

                  {/* Target Date Pill */}
                  {task.targetDate && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '999px',
                        background: isTomorrow ? 'var(--clay-her-badge-bg)' : 'var(--bg-subtle)',
                        color: isTomorrow ? 'var(--clay-her-badge-text)' : 'var(--text-secondary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: `1px solid ${isTomorrow ? 'rgba(244, 63, 94, 0.3)' : 'var(--border-subtle)'}`,
                      }}
                    >
                      <Calendar size={11} />
                      {formatDisplayDate(task.targetDate)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
