import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import SectionColumn from './components/SectionColumn';
import AllTodosByDate from './components/AllTodosByDate';
import TelegramSettingsModal from './components/TelegramSettingsModal';
import { todoApi, isTelegramConfigured } from './lib/telegramDb';
import { triggerTaskConfetti, triggerAllDoneCelebration } from './lib/celebrate';
import { getTodayDateStr, getTomorrowDateStr } from './lib/dates';
import { Heart, AlertCircle, Calendar, Search } from 'lucide-react';

const OWNER_NAMES_KEY = 'our_todo_owner_names';
const THEME_STORAGE_KEY = 'our_todo_theme_mode';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(isTelegramConfigured());

  // Navigation View Mode: 'board' (Daily Split Board) | 'allByDate' (All Targets Grouped by Date)
  const [viewMode, setViewMode] = useState('board');

  // Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // Active Date View for Daily Board: 'today' | 'tomorrow' (default is strictly 'today')
  const [activeDateView, setActiveDateView] = useState('today');

  const todayStr = getTodayDateStr();
  const tomorrowStr = getTomorrowDateStr();

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });

  // Apply dark mode class to html document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Customizable section labels (defaults to 'My Targets' and 'Her Targets')
  const [ownerNames, setOwnerNames] = useState(() => {
    try {
      const saved = localStorage.getItem(OWNER_NAMES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return { me: 'My Targets', her: 'Her Targets' };
  });

  const handleUpdateOwnerName = (key, newName) => {
    const updated = { ...ownerNames, [key]: newName };
    setOwnerNames(updated);
    localStorage.setItem(OWNER_NAMES_KEY, JSON.stringify(updated));
  };

  // Load tasks
  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await todoApi.listTodos();
      setTasks(res.data || []);
      setIsConnected(res.source === 'telegram');
      if (res.error) {
        setErrorMsg(`Telegram notice: ${res.error}. Showing local storage tasks.`);
      }
    } catch (err) {
      console.error('Error fetching tasks from Telegram:', err);
      setErrorMsg('Failed to fetch tasks from Telegram channel. Using local storage fallback.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Telegram Channel Realtime Sync (Polls pinned master JSON state)
  useEffect(() => {
    const unsubscribe = todoApi.subscribeToChanges((event) => {
      if (event?.todos && Array.isArray(event.todos)) {
        setTasks(event.todos);
      } else {
        loadTasks();
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [loadTasks]);

  // Add Task Handler
  const handleAddTask = async (taskData) => {
    try {
      const created = await todoApi.createTodo(taskData);
      setTasks((prev) => [created, ...prev]);
      triggerTaskConfetti();
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Could not save task: ' + (err.message || 'Unknown error'));
    }
  };

  // Toggle Task Completion
  const handleToggleTask = async (id, isCompleted) => {
    const previousTasks = [...tasks];
    const updatedTasks = tasks.map((t) => (t.$id === id ? { ...t, isCompleted } : t));
    setTasks(updatedTasks);

    if (isCompleted) {
      triggerTaskConfetti();
      // Check if all visible targets for this day view are completed
      const currentDateStr = activeDateView === 'tomorrow' ? tomorrowStr : todayStr;
      const dayTasks = updatedTasks.filter((t) => (t.targetDate || todayStr) === currentDateStr);
      const totalRemaining = dayTasks.filter((t) => !t.isCompleted).length;
      if (totalRemaining === 0 && dayTasks.length > 0) {
        setTimeout(triggerAllDoneCelebration, 300);
      }
    }

    try {
      await todoApi.updateTodo(id, { isCompleted });
    } catch (err) {
      console.error('Failed to update completion status:', err);
      setTasks(previousTasks);
      alert('Failed to update task: ' + (err.message || 'Unknown error'));
    }
  };

  // Update Task (title, link, date, description)
  const handleUpdateTask = async (id, updates) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.map((t) => (t.$id === id ? { ...t, ...updates } : t)));

    try {
      await todoApi.updateTodo(id, updates);
    } catch (err) {
      console.error('Failed to update task:', err);
      setTasks(previousTasks);
      alert('Failed to save changes: ' + (err.message || 'Unknown error'));
    }
  };

  // Delete Task
  const handleDeleteTask = async (id) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.$id !== id));

    try {
      await todoApi.deleteTodo(id);
    } catch (err) {
      console.error('Failed to delete task:', err);
      setTasks(previousTasks);
      alert('Failed to delete task: ' + (err.message || 'Unknown error'));
    }
  };

  // Filter tasks for Day Switcher counts
  const todayTasksList = useMemo(() => {
    return tasks.filter((t) => !t.targetDate || t.targetDate === todayStr);
  }, [tasks, todayStr]);

  const tomorrowTasksList = useMemo(() => {
    return tasks.filter((t) => t.targetDate === tomorrowStr);
  }, [tasks, tomorrowStr]);

  // Current active date tasks for Daily Board
  const boardTasks = useMemo(() => {
    const base = activeDateView === 'tomorrow' ? tomorrowTasksList : todayTasksList;
    if (!searchQuery.trim()) return base;
    const query = searchQuery.toLowerCase().trim();
    return base.filter((t) => {
      return (
        t.title?.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.linkUrl?.toLowerCase().includes(query) ||
        t.linkTitle?.toLowerCase().includes(query)
      );
    });
  }, [activeDateView, tomorrowTasksList, todayTasksList, searchQuery]);

  // Split by owner: Left (Me) and Right (Her) for Daily Board
  const myBoardTasks = useMemo(() => {
    return boardTasks.filter((t) => t.owner === 'me');
  }, [boardTasks]);

  const herBoardTasks = useMemo(() => {
    return boardTasks.filter((t) => t.owner === 'her');
  }, [boardTasks]);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* Header */}
      <Header
        tasks={viewMode === 'board' ? boardTasks : tasks}
        isConnected={isConnected}
        onOpenSettings={() => setIsSettingsOpen(true)}
        meName={ownerNames.me}
        herName={ownerNames.her}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        activeDateView={activeDateView}
        onSelectDateView={setActiveDateView}
        todayCount={todayTasksList.length}
        tomorrowCount={tomorrowTasksList.length}
        viewMode={viewMode}
        onSelectViewMode={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Optional notification / error banner */}
      {errorMsg && (
        <div
          className="clay-card animate-pop-in"
          style={{
            padding: '12px 18px',
            marginBottom: '20px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '2px solid rgba(245, 158, 11, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#f59e0b' }}>
            <AlertCircle size={18} color="#f59e0b" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            className="clay-btn clay-btn-neutral"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            onClick={() => setErrorMsg(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main View Router */}
      {viewMode === 'board' ? (
        <div>
          {/* Daily Date Context Banner */}
          <div
            className="clay-card animate-pop-in"
            style={{
              padding: '10px 20px',
              marginBottom: '20px',
              background: 'var(--bg-subtle)',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              border: '1.5px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              <Calendar size={16} color={activeDateView === 'today' ? "var(--clay-me-accent)" : "var(--clay-her-accent)"} />
              <span>
                {activeDateView === 'today'
                  ? "🎯 Showing Today's Targets"
                  : "⏭️ Showing Next Day Plan (Tomorrow)"}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                ({activeDateView === 'today' ? todayStr : tomorrowStr})
              </span>
              {searchQuery && (
                <span style={{ fontSize: '0.78rem', color: 'var(--clay-me-accent)', background: 'var(--bg-card-white)', padding: '2px 8px', borderRadius: '8px' }}>
                  Search: "{searchQuery}"
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {activeDateView === 'today'
                  ? 'Plan ahead for tomorrow anytime using "+ New Target"'
                  : 'Reviewing next day commitments'}
              </span>
              <button
                type="button"
                className="clay-btn clay-btn-neutral"
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '10px' }}
                onClick={() => setActiveDateView(activeDateView === 'today' ? 'tomorrow' : 'today')}
              >
                Switch to {activeDateView === 'today' ? 'Next Day ⏭️' : 'Today 🎯'}
              </button>
            </div>
          </div>

          {/* Main 2-Section Split Screen: Left (Me) & Right (Her) */}
          <main
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '28px',
              alignItems: 'start',
            }}
          >
            {/* Left Section: My Tasks */}
            <section aria-label="My Targets Section">
              <SectionColumn
                ownerKey="me"
                ownerName={ownerNames.me}
                onUpdateOwnerName={handleUpdateOwnerName}
                tasks={myBoardTasks}
                onToggleTask={handleToggleTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onAddTask={handleAddTask}
                activeDateView={activeDateView}
              />
            </section>

            {/* Right Section: Her Tasks */}
            <section aria-label="Her Targets Section">
              <SectionColumn
                ownerKey="her"
                ownerName={ownerNames.her}
                onUpdateOwnerName={handleUpdateOwnerName}
                tasks={herBoardTasks}
                onToggleTask={handleToggleTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onAddTask={handleAddTask}
                activeDateView={activeDateView}
              />
            </section>
          </main>
        </div>
      ) : (
        /* Separate Section: All Todos Grouped by Date with Search */
        <main aria-label="All Todos Grouped by Date Section">
          <AllTodosByDate
            tasks={tasks}
            ownerNames={ownerNames}
            onToggleTask={handleToggleTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </main>
      )}

      {/* Footer Encouragement Note */}
      <footer
        style={{
          marginTop: '44px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          className="clay-card"
          style={{
            padding: '12px 24px',
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.86rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
          }}
        >
          <span>Small daily steps lead to massive shared victories</span>
          <Heart size={16} fill="#fb7185" color="#e11d48" />
        </div>
      </footer>

      {/* Telegram Channel DB Settings & Configuration Modal */}
      <TelegramSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={() => {
          setIsConnected(isTelegramConfigured());
          loadTasks();
        }}
        isConnected={isConnected}
      />
    </div>
  );
}
