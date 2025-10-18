import WebApp from '@twa-dev/sdk';

// Initialize Telegram Web App
export const initTelegramApp = () => {
  try {
    WebApp.ready();
    WebApp.expand();

    // Set theme colors
    WebApp.setHeaderColor('#111827'); // gray-900
    WebApp.setBackgroundColor('#111827');

    // Enable closing confirmation
    WebApp.enableClosingConfirmation();

    console.log('Telegram Web App initialized');
    console.log('User:', WebApp.initDataUnsafe.user);

    return WebApp;
  } catch (error) {
    console.error('Failed to initialize Telegram Web App:', error);
    return null;
  }
};

// Haptic feedback helpers
export const haptic = {
  light: () => {
    try {
      WebApp.HapticFeedback.impactOccurred('light');
    } catch (e) {
      console.warn('Haptic feedback not available');
    }
  },
  medium: () => {
    try {
      WebApp.HapticFeedback.impactOccurred('medium');
    } catch (e) {
      console.warn('Haptic feedback not available');
    }
  },
  heavy: () => {
    try {
      WebApp.HapticFeedback.impactOccurred('heavy');
    } catch (e) {
      console.warn('Haptic feedback not available');
    }
  },
  success: () => {
    try {
      WebApp.HapticFeedback.notificationOccurred('success');
    } catch (e) {
      console.warn('Haptic feedback not available');
    }
  },
  warning: () => {
    try {
      WebApp.HapticFeedback.notificationOccurred('warning');
    } catch (e) {
      console.warn('Haptic feedback not available');
    }
  },
  error: () => {
    try {
      WebApp.HapticFeedback.notificationOccurred('error');
    } catch (e) {
      console.warn('Haptic feedback not available');
    }
  },
};

// Get user data
export const getTelegramUser = () => {
  try {
    return WebApp.initDataUnsafe.user || null;
  } catch (error) {
    console.error('Failed to get Telegram user:', error);
    return null;
  }
};

// Main button helpers
export const mainButton = {
  show: (text, onClick) => {
    try {
      WebApp.MainButton.setText(text);
      WebApp.MainButton.show();
      WebApp.MainButton.onClick(onClick);
    } catch (e) {
      console.warn('Main button not available');
    }
  },
  hide: () => {
    try {
      WebApp.MainButton.hide();
    } catch (e) {
      console.warn('Main button not available');
    }
  },
  setText: (text) => {
    try {
      WebApp.MainButton.setText(text);
    } catch (e) {
      console.warn('Main button not available');
    }
  },
  showProgress: () => {
    try {
      WebApp.MainButton.showProgress();
    } catch (e) {
      console.warn('Main button not available');
    }
  },
  hideProgress: () => {
    try {
      WebApp.MainButton.hideProgress();
    } catch (e) {
      console.warn('Main button not available');
    }
  },
};

// Back button helpers
export const backButton = {
  show: (onClick) => {
    try {
      WebApp.BackButton.show();
      WebApp.BackButton.onClick(onClick);
    } catch (e) {
      console.warn('Back button not available');
    }
  },
  hide: () => {
    try {
      WebApp.BackButton.hide();
    } catch (e) {
      console.warn('Back button not available');
    }
  },
};

// Check if running in Telegram
export const isTelegramWebApp = () => {
  return typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp;
};

// Export WebApp instance
export const webApp = WebApp;

export default WebApp;
