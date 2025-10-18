import Dexie from 'dexie';

// Initialize Dexie database
export const db = new Dexie('MindFlowDB');

// Define database schema
db.version(1).stores({
  // Journal entries table
  journal_entries: '++id, date, mood, moodEmoji, energy, sleepHours, sleepQuality, createdAt, updatedAt',

  // Schedule table
  schedule: '++id, subject, dayOfWeek, startTime, endTime, recurring',

  // Homework table
  homework: '++id, subject, dueDate, priority, completed, createdAt, completedAt',

  // Settings table
  settings: 'id, language, isPremium, premiumExpiresAt'
});

// Version 2: Add tasks table (Things 3 style)
db.version(2).stores({
  // Keep existing tables
  journal_entries: '++id, date, mood, moodEmoji, energy, sleepHours, sleepQuality, createdAt, updatedAt',
  schedule: '++id, subject, dayOfWeek, startTime, endTime, recurring',
  homework: '++id, subject, dueDate, priority, completed, createdAt, completedAt',
  settings: 'id, language, isPremium, premiumExpiresAt',

  // New tasks table (Things 3 style)
  tasks: '++id, title, notes, list, area, project, when, deadline, tags, completed, createdAt, completedAt, updatedAt'
});

// Version 3: Add AI messages and user stats
db.version(3).stores({
  journal_entries: '++id, date, mood, moodEmoji, energy, sleepHours, sleepQuality, createdAt, updatedAt',
  schedule: '++id, subject, dayOfWeek, startTime, endTime, recurring',
  homework: '++id, subject, dueDate, priority, completed, createdAt, completedAt',
  settings: 'id, language, isPremium, premiumExpiresAt',
  tasks: '++id, title, notes, list, area, project, when, deadline, tags, completed, reminder, createdAt, completedAt, updatedAt',

  // AI messages and insights
  ai_messages: '++id, role, content, createdAt',

  // User stats and memories
  user_stats: 'id, totalEntries, currentStreak, longestStreak, lastEntryDate, totalTasks, completedTasks'
});

// Helper functions for Journal Entries
export const journalEntries = {
  // Get all entries
  getAll: async () => {
    return await db.journal_entries.toArray();
  },

  // Get entry by date
  getByDate: async (date) => {
    return await db.journal_entries.where('date').equals(date).first();
  },

  // Get entries for a date range
  getByDateRange: async (startDate, endDate) => {
    return await db.journal_entries
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  },

  // Get last N entries
  getLastN: async (n) => {
    return await db.journal_entries
      .orderBy('date')
      .reverse()
      .limit(n)
      .toArray();
  },

  // Create new entry
  create: async (entry) => {
    const now = Date.now();
    return await db.journal_entries.add({
      ...entry,
      createdAt: now,
      updatedAt: now
    });
  },

  // Update entry
  update: async (id, updates) => {
    return await db.journal_entries.update(id, {
      ...updates,
      updatedAt: Date.now()
    });
  },

  // Delete entry
  delete: async (id) => {
    return await db.journal_entries.delete(id);
  },

  // Check if entry exists for date
  existsForDate: async (date) => {
    const entry = await db.journal_entries.where('date').equals(date).first();
    return !!entry;
  }
};

// Helper functions for Schedule
export const schedule = {
  // Get all schedule items
  getAll: async () => {
    return await db.schedule.toArray();
  },

  // Get schedule for specific day
  getByDay: async (dayOfWeek) => {
    return await db.schedule
      .where('dayOfWeek')
      .equals(dayOfWeek)
      .sortBy('startTime');
  },

  // Create schedule item
  create: async (item) => {
    return await db.schedule.add(item);
  },

  // Update schedule item
  update: async (id, updates) => {
    return await db.schedule.update(id, updates);
  },

  // Delete schedule item
  delete: async (id) => {
    return await db.schedule.delete(id);
  }
};

// Helper functions for Homework
export const homework = {
  // Get all homework
  getAll: async () => {
    return await db.homework.orderBy('dueDate').toArray();
  },

  // Get active (not completed) homework
  getActive: async () => {
    return await db.homework
      .where('completed')
      .equals(0)
      .sortBy('dueDate');
  },

  // Get completed homework
  getCompleted: async () => {
    return await db.homework
      .where('completed')
      .equals(1)
      .reverse()
      .sortBy('completedAt');
  },

  // Get homework due by date
  getDueBy: async (date) => {
    return await db.homework
      .where('dueDate')
      .belowOrEqual(date)
      .and(item => !item.completed)
      .toArray();
  },

  // Create homework
  create: async (item) => {
    return await db.homework.add({
      ...item,
      completed: false,
      completedAt: null,
      createdAt: Date.now()
    });
  },

  // Update homework
  update: async (id, updates) => {
    return await db.homework.update(id, updates);
  },

  // Toggle completion
  toggleComplete: async (id) => {
    const item = await db.homework.get(id);
    return await db.homework.update(id, {
      completed: !item.completed,
      completedAt: !item.completed ? Date.now() : null
    });
  },

  // Delete homework
  delete: async (id) => {
    return await db.homework.delete(id);
  }
};

