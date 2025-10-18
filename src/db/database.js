import Dexie from 'dexie';

// Initialize Dexie database
export const db = new Dexie('MakarovFlowDB');

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

// Version 3: Add workout fields to journal_entries
db.version(3).stores({
  journal_entries: '++id, date, mood, moodEmoji, energy, sleepHours, sleepQuality, workoutMinutes, workoutCalories, createdAt, updatedAt',
  schedule: '++id, subject, dayOfWeek, startTime, endTime, recurring',
  homework: '++id, subject, dueDate, priority, completed, createdAt, completedAt',
  settings: 'id, language, isPremium, premiumExpiresAt',
  tasks: '++id, title, notes, list, area, project, when, deadline, tags, completed, createdAt, completedAt, updatedAt'
});

// Version 4: Add AI chat messages table
db.version(4).stores({
  journal_entries: '++id, date, mood, moodEmoji, energy, sleepHours, sleepQuality, workoutMinutes, workoutCalories, createdAt, updatedAt',
  schedule: '++id, subject, dayOfWeek, startTime, endTime, recurring',
  homework: '++id, subject, dueDate, priority, completed, createdAt, completedAt',
  settings: 'id, language, isPremium, premiumExpiresAt',
  tasks: '++id, title, notes, list, area, project, when, deadline, tags, completed, createdAt, completedAt, updatedAt',
  ai_messages: '++id, role, content, createdAt'
});

// Version 5: Add reminder field to tasks table
db.version(5).stores({
  journal_entries: '++id, date, mood, moodEmoji, energy, sleepHours, sleepQuality, workoutMinutes, workoutCalories, createdAt, updatedAt',
  schedule: '++id, subject, dayOfWeek, startTime, endTime, recurring',
  homework: '++id, subject, dueDate, priority, completed, createdAt, completedAt',
  settings: 'id, language, isPremium, premiumExpiresAt',
  tasks: '++id, title, notes, list, area, project, when, deadline, tags, completed, reminder, createdAt, completedAt, updatedAt',
  ai_messages: '++id, role, content, createdAt'
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
        theme: 'dark',
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

  // Update theme
  setTheme: async (theme) => {
    return await db.settings.update(1, { theme });
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

  // Get AI usage (free: 3/day, premium: 15/day)
  getAIUsage: async () => {
    const setting = await settings.get();
    const today = new Date().toISOString().split('T')[0];

    if (!setting.aiUsage || setting.aiUsage.date !== today) {
      return { count: 0, date: today, limit: setting.isPremium ? 15 : 3 };
    }

    return {
      count: setting.aiUsage.count,
      date: today,
      limit: setting.isPremium ? 15 : 3
    };
  },

  // Increment AI usage
  incrementAIUsage: async () => {
    const setting = await settings.get();
    const today = new Date().toISOString().split('T')[0];

    let newCount = 1;
    if (setting.aiUsage && setting.aiUsage.date === today) {
      newCount = setting.aiUsage.count + 1;
    }

    await db.settings.update(1, {
      aiUsage: { count: newCount, date: today }
    });

    return newCount;
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
      reminder: null, // timestamp when to send reminder
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

// Helper functions for AI Messages
export const aiMessages = {
  // Get all messages
  getAll: async () => {
    return await db.ai_messages.orderBy('createdAt').toArray();
  },

  // Get recent messages (last N)
  getRecent: async (n = 50) => {
    return await db.ai_messages
      .orderBy('createdAt')
      .reverse()
      .limit(n)
      .toArray();
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
  },

  // Delete message
  delete: async (id) => {
    return await db.ai_messages.delete(id);
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
