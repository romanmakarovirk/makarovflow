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

export default db;