// Helper functions for Settings
export const settings = {
  // Get settings
  get: async () => {
    let setting = await db.settings.get(1);

    // Initialize default settings if not exists
    if (!setting) {
      const defaultSettings = {
        id: 1,
        language: 'ru',
        notifications: {
          dailyReminder: true,
          homeworkReminders: true,
          weeklyInsights: false
        },
        isPremium: false,
        premiumExpiresAt: null
      };

      await db.settings.add(defaultSettings);
      setting = defaultSettings;
    }

    return setting;
  },

  // Update settings
  update: async (updates) => {
    return await db.settings.update(1, updates);
  },

  // Update language
  setLanguage: async (language) => {
    return await db.settings.update(1, { language });
  },

  // Update notifications
  setNotifications: async (notifications) => {
    return await db.settings.update(1, { notifications });
  },

  // Check premium status
  checkPremium: async () => {
    const setting = await db.settings.get(1);
    if (!setting || !setting.isPremium) return false;

    // Check if premium expired
    if (setting.premiumExpiresAt && setting.premiumExpiresAt < Date.now()) {
      await db.settings.update(1, { isPremium: false });
      return false;
    }

    return true;
  },

  // Activate premium
  activatePremium: async (expiresAt) => {
    return await db.settings.update(1, {
      isPremium: true,
      premiumExpiresAt: expiresAt
    });
  },

  // AI Usage tracking
  getAIUsage: async () => {
    const setting = await settings.get();
    const today = new Date().toISOString().split('T')[0];

    if (!setting.aiUsage) {
      const aiUsage = {
        date: today,
        count: 0,
        limit: 10 // Free users get 10 requests per day
      };
      await db.settings.update(1, { aiUsage });
      return aiUsage;
    }

    // Reset count if it's a new day
    if (setting.aiUsage.date !== today) {
      const aiUsage = {
        date: today,
        count: 0,
        limit: setting.isPremium ? 50 : 10
      };
      await db.settings.update(1, { aiUsage });
      return aiUsage;
    }

    return setting.aiUsage;
  },

  incrementAIUsage: async () => {
    const usage = await settings.getAIUsage();
    const newUsage = {
      ...usage,
      count: usage.count + 1
    };
    await db.settings.update(1, { aiUsage: newUsage });
    return newUsage;
  }
};

// Helper functions for Tasks (Things 3 style)
export const tasks = {
  // Get all tasks
  getAll: async () => {
    return await db.tasks.orderBy('createdAt').reverse().toArray();
  },

  // Get inbox tasks (no when, no area, no project)
  getInbox: async () => {
    return await db.tasks
      .filter(task => !task.completed && !task.when && !task.area && !task.project)
      .toArray();
  },

  // Get today's tasks
  getToday: async () => {
    const today = new Date().toISOString().split('T')[0];
    return await db.tasks
      .filter(task => !task.completed && task.when === 'today')
      .toArray();
  },

  // Get upcoming tasks
  getUpcoming: async () => {
    return await db.tasks
      .filter(task => !task.completed && task.when && task.when !== 'today' && task.when !== 'someday')
      .sortBy('when');
  },

  // Get someday tasks
  getSomeday: async () => {
    return await db.tasks
      .filter(task => !task.completed && task.when === 'someday')
      .toArray();
  },

  // Get tasks by area
  getByArea: async (area) => {
    return await db.tasks
      .where('area')
      .equals(area)
      .and(task => !task.completed)
      .toArray();
  },

  // Get tasks by project
  getByProject: async (project) => {
    return await db.tasks
      .where('project')
      .equals(project)
      .and(task => !task.completed)
      .toArray();
  },

  // Get completed tasks
  getCompleted: async () => {
    return await db.tasks
      .where('completed')
      .equals(true)
      .reverse()
      .sortBy('completedAt');
  },

  // Get all areas
  getAreas: async () => {
    const allTasks = await db.tasks.toArray();
    const areas = [...new Set(allTasks.filter(t => t.area).map(t => t.area))];
    return areas;
  },

  // Get all projects
  getProjects: async () => {
    const allTasks = await db.tasks.toArray();
    const projects = [...new Set(allTasks.filter(t => t.project).map(t => t.project))];
    return projects;
  },

  // Create task
  create: async (task) => {
    const now = Date.now();
    return await db.tasks.add({
      title: '',
      notes: '',
      list: 'inbox', // inbox, today, upcoming, someday
      area: null,
      project: null,
      when: null, // null, 'today', date string, 'someday'
      deadline: null,
      tags: [],
      completed: false,
      ...task,
      createdAt: now,
      updatedAt: now,
      completedAt: null
    });
  },

  // Update task
  update: async (id, updates) => {
    return await db.tasks.update(id, {
      ...updates,
      updatedAt: Date.now()
    });
  },

  // Toggle completion
  toggleComplete: async (id) => {
    const task = await db.tasks.get(id);
    return await db.tasks.update(id, {
      completed: !task.completed,
      completedAt: !task.completed ? Date.now() : null,
      updatedAt: Date.now()
    });
  },

  // Delete task
  delete: async (id) => {
    return await db.tasks.delete(id);
  },

  // Move task to today
  moveToToday: async (id) => {
    return await db.tasks.update(id, {
      when: 'today',
      list: 'today',
      updatedAt: Date.now()
    });
  },

  // Move task to someday
  moveToSomeday: async (id) => {
    return await db.tasks.update(id, {
      when: 'someday',
      list: 'someday',
      updatedAt: Date.now()
    });
  },

  // Schedule task for specific date
  scheduleFor: async (id, date) => {
    return await db.tasks.update(id, {
      when: date,
      list: 'upcoming',
      updatedAt: Date.now()
    });
  }
};

