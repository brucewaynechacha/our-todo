// Telegram Channel as a Database (JSON Storage Engine)

const TELEGRAM_CONFIG_KEY = 'our_todo_telegram_config';
const LOCAL_STORAGE_TODOS_KEY = 'our_todo_local_tasks_backup';
const TELEGRAM_MASTER_MSG_ID_KEY = 'our_todo_telegram_master_msg_id';

// Default / stored configuration
export const getStoredTelegramConfig = () => {
  const envConfig = {
    botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
    channelId: import.meta.env.VITE_TELEGRAM_CHANNEL_ID || '',
  };

  try {
    const custom = localStorage.getItem(TELEGRAM_CONFIG_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      return {
        botToken: parsed.botToken || envConfig.botToken,
        channelId: parsed.channelId || envConfig.channelId,
      };
    }
  } catch (e) {
    console.warn('Failed reading Telegram config from localStorage', e);
  }

  return envConfig;
};

export const saveTelegramConfig = (config) => {
  localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(config));
};

export const clearTelegramConfig = () => {
  localStorage.removeItem(TELEGRAM_CONFIG_KEY);
  localStorage.removeItem(TELEGRAM_MASTER_MSG_ID_KEY);
};

export const isTelegramConfigured = () => {
  const cfg = getStoredTelegramConfig();
  return Boolean(cfg.botToken && cfg.channelId);
};

// Seed initial default mock tasks for first-time onboarding
import { getTodayDateStr } from './dates';

const defaultTasks = [
  {
    $id: 'tg-1',
    title: 'Complete frontend responsive layout',
    description: 'Verify 2-column split on desktop and clean stacking on mobile.',
    linkUrl: 'https://github.com',
    linkTitle: 'GitHub Repo',
    isCompleted: true,
    owner: 'me',
    targetDate: getTodayDateStr(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    $id: 'tg-2',
    title: 'Review Telegram channel database integration',
    description: 'Verify todos are stored in JSON format inside the Telegram channel feed and master pinned message.',
    linkUrl: 'https://core.telegram.org/bots/api',
    linkTitle: 'Telegram Bot API Docs',
    isCompleted: false,
    owner: 'me',
    targetDate: getTodayDateStr(),
    createdAt: new Date().toISOString(),
  },
  {
    $id: 'tg-3',
    title: 'Design claymorphism UI tokens',
    description: 'Ensure inner & outer shadows match pastel colors and pill buttons.',
    linkUrl: 'https://dribbble.com/tags/claymorphism',
    linkTitle: 'Clay Inspiration',
    isCompleted: true,
    owner: 'her',
    targetDate: getTodayDateStr(),
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    $id: 'tg-4',
    title: 'Test cross-device sync via Telegram channel',
    description: 'Make sure all targets sync seamlessly between both phones/devices.',
    linkUrl: 'https://telegram.org',
    linkTitle: 'Telegram Web',
    isCompleted: false,
    owner: 'her',
    targetDate: getTodayDateStr(),
    createdAt: new Date().toISOString(),
  }
];

// Local storage fallback helpers
const getLocalTasks = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TODOS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading local tasks', err);
  }
  localStorage.setItem(LOCAL_STORAGE_TODOS_KEY, JSON.stringify(defaultTasks));
  return defaultTasks;
};

const saveLocalTasks = (tasks) => {
  localStorage.setItem(LOCAL_STORAGE_TODOS_KEY, JSON.stringify(tasks));
};

// Telegram API Request Helper
const callTelegramApi = async (botToken, method, payload = null) => {
  const url = `https://api.telegram.org/bot${botToken}/${method}`;
  const options = {
    method: payload ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (payload) {
    options.body = JSON.stringify(payload);
  }

  const res = await fetch(url, options);
  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.description || `Telegram API error: ${data.error_code}`);
  }
  return data.result;
};

// Extract JSON content from a message text (supporting raw JSON or codeblock fenced JSON)
const extractJsonFromMessage = (text) => {
  if (!text) return null;
  try {
    // Try raw parse first
    return JSON.parse(text);
  } catch (e) {
    // Check if wrapped in ```json ... ```
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (err) {
        console.warn('Failed parsing extracted JSON snippet', err);
      }
    }
  }
  return null;
};

