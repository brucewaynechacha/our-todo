// Telegram Channel Database Engine
// - Always fetches directly from Telegram channel
// - Zero local storage for todos
// - Strictly 1 message per day in Telegram channel, updating in-place (no spam)

import { getTodayDateStr } from './dates';

const TELEGRAM_CONFIG_KEY = 'our_todo_telegram_config';
const TELEGRAM_DAY_MSG_MAP_KEY = 'our_todo_telegram_day_msg_map';

// Wipe any legacy local storage todos
try {
  localStorage.removeItem('our_todo_local_tasks_backup');
} catch (e) {
  // Ignore
}

// Config getters/setters
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
    console.warn('Failed reading Telegram config', e);
  }

  return envConfig;
};

export const saveTelegramConfig = (config) => {
  localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(config));
};

export const clearTelegramConfig = () => {
  localStorage.removeItem(TELEGRAM_CONFIG_KEY);
  localStorage.removeItem(TELEGRAM_DAY_MSG_MAP_KEY);
};

export const isTelegramConfigured = () => {
  const cfg = getStoredTelegramConfig();
  return Boolean(cfg.botToken && cfg.channelId);
};

// Day-to-MessageId tracker
const getDayMessageId = (dateStr) => {
  try {
    const raw = localStorage.getItem(TELEGRAM_DAY_MSG_MAP_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      return map[dateStr] || null;
    }
  } catch (e) {}
  return null;
};

const setDayMessageId = (dateStr, messageId) => {
  try {
    const raw = localStorage.getItem(TELEGRAM_DAY_MSG_MAP_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[dateStr] = messageId;
    localStorage.setItem(TELEGRAM_DAY_MSG_MAP_KEY, JSON.stringify(map));
  } catch (e) {}
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
    // If it's a Telegram "message is not modified" error, we can handle it safely
    if (data.description && data.description.includes('message is not modified')) {
      return { notModified: true };
    }
    throw new Error(data.description || `Telegram API error: ${data.error_code}`);
  }
  return data.result;
};

// Robust JSON extractor that finds ANY valid JSON object inside text
const extractJsonFromMessage = (text) => {
  if (!text) return null;

  // 1. Direct parse
  try {
    return JSON.parse(text);
  } catch (e) {}

  // 2. Fenced code block (```json ... ```)
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced && fenced[1]) {
    try {
      return JSON.parse(fenced[1]);
    } catch (e) {}
  }

  // 3. Scan first '{' and last '}'
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(text.substring(start, end + 1));
    } catch (e) {}
  }

  return null;
};

const escapeHtml = (unsafe) => {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

// Format the SINGLE message for the day containing human checklist + embedded JSON
const formatDailyMessage = (todos, dateStr) => {
  const todayTodos = todos.filter((t) => (t.targetDate || dateStr) === dateStr);
  const meToday = todayTodos.filter((t) => t.owner === 'me');
  const herToday = todayTodos.filter((t) => t.owner === 'her');
  const otherDayTodos = todos.filter((t) => t.targetDate && t.targetDate !== dateStr);

  const completedToday = todayTodos.filter((t) => t.isCompleted).length;
  const totalToday = todayTodos.length;
  const percent = totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100);

  let msg = `🎯 <b>Daily Targets • ${dateStr}</b>\n`;
  msg += `📊 <b>Progress:</b> ${completedToday}/${totalToday} completed (${percent}%)\n\n`;

  // Me section
  msg += `👤 <b>Me:</b>\n`;
  if (meToday.length === 0) {
    msg += `<i>No targets yet</i>\n`;
  } else {
    meToday.forEach((t) => {
      const checkIcon = t.isCompleted ? '✅' : '⏳';
      msg += `${checkIcon} ${escapeHtml(t.title)}\n`;
    });
  }

  // Her section
  msg += `\n👤 <b>Her:</b>\n`;
  if (herToday.length === 0) {
    msg += `<i>No targets yet</i>\n`;
  } else {
    herToday.forEach((t) => {
      const checkIcon = t.isCompleted ? '✅' : '⏳';
      msg += `${checkIcon} ${escapeHtml(t.title)}\n`;
    });
  }

  // Next day or other scheduled targets if any
  if (otherDayTodos.length > 0) {
    msg += `\n📅 <b>Other Planned Targets (${otherDayTodos.length}):</b>\n`;
    otherDayTodos.forEach((t) => {
      const checkIcon = t.isCompleted ? '✅' : '⏳';
      msg += `${checkIcon} [${t.targetDate}] ${escapeHtml(t.title)} (${t.owner === 'me' ? 'Me' : 'Her'})\n`;
    });
  }

  // Embedded JSON Database payload
  const jsonPayload = {
    _db: "OUR_DAILY_TARGETS",
    date: dateStr,
    updatedAt: new Date().toISOString(),
    total: todos.length,
    todos: todos,
  };

  msg += `\n📦 <b>Database JSON:</b>\n`;
  msg += `<pre><code class="language-json">${escapeHtml(JSON.stringify(jsonPayload, null, 2))}</code></pre>`;

  return msg;
};

