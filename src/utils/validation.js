/**
 * Input validation utilities for MakarovFlow
 * Provides validation functions for all user inputs
 */

/**
 * Validate journal entry data
 */
export const validateJournalEntry = (entry) => {
  const errors = [];

  // Validate mood (1-10)
  if (entry.mood === undefined || entry.mood === null) {
    errors.push('Mood is required');
  } else if (typeof entry.mood !== 'number' || entry.mood < 1 || entry.mood > 10) {
    errors.push('Mood must be a number between 1 and 10');
  }

  // Validate energy (0-100)
  if (entry.energy !== undefined && entry.energy !== null) {
    if (typeof entry.energy !== 'number' || entry.energy < 0 || entry.energy > 100) {
      errors.push('Energy must be a number between 0 and 100');
    }
  }

  // Validate sleep hours (0-24)
  if (entry.sleepHours !== undefined && entry.sleepHours !== null) {
    if (typeof entry.sleepHours !== 'number' || entry.sleepHours < 0 || entry.sleepHours > 24) {
      errors.push('Sleep hours must be a number between 0 and 24');
    }
  }

  // Validate sleep quality (1-5)
  if (entry.sleepQuality !== undefined && entry.sleepQuality !== null) {
    if (typeof entry.sleepQuality !== 'number' || entry.sleepQuality < 1 || entry.sleepQuality > 5) {
      errors.push('Sleep quality must be a number between 1 and 5');
    }
  }

  // Validate notes length (max 5000 chars)
  if (entry.note && typeof entry.note === 'string' && entry.note.length > 5000) {
    errors.push('Note must be less than 5000 characters');
  }

  // Validate tags (array of strings)
  if (entry.tags && !Array.isArray(entry.tags)) {
    errors.push('Tags must be an array');
  } else if (entry.tags && entry.tags.length > 20) {
    errors.push('Maximum 20 tags allowed');
  }

  // Validate date format
  if (entry.date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(entry.date)) {
      errors.push('Date must be in YYYY-MM-DD format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate task data
 */
export const validateTask = (task) => {
  const errors = [];

  // Validate title (required, max 500 chars)
  if (!task.title || typeof task.title !== 'string') {
    errors.push('Title is required');
  } else if (task.title.trim().length === 0) {
    errors.push('Title cannot be empty');
  } else if (task.title.length > 500) {
    errors.push('Title must be less than 500 characters');
  }

  // Validate notes length (max 5000 chars)
  if (task.notes && typeof task.notes === 'string' && task.notes.length > 5000) {
    errors.push('Notes must be less than 5000 characters');
  }

  // Validate list type
  const validLists = ['inbox', 'today', 'upcoming', 'someday'];
  if (task.list && !validLists.includes(task.list)) {
    errors.push(`List must be one of: ${validLists.join(', ')}`);
  }

  // Validate tags
  if (task.tags && !Array.isArray(task.tags)) {
    errors.push('Tags must be an array');
  } else if (task.tags && task.tags.length > 20) {
    errors.push('Maximum 20 tags allowed');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate homework data
 */
export const validateHomework = (homework) => {
  const errors = [];

  // Validate subject (required, max 255 chars)
  if (!homework.subject || typeof homework.subject !== 'string') {
    errors.push('Subject is required');
  } else if (homework.subject.trim().length === 0) {
    errors.push('Subject cannot be empty');
  } else if (homework.subject.length > 255) {
    errors.push('Subject must be less than 255 characters');
  }

  // Validate description length (max 5000 chars)
  if (homework.description && typeof homework.description === 'string' && homework.description.length > 5000) {
    errors.push('Description must be less than 5000 characters');
  }

  // Validate priority
  const validPriorities = ['low', 'medium', 'high'];
  if (homework.priority && !validPriorities.includes(homework.priority)) {
    errors.push(`Priority must be one of: ${validPriorities.join(', ')}`);
  }

  // Validate date format
  if (homework.dueDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(homework.dueDate)) {
      errors.push('Due date must be in YYYY-MM-DD format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize string input (remove potentially dangerous characters)
 */
export const sanitizeString = (str, maxLength = 5000) => {
  if (typeof str !== 'string') return '';
  
  // Remove null bytes and control characters except newlines and tabs
  let sanitized = str.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized.trim();
};

/**
 * Sanitize HTML (basic protection against XSS)
 */
export const sanitizeHTML = (html) => {
  if (typeof html !== 'string') return '';
  
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
};

/**
 * Validate AI message input
 */
export const validateAIMessage = (message) => {
  const errors = [];

  if (!message || typeof message !== 'string') {
    errors.push('Message is required');
  } else if (message.trim().length === 0) {
    errors.push('Message cannot be empty');
  } else if (message.length > 2000) {
    errors.push('Message must be less than 2000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: sanitizeString(message, 2000)
  };
};

