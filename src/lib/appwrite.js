import { Client, Databases, ID, Query } from 'appwrite';

import { getTodayDateStr } from './dates';

// Local storage key for storing user Appwrite settings if not using .env
const APPWRITE_CONFIG_KEY = 'our_todo_appwrite_config';
const LOCAL_STORAGE_TODOS_KEY = 'our_todo_local_tasks_backup';

// Default / fallback configurations
export const getStoredConfig = () => {
  const envConfig = {
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '',
    collectionId: import.meta.env.VITE_APPWRITE_COLLECTION_ID || '',
  };

  try {
    const custom = localStorage.getItem(APPWRITE_CONFIG_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      return {
        endpoint: parsed.endpoint || envConfig.endpoint,
        projectId: parsed.projectId || envConfig.projectId,
        databaseId: parsed.databaseId || envConfig.databaseId,
        collectionId: parsed.collectionId || envConfig.collectionId,
      };
    }
  } catch (e) {
    console.warn('Failed reading custom Appwrite config from localStorage', e);
  }

  return envConfig;
};

export const saveCustomConfig = (config) => {
  localStorage.setItem(APPWRITE_CONFIG_KEY, JSON.stringify(config));
};

export const clearCustomConfig = () => {
  localStorage.removeItem(APPWRITE_CONFIG_KEY);
};

// Check if Appwrite is fully configured
export const isAppwriteConfigured = () => {
  const cfg = getStoredConfig();
  return Boolean(cfg.projectId && cfg.databaseId && cfg.collectionId);
};

// Singleton client & databases instance
let client = null;
let databases = null;

export const initAppwrite = () => {
  const config = getStoredConfig();
  if (!config.projectId) {
    return { client: null, databases: null, config, isConfigured: false };
  }

  client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);

  databases = new Databases(client);

  return { client, databases, config, isConfigured: true };
};

// Seed initial default mock tasks for first-time onboarding
const defaultTasks = [
  {
    $id: 'mock-1',
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
    $id: 'mock-2',
    title: 'Review system architecture doc',
    description: 'Check database schema attributes and API flow.',
    linkUrl: 'https://appwrite.io/docs/products/databases',
    linkTitle: 'Appwrite DB Docs',
    isCompleted: false,
    owner: 'me',
    targetDate: getTodayDateStr(),
    createdAt: new Date().toISOString(),
  },
  {
    $id: 'mock-3',
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
    $id: 'mock-4',
    title: 'Test cross-device sync & link validation',
    description: 'Make sure all target links open smoothly in new tabs.',
    linkUrl: 'https://developer.mozilla.org',
    linkTitle: 'MDN Web Docs',
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

// API Service
export const todoApi = {
  // Fetch all tasks
  async listTodos() {
    const { databases: db, config, isConfigured } = initAppwrite();

    if (isConfigured && db) {
      try {
        const response = await db.listDocuments(
          config.databaseId,
          config.collectionId,
          [Query.orderDesc('createdAt'), Query.limit(100)]
        );
        return { data: response.documents, source: 'appwrite' };
      } catch (err) {
        console.warn('Appwrite fetch failed, falling back to local cache:', err.message);
        return { data: getLocalTasks(), source: 'local', error: err.message };
      }
    }

    return { data: getLocalTasks(), source: 'local' };
  },

  // Create a new task
  async createTodo(taskData) {
    const { databases: db, config, isConfigured } = initAppwrite();
    const payload = {
      title: taskData.title,
      description: taskData.description || '',
      linkUrl: taskData.linkUrl || '',
      linkTitle: taskData.linkTitle || '',
      isCompleted: Boolean(taskData.isCompleted),
      owner: taskData.owner || 'me',
      targetDate: taskData.targetDate || getTodayDateStr(),
      createdAt: new Date().toISOString(),
    };

    if (isConfigured && db) {
      try {
        const doc = await db.createDocument(
          config.databaseId,
          config.collectionId,
          ID.unique(),
          payload
        );
        return doc;
      } catch (err) {
        console.error('Appwrite createDocument error:', err);
        throw err;
      }
    }

    // Local fallback
    const localTasks = getLocalTasks();
    const newTask = {
      ...payload,
      $id: 'local-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    };
    localTasks.unshift(newTask);
    saveLocalTasks(localTasks);
    return newTask;
  },

  // Update a task (status, title, link, etc.)
  async updateTodo(id, updates) {
    const { databases: db, config, isConfigured } = initAppwrite();

    if (isConfigured && db && !id.startsWith('local-') && !id.startsWith('mock-')) {
      try {
        const doc = await db.updateDocument(
          config.databaseId,
          config.collectionId,
          id,
          updates
        );
        return doc;
      } catch (err) {
        console.error('Appwrite updateDocument error:', err);
        throw err;
      }
    }

    // Local fallback
    const localTasks = getLocalTasks();
    const index = localTasks.findIndex((t) => t.$id === id);
    if (index !== -1) {
      localTasks[index] = { ...localTasks[index], ...updates };
      saveLocalTasks(localTasks);
      return localTasks[index];
    }
    return null;
  },

  // Delete a task
  async deleteTodo(id) {
    const { databases: db, config, isConfigured } = initAppwrite();

    if (isConfigured && db && !id.startsWith('local-') && !id.startsWith('mock-')) {
      try {
        await db.deleteDocument(config.databaseId, config.collectionId, id);
        return true;
      } catch (err) {
        console.error('Appwrite deleteDocument error:', err);
        throw err;
      }
    }

    // Local fallback
    const localTasks = getLocalTasks();
    const filtered = localTasks.filter((t) => t.$id !== id);
    saveLocalTasks(filtered);
    return true;
  },

  // Real-time listener
  subscribeToChanges(callback) {
    const { client: appwriteClient, config, isConfigured } = initAppwrite();
    if (!isConfigured || !appwriteClient) {
      return () => {};
    }

    try {
      const channel = `databases.${config.databaseId}.collections.${config.collectionId}.documents`;
      const unsubscribe = appwriteClient.subscribe(channel, (response) => {
        callback(response);
      });
      return unsubscribe;
    } catch (err) {
      console.warn('Could not establish Appwrite realtime subscription:', err);
      return () => {};
    }
  }
};