// Fetch current todos directly from Telegram Channel
export const getFreshTodosFromTelegram = async (config) => {
  if (!config.botToken || !config.channelId) {
    return { todos: [], messageId: null, date: null };
  }

  // 1. First attempt: check pinned_message in channel
  try {
    const chatInfo = await callTelegramApi(config.botToken, 'getChat', {
      chat_id: config.channelId,
    });

    if (chatInfo.pinned_message?.text) {
      const parsed = extractJsonFromMessage(chatInfo.pinned_message.text);
      if (parsed && Array.isArray(parsed.todos)) {
        return {
          todos: parsed.todos,
          messageId: chatInfo.pinned_message.message_id,
          date: parsed.date || getTodayDateStr(),
        };
      }
    }
  } catch (err) {
    console.warn('Telegram getChat error:', err.message);
  }

  // 2. Second attempt: search recent channel updates for the database message
  try {
    const updates = await callTelegramApi(config.botToken, 'getUpdates', { limit: 25 });
    if (Array.isArray(updates)) {
      // Look from newest to oldest
      for (let i = updates.length - 1; i >= 0; i--) {
        const post = updates[i].channel_post || updates[i].edited_channel_post || updates[i].message;
        if (post?.text) {
          const parsed = extractJsonFromMessage(post.text);
          if (parsed && Array.isArray(parsed.todos)) {
            return {
              todos: parsed.todos,
              messageId: post.message_id,
              date: parsed.date || getTodayDateStr(),
            };
          }
        }
      }
    }
  } catch (err) {
    console.debug('getUpdates check notice:', err.message);
  }

  // 3. Third attempt: check tracked message ID for today's date
  const todayStr = getTodayDateStr();
  const savedMsgId = getDayMessageId(todayStr);
  if (savedMsgId) {
    return { todos: [], messageId: savedMsgId, date: todayStr };
  }

  return { todos: [], messageId: null, date: todayStr };
};

