/**
 * Custom Logger for KPN FAST Backend
 * Provides clean, emoji-free logging that works well in all terminals
 */

class Logger {
  constructor() {
    // Detect if running in HTA or terminal with poor emoji support
    this.useEmoji = process.env.USE_EMOJI !== 'false';
  }

  /**
   * Replace emojis with ASCII equivalents for better compatibility
   */
  cleanEmoji(text) {
    if (this.useEmoji) return text;

    const emojiMap = {
      '🚀': '>>', 
      '📍': '>>', 
      '🌐': '>>',
      '✅': '[OK]',
      '❌': '[FAIL]',
      '⚠️': '[WARN]',
      '🔍': '>>',
      '✨': '>>',
      '📝': '>>',
      '💾': '>>',
      '🔑': '>>',
      '📁': '>>',
      '🗂️': '>>',
      '👤': '>>',
      '🏢': '>>',
    };

    let cleaned = text;
    for (const [emoji, replacement] of Object.entries(emojiMap)) {
      cleaned = cleaned.replace(new RegExp(emoji, 'g'), replacement);
    }
    
    return cleaned;
  }

  log(message) {
    console.log(this.cleanEmoji(message));
  }

  info(message) {
    console.log(this.cleanEmoji(message));
  }

  success(message) {
    console.log(this.cleanEmoji(message));
  }

  error(message) {
    console.error(this.cleanEmoji(message));
  }

  warn(message) {
    console.warn(this.cleanEmoji(message));
  }
}

export default new Logger();
