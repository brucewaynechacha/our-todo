import React, { useState, useMemo } from 'react';
import { Calendar, Search, X, CheckCircle2, User, Sparkles, Filter, ArrowUpDown } from 'lucide-react';
import TodoItem from './TodoItem';
import { getTodayDateStr, getTomorrowDateStr, formatDisplayDate } from '../lib/dates';

export default function AllTodosByDate({
  tasks,
  ownerNames,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  searchQuery,
  onSearchChange,
}) {
  const [ownerFilter, setOwnerFilter] = useState('all'); // 'all' | 'me' | 'her'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (newest first) | 'asc' (oldest first)

  const todayStr = getTodayDateStr();
  const tomorrowStr = getTomorrowDateStr();

  // 1. Filter tasks by search query, owner, and completion status
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Owner filter
      if (ownerFilter !== 'all' && task.owner !== ownerFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'active' && task.isCompleted) return false;
      if (statusFilter === 'completed' && !task.isCompleted) return false;

      // Search query (matches title, description, linkUrl, or linkTitle)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = task.title?.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        const matchesLinkUrl = task.linkUrl?.toLowerCase().includes(query);
        const matchesLinkTitle = task.linkTitle?.toLowerCase().includes(query);
        const matchesOwner = (task.owner === 'me' ? ownerNames.me : ownerNames.her)?.toLowerCase().includes(query);

        if (!matchesTitle && !matchesDesc && !matchesLinkUrl && !matchesLinkTitle && !matchesOwner) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, ownerFilter, statusFilter, searchQuery, ownerNames]);

  // 2. Group filtered tasks by targetDate
  const groupedByDate = useMemo(() => {
    const groups = {};

    filteredTasks.forEach((task) => {
      const dateKey = task.targetDate || todayStr;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(task);
    });

    // Sort dates
    const sortedDates = Object.keys(groups).sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.localeCompare(a);
      }
      return a.localeCompare(b);
    });

    return sortedDates.map((dateKey) => ({
      date: dateKey,
      tasks: groups[dateKey],
    }));
  }, [filteredTasks, todayStr, sortOrder]);

  const totalFiltered = filteredTasks.length;
  const completedFiltered = filteredTasks.filter((t) => t.isCompleted).length;

  return (
    <div className="animate-pop-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Search & Filter Header Bar */}
      <div
        className="clay-card"
        style={{
          padding: '20px 24px',
          background: 'var(--bg-card-white)',
          border: '2px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={22} color="var(--clay-me-accent)" />
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                All Targets by Date
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Chronological timeline of all goals across {ownerNames.me} &amp; {ownerNames.her}
            </p>
          </div>

          {/* Quick stats pill */}
          <div
            className="clay-inset"
            style={{
              padding: '6px 14px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle2 size={16} color="var(--clay-me-accent)" />
            <span>
              {completedFiltered} / {totalFiltered} completed
            </span>
          </div>
        </div>

        {/* Search Input Well */}
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <div
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <Search size={18} />
          </div>

          <input
            type="text"
            className="clay-inset"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search targets by keyword, notes, link URL, or title..."
            style={{
              width: '100%',
              padding: '12px 42px 12px 42px',
              fontSize: '0.92rem',
              borderRadius: '16px',
            }}
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              title="Clear search"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {/* Owner Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Show:</span>
            {[
              { id: 'all', label: 'Everyone' },
              { id: 'me', label: ownerNames.me },
              { id: 'her', label: ownerNames.her },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setOwnerFilter(opt.id)}
                style={{
                  border: 'none',
                  background: ownerFilter === opt.id ? (opt.id === 'her' ? '#e11d48' : '#4f46e5') : 'var(--bg-subtle)',
                  color: ownerFilter === opt.id ? '#ffffff' : 'var(--text-secondary)',
                  padding: '5px 12px',
                  borderRadius: '10px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: ownerFilter === opt.id ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Status & Sort Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Status */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-subtle)', padding: '3px', borderRadius: '12px' }}>
              {['all', 'active', 'completed'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  style={{
                    border: 'none',
                    background: statusFilter === st ? 'var(--bg-card-white)' : 'transparent',
                    color: statusFilter === st ? 'var(--text-primary)' : 'var(--text-secondary)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    boxShadow: statusFilter === st ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Sort order toggle */}
            <button
              type="button"
              className="clay-btn clay-btn-neutral"
              style={{ padding: '5px 12px', fontSize: '0.75rem', borderRadius: '10px' }}
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              title={sortOrder === 'desc' ? 'Showing newest dates first' : 'Showing oldest dates first'}
            >
              <ArrowUpDown size={13} />
              <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>

        {/* Search Results Summary */}
        {searchQuery.trim() && (
          <div
            style={{
              marginTop: '12px',
              padding: '6px 12px',
              background: 'var(--bg-subtle)',
              borderRadius: '10px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>
              Showing results for: <strong>"{searchQuery}"</strong> ({totalFiltered} found)
            </span>
            <button
              type="button"
              onClick={() => onSearchChange('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--clay-me-accent)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* Date-Grouped Timeline Sections */}
      {groupedByDate.length === 0 ? (
        <div
          className="clay-card animate-pop-in"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <Search size={26} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            No targets found
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '340px' }}>
            {searchQuery
              ? `No targets matched "${searchQuery}". Try different keywords or clear the search filter.`
              : 'No targets have been added for the selected filters.'}
          </p>
          {searchQuery && (
            <button
              type="button"
              className="clay-btn clay-btn-neutral"
              onClick={() => onSearchChange('')}
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            >
              Clear Search Query
            </button>
          )}
        </div>
      ) : (
        groupedByDate.map((group) => {
          const isDateToday = group.date === todayStr;
          const isDateTomorrow = group.date === tomorrowStr;

          const dateDoneCount = group.tasks.filter((t) => t.isCompleted).length;
          const dateTotalCount = group.tasks.length;
          const datePercent = dateTotalCount === 0 ? 0 : Math.round((dateDoneCount / dateTotalCount) * 100);

          // Split tasks for this date between Me and Her
          const meTasksForDate = group.tasks.filter((t) => t.owner === 'me');
          const herTasksForDate = group.tasks.filter((t) => t.owner === 'her');

          return (
            <section
              key={group.date}
              className="clay-card animate-pop-in"
              style={{
                padding: '24px',
                background: 'var(--bg-card-white)',
                border: isDateToday
                  ? '2.5px solid var(--clay-me-accent)'
                  : isDateTomorrow
                  ? '2.5px solid var(--clay-her-accent)'
                  : '2px solid var(--border-subtle)',
              }}
            >
              {/* Date Section Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '20px',
                  paddingBottom: '14px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      padding: '6px 14px',
                      borderRadius: '12px',
                      background: isDateToday
                        ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                        : isDateTomorrow
                        ? 'linear-gradient(135deg, #fb7185, #e11d48)'
                        : 'var(--bg-subtle)',
                      color: isDateToday || isDateTomorrow ? '#ffffff' : 'var(--text-primary)',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: isDateToday || isDateTomorrow ? '0 2px 8px rgba(0,0,0,0.18)' : 'none',
                    }}
                  >
                    <Calendar size={15} />
                    <span>{formatDisplayDate(group.date)}</span>
                  </div>

                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {group.date}
                  </span>
                </div>

                {/* Date progress stats */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {dateDoneCount} / {dateTotalCount} completed ({datePercent}%)
                  </span>
                  <div
                    style={{
                      width: '80px',
                      height: '8px',
                      background: 'var(--bg-subtle)',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${datePercent}%`,
                        background: isDateTomorrow
                          ? 'linear-gradient(90deg, #fb7185, #e11d48)'
                          : 'linear-gradient(90deg, #6366f1, #4f46e5)',
                        borderRadius: '999px',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 2-Column Split inside this Date: Left (Me) and Right (Her) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '20px',
                  alignItems: 'start',
                }}
              >
                {/* Left Side: Me */}
                {(ownerFilter === 'all' || ownerFilter === 'me') && (
                  <div
                    style={{
                      background: 'var(--bg-card)',
                      padding: '16px',
                      borderRadius: '20px',
                      border: '1.5px solid var(--border-subtle)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="clay-badge-me" style={{ padding: '3px 10px', borderRadius: '8px', fontSize: '0.76rem' }}>
                          {ownerNames.me}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          ({meTasksForDate.length} targets)
                        </span>
                      </div>
                    </div>

                    {meTasksForDate.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0' }}>
                        No targets for {ownerNames.me} on this date.
                      </p>
                    ) : (
                      meTasksForDate.map((task) => (
                        <TodoItem
                          key={task.$id}
                          task={task}
                          ownerTheme="me"
                          onToggle={onToggleTask}
                          onUpdate={onUpdateTask}
                          onDelete={onDeleteTask}
                        />
                      ))
                    )}
                  </div>
                )}

                {/* Right Side: Her */}
                {(ownerFilter === 'all' || ownerFilter === 'her') && (
                  <div
                    style={{
                      background: 'var(--bg-card)',
                      padding: '16px',
                      borderRadius: '20px',
                      border: '1.5px solid var(--border-subtle)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="clay-badge-her" style={{ padding: '3px 10px', borderRadius: '8px', fontSize: '0.76rem' }}>
                          {ownerNames.her}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          ({herTasksForDate.length} targets)
                        </span>
                      </div>
                    </div>

                    {herTasksForDate.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0' }}>
                        No targets for {ownerNames.her} on this date.
                      </p>
                    ) : (
                      herTasksForDate.map((task) => (
                        <TodoItem
                          key={task.$id}
                          task={task}
                          ownerTheme="her"
                          onToggle={onToggleTask}
                          onUpdate={onUpdateTask}
                          onDelete={onDeleteTask}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