// Test Telegram Credentials
export const testTelegramConnection = async (botToken, channelId) => {
  try {
    const botInfo = await callTelegramApi(botToken, 'getMe');
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

// API Service: Pure Telegram Channel Backend
export const todoApi = {
  // Always fetch fresh targets directly from Telegram Channel
  async listTodos() {
    const config = getStoredTelegramConfig();

    if (!config.botToken || !config.channelId) {
      return {
        data: [],
        source: 'unconfigured',
        error: 'Telegram channel not connected yet.',
      };
    }

    try {
      const { todos, messageId, date } = await getFreshTodosFromTelegram(config);
      const todayStr = getTodayDateStr();

      if (messageId) {
        setDayMessageId(date || todayStr, messageId);
      }

      // If channel is completely empty, initialize today's single message
      if (!messageId && todos.length === 0) {
        await this.saveDailyMessageToTelegram([], todayStr, config);
        return { data: [], source: 'telegram' };
      }

      return { data: todos, source: 'telegram' };
    } catch (err) {
      console.error('Error fetching directly from Telegram channel:', err);
      return { data: [], source: 'error', error: err.message };
    }
  },

  // Save/Update the SINGLE message for the day in the Telegram channel
  async saveDailyMessageToTelegram(todos, dateStr, customConfig = null) {
    const config = customConfig || getStoredTelegramConfig();
    if (!config.botToken || !config.channelId) {
      throw new Error('Telegram credentials not configured');
    }

    const todayStr = dateStr || getTodayDateStr();
    const formattedText = formatDailyMessage(todos, todayStr);

    let targetMsgId = getDayMessageId(todayStr);

    // If we don't have targetMsgId yet, check if pinned_message is for today
    if (!targetMsgId) {
      try {
        const chatInfo = await callTelegramApi(config.botToken, 'getChat', {
          chat_id: config.channelId,
        });
        if (chatInfo.pinned_message?.text) {
          const parsed = extractJsonFromMessage(chatInfo.pinned_message.text);
          if (parsed && (parsed.date === todayStr || !parsed.date)) {
            targetMsgId = chatInfo.pinned_message.message_id;
            setDayMessageId(todayStr, targetMsgId);
          }
        }
      } catch (e) {}
    }

    // 1. If message already exists for today: EDIT THAT MESSAGE ONLY! (No new message posted)
    if (targetMsgId) {
      try {
        await callTelegramApi(config.botToken, 'editMessageText', {
          chat_id: config.channelId,
          message_id: Number(targetMsgId),
          text: formattedText,
          parse_mode: 'HTML',
        });
        return targetMsgId;
      } catch (err) {
        console.warn('Could not edit existing message, creating new daily message:', err.message);
      }
    }

    // 2. Otherwise: send the 1 message for the day and pin it
    try {
      const sent = await callTelegramApi(config.botToken, 'sendMessage', {
        chat_id: config.channelId,
        text: formattedText,
        parse_mode: 'HTML',
      });

      if (sent?.message_id) {
        targetMsgId = sent.message_id;
        setDayMessageId(todayStr, targetMsgId);

        // Pin today's message so it is easily fetched and visible
        try {
          await callTelegramApi(config.botToken, 'pinChatMessage', {
            chat_id: config.channelId,
            message_id: sent.message_id,
            disable_notification: true,
          });
        } catch (pinErr) {
          console.warn('Could not pin message in Telegram channel:', pinErr.message);
        }
      }

      return targetMsgId;
    } catch (err) {
      console.error('Failed to post daily message to Telegram:', err);
      throw err;
    }
  },

  // Create a new task (fetches fresh list from Telegram, updates the single daily message in place)
  async createTodo(taskData) {
    const config = getStoredTelegramConfig();
    if (!config.botToken || !config.channelId) {
      throw new Error('Please connect your Telegram Bot and Channel first in Settings.');
    }

    const todayStr = getTodayDateStr();
    const newTask = {
      $id: 'tg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: taskData.title,
      description: taskData.description || '',
      linkUrl: taskData.linkUrl || '',
      linkTitle: taskData.linkTitle || '',
      isCompleted: Boolean(taskData.isCompleted),
      owner: taskData.owner || 'me',
      targetDate: taskData.targetDate || todayStr,
      createdAt: new Date().toISOString(),
    };

    // 1. Fetch current fresh list directly from Telegram channel
    const { todos } = await getFreshTodosFromTelegram(config);
    const updatedTodos = [newTask, ...todos];

    // 2. Update the SINGLE message for the current day in-place (no new message created!)
    await this.saveDailyMessageToTelegram(updatedTodos, todayStr, config);

    return newTask;
  },

  // Update a task (fetches fresh list from Telegram, edits the single daily message in place)
  async updateTodo(id, updates) {
    const config = getStoredTelegramConfig();
    if (!config.botToken || !config.channelId) {
      throw new Error('Please connect your Telegram Bot and Channel first in Settings.');
    }

    const todayStr = getTodayDateStr();

    // 1. Fetch current fresh list directly from Telegram channel
    const { todos } = await getFreshTodosFromTelegram(config);
    const index = todos.findIndex((t) => t.$id === id);

    if (index !== -1) {
      todos[index] = { ...todos[index], ...updates };
      const updatedItem = todos[index];

      // 2. Update the SINGLE message for the current day in-place
      await this.saveDailyMessageToTelegram(todos, todayStr, config);

      return updatedItem;
    }

    throw new Error('Target not found in Telegram channel');
  },

  // Delete a task (fetches fresh list from Telegram, edits the single daily message in place)
  async deleteTodo(id) {
    const config = getStoredTelegramConfig();
    if (!config.botToken || !config.channelId) {
      throw new Error('Please connect your Telegram Bot and Channel first in Settings.');
    }

    const todayStr = getTodayDateStr();

    // 1. Fetch current fresh list directly from Telegram channel
    const { todos } = await getFreshTodosFromTelegram(config);
    const filtered = todos.filter((t) => t.$id !== id);

    // 2. Update the SINGLE message for the current day in-place
    await this.saveDailyMessageToTelegram(filtered, todayStr, config);

    return true;
  },

  // Real-time listener: Polls Telegram channel directly every 8 seconds
  subscribeToChanges(callback) {
    const config = getStoredTelegramConfig();
    if (!config.botToken || !config.channelId) {
      return () => {};
    }

    const intervalId = setInterval(async () => {
      try {
        const { todos } = await getFreshTodosFromTelegram(config);
        if (todos) {
          callback({ todos });
        }
      } catch (e) {
        // Silently continue polling
      }
    }, 8000);

    return () => clearInterval(intervalId);
  }
};
