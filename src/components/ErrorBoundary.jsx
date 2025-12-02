/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree
 * and displays a fallback UI instead of crashing
 */

import { Component } from 'react';
import logger from '../utils/logger';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    logger.error('Error caught by boundary:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo
    });

    // In production, you could send error to monitoring service
    // Example: Sentry.captureException(error);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Optionally reload the page
    if (this.props.resetOnError) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Что-то пошло не так
            </h1>
            <p className="text-gray-400 mb-6">
              Произошла ошибка в приложении. Мы уже работаем над её исправлением.
            </p>

            {/* Show error details in development */}
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left mb-6 bg-gray-900 rounded p-4">
                <summary className="text-red-400 cursor-pointer mb-2 font-mono text-sm">
                  Подробности ошибки (только в разработке)
                </summary>
                <div className="text-xs text-gray-300 overflow-auto max-h-40">
                  <p className="font-bold text-red-400 mb-2">
                    {this.state.error.toString()}
                  </p>
                  <pre className="whitespace-pre-wrap">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Попробовать снова
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Перезагрузить страницу
              </button>
            </div>

            {/* Contact support */}
            <p className="text-gray-500 text-sm mt-6">
              Проблема повторяется?{' '}
              <a
                href="https://github.com/anthropics/mindflow-app/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Сообщите об ошибке
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