// Format master database state JSON message
const formatMasterMessage = (todos) => {
  const payload = {
    _db: "OUR_DAILY_TARGETS_DATABASE",
    updatedAt: new Date().toISOString(),
    total: todos.length,
    completed: todos.filter(t => t.isCompleted).length,
    todos: todos
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  return `📦 <b>[OUR_TODO_DATABASE_MASTER]</b>\n` +
         `🔄 <i>Last Updated: ${new Date().toLocaleString()}</i>\n\n` +
         `<pre><code class="language-json">${escapeHtml(jsonStr)}</code></pre>`;
};

// Format individual action log message
const formatActionLogMessage = (action, todo) => {
  const actionEmoji = {
    CREATE: '✨ #TODO_CREATED',
    UPDATE: '✏️ #TODO_UPDATED',
    TOGGLE: todo?.isCompleted ? '✅ #TODO_COMPLETED' : '🔄 #TODO_UNCHECKED',
    DELETE: '🗑️ #TODO_DELETED',
  }[action] || '📌 #TODO_ACTION';

  const logPayload = {
    action,
    timestamp: new Date().toISOString(),
    todo
  };

  const jsonStr = JSON.stringify(logPayload, null, 2);

  return `<b>${actionEmoji}</b>\n` +
         `<b>Target:</b> ${escapeHtml(todo.title || 'Untitled')}\n` +
         `<b>Owner:</b> ${todo.owner === 'me' ? 'Me' : 'Her'}\n` +
         `<b>Status:</b> ${todo.isCompleted ? 'Completed ✅' : 'Pending ⏳'}\n\n` +
         `<pre><code class="language-json">${escapeHtml(jsonStr)}</code></pre>`;
};

const escapeHtml = (unsafe) => {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Test Telegram Credentials
export const testTelegramConnection = async (botToken, channelId) => {
  try {
    // 1. Verify Bot Token
    const botInfo = await callTelegramApi(botToken, 'getMe');
    
    // 2. Verify Channel Access
    const chatInfo = await callTelegramApi(botToken, 'getChat', { chat_id: channelId });
    
    return {
      success: true,
      botUsername: botInfo.username,
      chatTitle: chatInfo.title || chatInfo.username || channelId,
      chatId: chatInfo.id,
      pinnedMessage: chatInfo.pinned_message || null,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
};

// API Service
export const todoApi = {
  // Fetch all tasks from Telegram Channel (or local fallback)
  async listTodos() {
    const config = getStoredTelegramConfig();

    if (config.botToken && config.channelId) {
      try {
        const chatInfo = await callTelegramApi(config.botToken, 'getChat', {
          chat_id: config.channelId,
        });

        // 1. Check if channel has a pinned database message
        if (chatInfo.pinned_message?.text) {
          const parsed = extractJsonFromMessage(chatInfo.pinned_message.text);
          if (parsed && Array.isArray(parsed.todos)) {
            // Save master message id for fast future edits
            localStorage.setItem(TELEGRAM_MASTER_MSG_ID_KEY, String(chatInfo.pinned_message.message_id));
            saveLocalTasks(parsed.todos);
            return { data: parsed.todos, source: 'telegram' };
          }
        }

        // 2. Check if we have a saved master message id
        const savedMsgId = localStorage.getItem(TELEGRAM_MASTER_MSG_ID_KEY);
        if (savedMsgId) {
          // If master message exists, we return current local cache synced with telegram
          const local = getLocalTasks();
          return { data: local, source: 'telegram' };
        }

        // 3. First time connecting with Telegram: initialize channel with existing tasks!
        const initialTasks = getLocalTasks();
        await this.syncFullDatabaseToTelegram(initialTasks, config);
        return { data: initialTasks, source: 'telegram' };

      } catch (err) {
        console.warn('Telegram channel fetch failed, using local cache:', err.message);
        return { data: getLocalTasks(), source: 'local', error: err.message };
      }
    }

    return { data: getLocalTasks(), source: 'local' };
  },

  // Sync the entire database state to the Telegram channel & pin it
  async syncFullDatabaseToTelegram(todos, customConfig = null) {
    const config = customConfig || getStoredTelegramConfig();
    if (!config.botToken || !config.channelId) return false;

    const masterText = formatMasterMessage(todos);
    let masterMsgId = localStorage.getItem(TELEGRAM_MASTER_MSG_ID_KEY);

    // Try to edit existing master message first to avoid clutter
    if (masterMsgId) {
      try {
        await callTelegramApi(config.botToken, 'editMessageText', {
          chat_id: config.channelId,
          message_id: Number(masterMsgId),
          text: masterText,
          parse_mode: 'HTML',
        });
        return true;
      } catch (err) {
        console.debug('Could not edit existing master message, will post a new one:', err.message);
      }
    }

    // Otherwise, post a new master message and pin it
    try {
      const sent = await callTelegramApi(config.botToken, 'sendMessage', {
        chat_id: config.channelId,
        text: masterText,
        parse_mode: 'HTML',
      });

      if (sent?.message_id) {
        masterMsgId = String(sent.message_id);
        localStorage.setItem(TELEGRAM_MASTER_MSG_ID_KEY, masterMsgId);

        // Pin the master message in the Telegram channel
        try {
          await callTelegramApi(config.botToken, 'pinChatMessage', {
            chat_id: config.channelId,
            message_id: sent.message_id,
            disable_notification: true,
          });
        } catch (pinErr) {
          console.warn('Could not pin message (bot needs pin permission in channel):', pinErr.message);
        }
      }
      return true;
    } catch (err) {
      console.error('Failed to post master database message to Telegram:', err);
      throw err;
    }
  },

  // Post individual JSON action to the channel
  async postActionLog(action, todo, config) {
    if (!config.botToken || !config.channelId) return;
    try {
      const logText = formatActionLogMessage(action, todo);
      await callTelegramApi(config.botToken, 'sendMessage', {
        chat_id: config.channelId,
        text: logText,
        parse_mode: 'HTML',
      });
    } catch (err) {
      console.warn('Failed to send JSON action log to Telegram channel:', err.message);
    }
  },

  // Create a new task
  async createTodo(taskData) {
    const config = getStoredTelegramConfig();
    const newTask = {
      $id: 'tg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: taskData.title,
      description: taskData.description || '',
      linkUrl: taskData.linkUrl || '',
      linkTitle: taskData.linkTitle || '',
      isCompleted: Boolean(taskData.isCompleted),
      owner: taskData.owner || 'me',
      targetDate: taskData.targetDate || getTodayDateStr(),
      createdAt: new Date().toISOString(),
    };

    // Update local cache
    const localTasks = getLocalTasks();
    localTasks.unshift(newTask);
    saveLocalTasks(localTasks);

    // Sync to Telegram channel
    if (config.botToken && config.channelId) {
      try {
        // 1. Post JSON transaction message to the channel feed
        this.postActionLog('CREATE', newTask, config);

        // 2. Update master pinned database state in Telegram
        await this.syncFullDatabaseToTelegram(localTasks, config);
      } catch (err) {
        console.error('Telegram createTodo error:', err);
      }
    }

    return newTask;
  },

  // Update a task (completion status, title, link, notes, date)
  async updateTodo(id, updates) {
    const config = getStoredTelegramConfig();
    const localTasks = getLocalTasks();
    const index = localTasks.findIndex((t) => t.$id === id);

    if (index !== -1) {
      localTasks[index] = { ...localTasks[index], ...updates };
      saveLocalTasks(localTasks);
      const updatedItem = localTasks[index];

      // Sync to Telegram channel
      if (config.botToken && config.channelId) {
        try {
          const actionType = 'isCompleted' in updates ? 'TOGGLE' : 'UPDATE';
          this.postActionLog(actionType, updatedItem, config);
          await this.syncFullDatabaseToTelegram(localTasks, config);
        } catch (err) {
          console.error('Telegram updateTodo error:', err);
        }
      }

      return updatedItem;
    }
    return null;
  },

  // Delete a task
  async deleteTodo(id) {
    const config = getStoredTelegramConfig();
    const localTasks = getLocalTasks();
    const itemToDelete = localTasks.find((t) => t.$id === id);
    const filtered = localTasks.filter((t) => t.$id !== id);
    saveLocalTasks(filtered);

    // Sync to Telegram channel
    if (config.botToken && config.channelId) {
      try {
        if (itemToDelete) {
          this.postActionLog('DELETE', itemToDelete, config);
        }
        await this.syncFullDatabaseToTelegram(filtered, config);
      } catch (err) {
        console.error('Telegram deleteTodo error:', err);
      }
    }

    return true;
  },

  // Real-time listener: Polls Telegram channel master state periodically (every 18 seconds)
  subscribeToChanges(callback) {
    const config = getStoredTelegramConfig();
    if (!config.botToken || !config.channelId) {
      return () => {};
    }

    const intervalId = setInterval(async () => {
      try {
        const chatInfo = await callTelegramApi(config.botToken, 'getChat', {
          chat_id: config.channelId,
        });

        if (chatInfo.pinned_message?.text) {
          const parsed = extractJsonFromMessage(chatInfo.pinned_message.text);
          if (parsed && Array.isArray(parsed.todos)) {
            callback({ source: 'telegram_poll', todos: parsed.todos });
          }
        }
      } catch (e) {
        // Silently continue polling
      }
    }, 18000);

    return () => clearInterval(intervalId);
  }
};
