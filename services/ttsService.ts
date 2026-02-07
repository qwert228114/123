import { Word, PlayerSettings, SequenceItem } from "../types";

// Keep references to prevent Garbage Collection from stopping playback prematurely
let activeUtterances: SpeechSynthesisUtterance[] = [];

export const stopSpeaking = () => {
  window.speechSynthesis.cancel();
  activeUtterances = [];
};

/**
 * Queues the sequence based on user settings
 */
export const speakWordSequence = (
  word: Word, 
  settings: PlayerSettings,
  onItemStart: (item: SequenceItem) => void,
  onComplete: () => void
) => {
  activeUtterances = []; // Reset refs for this batch
  
  // If sequence is empty, just complete immediately
  if (!settings.sequence || settings.sequence.length === 0) {
    onComplete();
    return;
  }

  let allUtterances: SpeechSynthesisUtterance[] = [];

  // Generate all utterances for the sequence
  settings.sequence.forEach((item) => {
    let configs: {text: string, lang: string, rate: number}[] = [];

    if (item === 'english') {
      configs.push({ text: word.english, lang: 'en-US', rate: settings.playbackRate });
    } else if (item === 'chinese') {
      configs.push({ text: word.chinese, lang: 'zh-CN', rate: settings.playbackRate });
    } else if (item === 'spell') {
      // Split word into characters
      const letters = word.english.replace(/\s+/g, '').split('');
      configs = letters.map(char => ({
          text: char, 
          lang: 'en-US', 
          // Increased rate slightly to minimize the feel of the gap between utterances
          rate: Math.max(0.9, settings.playbackRate * 1.1) 
      }));
    }

    if (configs.length > 0) {
        configs.forEach((config, idx) => {
            const u = new SpeechSynthesisUtterance(config.text);
            u.lang = config.lang;
            u.rate = config.rate;

            // Trigger callback only on the start of the FIRST utterance for this specific item
            // (e.g. for spell, only on the first letter)
            if (idx === 0) {
                u.onstart = () => onItemStart(item);
            }

            allUtterances.push(u);
        });
    }
  });

  if (allUtterances.length === 0) {
    onComplete();
    return;
  }

  // Handle completion on the last utterance
  const lastUtterance = allUtterances[allUtterances.length - 1];
  lastUtterance.onend = () => onComplete();
  lastUtterance.onerror = (e) => {
    console.error("TTS Error:", e);
    onComplete();
  };

  // Queue them all up
  allUtterances.forEach(u => {
    activeUtterances.push(u);
    window.speechSynthesis.speak(u);
  });
};
