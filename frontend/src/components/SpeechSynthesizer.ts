// Web Speech API text-to-speech helper

export const speakText = (
  text: string, 
  language?: string,
  onStart?: () => void,
  onEnd?: () => void
) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  // Cancel ongoing speech
  window.speechSynthesis.cancel();

  // Strip markdown formatting and actions in asterisks
  const cleanText = text
    .replace(/\*([^*]+)\*/g, '') // remove stage directions (*sighs*, *looks away*)
    .replace(/[#_`~>]/g, '')
    .trim();

  if (!cleanText) return false;

  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Language matching
  const voices = window.speechSynthesis.getVoices();
  const lowerLang = (language || '').toLowerCase();

  if (lowerLang.includes('hi') || lowerLang.includes('hindi')) {
    utterance.lang = 'hi-IN';
  } else if (lowerLang.includes('gu') || lowerLang.includes('gujarati')) {
    utterance.lang = 'gu-IN';
  } else {
    utterance.lang = 'en-GB';
  }

  // Select suitable voice if available
  const matchVoice = voices.find(v => v.lang.toLowerCase().startsWith(utterance.lang.toLowerCase().substring(0, 2)));
  if (matchVoice) {
    utterance.voice = matchVoice;
  }

  utterance.rate = 0.95;
  utterance.pitch = 0.95;

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = () => {
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
  return true;
};

export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

export const isSpeaking = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking;
};
