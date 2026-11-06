"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";

/** The parts of the browser Web Speech API this screen uses; it ships without TypeScript types. */
type SpeechResult = { isFinal: boolean; 0: { transcript: string } };
type SpeechEvent = { resultIndex: number; results: ArrayLike<SpeechResult> };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type RecognitionConstructor = new () => Recognition;

function recognitionConstructor(): RecognitionConstructor | null {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const noSubscription = () => () => {};

const errorMessages: Record<string, string> = {
  "not-allowed":
    "Microphone access was blocked. Allow it in the browser, or use the sample dictation.",
  "no-speech": "No speech was heard. Try again closer to the microphone.",
  network: "The browser's speech service could not be reached.",
};

/**
 * Speech-to-text through the browser (Chrome and Edge). Each finished phrase is passed to
 * `onPhrase`; nothing is recorded or sent to Medisense servers.
 */
export function useDictation(onPhrase: (text: string) => void) {
  const supported = useSyncExternalStore(
    noSubscription,
    () => recognitionConstructor() !== null,
    () => false,
  );
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognition = useRef<Recognition | null>(null);

  const start = useCallback(() => {
    const Ctor = recognitionConstructor();
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = "en-AU";
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (event) => {
      let pending = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result) continue;
        const text = result[0].transcript.trim();
        if (result.isFinal) {
          if (text) onPhrase(text.charAt(0).toUpperCase() + text.slice(1));
        } else {
          pending += ` ${text}`;
        }
      }
      setInterim(pending.trim());
    };
    r.onerror = (event) =>
      setError(errorMessages[event.error] ?? `Dictation stopped (${event.error}).`);
    r.onend = () => {
      setListening(false);
      setInterim("");
    };
    recognition.current = r;
    setError(null);
    setListening(true);
    r.start();
  }, [onPhrase]);

  const stop = useCallback(() => recognition.current?.stop(), []);

  return { supported, listening, interim, error, start, stop };
}