// Export data as JSON
export const exportData = async () => {
  const entries = await journalEntries.getAll();
  const scheduleItems = await schedule.getAll();
  const homeworkItems = await homework.getAll();
  const settingsData = await settings.get();

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      journal_entries: entries,
      schedule: scheduleItems,
      homework: homeworkItems,
      settings: settingsData
    }
  };
};

// Import data from JSON
export const importData = async (jsonData) => {
  try {
    const { data } = jsonData;

    // Clear existing data
    await db.journal_entries.clear();
    await db.schedule.clear();
    await db.homework.clear();

    // Import data
    if (data.journal_entries) {
      await db.journal_entries.bulkAdd(data.journal_entries);
    }
    if (data.schedule) {
      await db.schedule.bulkAdd(data.schedule);
    }
    if (data.homework) {
      await db.homework.bulkAdd(data.homework);
    }
    if (data.settings) {
      await db.settings.put(data.settings);
    }

    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
};

// Clear all data
export const clearAllData = async () => {
  await db.journal_entries.clear();
  await db.schedule.clear();
  await db.homework.clear();
  await db.tasks.clear();
  await db.ai_messages.clear();
  await db.settings.update(1, {
    language: 'ru',
    notifications: {
      dailyReminder: true,
      homeworkReminders: true,
      weeklyInsights: false
    },
    isPremium: false,
    premiumExpiresAt: null
  });
};

// Helper functions for AI Messages
export const aiMessages = {
  // Get all messages
  getAll: async () => {
    return await db.ai_messages.orderBy('createdAt').toArray();
  },

  // Get recent N messages
  getRecent: async (n = 20) => {
    return await db.ai_messages.orderBy('createdAt').reverse().limit(n).toArray();
  },

  // Add message
  add: async (role, content) => {
    return await db.ai_messages.add({
      role, // 'user' or 'assistant'
      content,
      createdAt: Date.now()
    });
  },

  // Clear all messages
  clear: async () => {
    return await db.ai_messages.clear();
  }
};

// Helper functions for User Stats
export const userStats = {
  // Get stats
  get: async () => {
    let stats = await db.user_stats.get(1);

    if (!stats) {
      const defaultStats = {
        id: 1,
        totalEntries: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastEntryDate: null,
        totalTasks: 0,
        completedTasks: 0
      };
      await db.user_stats.add(defaultStats);
      stats = defaultStats;
    }

    return stats;
  },

  // Update entry stats
  updateEntryStats: async () => {
    const stats = await userStats.get();
    const entries = await journalEntries.getAll();
    const today = new Date().toISOString().split('T')[0];

    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 0;

    // Calculate streaks
    const sortedEntries = entries.sort((a, b) => new Date(b.date) - new Date(a.date));

    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (entryDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
        if (i === 0) currentStreak = streak;
        longestStreak = Math.max(longestStreak, streak);
      } else {
        if (i === 0) currentStreak = 0;
        streak = 0;
      }
    }

    return await db.user_stats.update(1, {
      totalEntries: entries.length,
      currentStreak,
      longestStreak: Math.max(stats.longestStreak, longestStreak),
      lastEntryDate: today
    });
  },

  // Update task stats
  updateTaskStats: async () => {
    const allTasks = await tasks.getAll();
    const completed = allTasks.filter(t => t.completed).length;

    return await db.user_stats.update(1, {
      totalTasks: allTasks.length,
      completedTasks: completed
    });
  }
};

export default db;
