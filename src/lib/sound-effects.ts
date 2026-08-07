"use client";

import { useCallback, useEffect, useRef, useState, type MouseEventHandler } from "react";

export type SoundEffect = "tap" | "correct" | "wrong";

type Tone = {
  delay: number;
  duration: number;
  frequency: number;
  endFrequency?: number;
  gain: number;
  wave: OscillatorType;
};

const soundEffectsKey = "burrow-sound-effects-v1";

const soundTones: Record<SoundEffect, Tone[]> = {
  tap: [
    { delay: 0, duration: 0.045, frequency: 230, endFrequency: 165, gain: 0.022, wave: "triangle" },
  ],
  correct: [
    { delay: 0.04, duration: 0.1, frequency: 523.25, gain: 0.042, wave: "sine" },
    { delay: 0.115, duration: 0.11, frequency: 659.25, gain: 0.044, wave: "sine" },
    { delay: 0.2, duration: 0.15, frequency: 783.99, gain: 0.046, wave: "sine" },
  ],
  wrong: [
    { delay: 0.045, duration: 0.12, frequency: 220, endFrequency: 185, gain: 0.032, wave: "triangle" },
    { delay: 0.14, duration: 0.14, frequency: 185, endFrequency: 155, gain: 0.03, wave: "triangle" },
  ],
};

type AudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export function useSoundEffects() {
  const [enabled, setEnabled] = useState(false);
  const enabledRef = useRef(false);
  const readyRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastTapAtRef = useRef(0);

  useEffect(() => {
    const loadSavedSound = window.setTimeout(() => {
      let savedEnabled = false;
      try {
        const savedValue = window.localStorage.getItem(soundEffectsKey);
        savedEnabled = savedValue === "on";
        if (savedValue === null) window.localStorage.setItem(soundEffectsKey, "off");
      } catch {
        savedEnabled = false;
      }
      enabledRef.current = savedEnabled;
      readyRef.current = true;
      setEnabled(savedEnabled);
    }, 0);

    return () => window.clearTimeout(loadSavedSound);
  }, []);

  useEffect(() => {
    if (!readyRef.current) return;
    try {
      window.localStorage.setItem(soundEffectsKey, enabled ? "on" : "off");
    } catch {
      // Sound still works for this visit when browser storage is unavailable.
    }
  }, [enabled]);

  useEffect(() => () => {
    const audioContext = audioContextRef.current;
    audioContextRef.current = null;
    if (audioContext && audioContext.state !== "closed") void audioContext.close().catch(() => undefined);
  }, []);

  const getAudioContext = useCallback(() => {
    const current = audioContextRef.current;
    if (current && current.state !== "closed") return current;

    const audioWindow = window as AudioWindow;
    const AudioContextConstructor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext;
    if (!AudioContextConstructor) return null;

    try {
      const audioContext = new AudioContextConstructor();
      audioContextRef.current = audioContext;
      return audioContext;
    } catch {
      return null;
    }
  }, []);

  const play = useCallback((effect: SoundEffect) => {
    if (!enabledRef.current) return;
    if (effect === "tap") {
      const now = performance.now();
      if (now - lastTapAtRef.current < 35) return;
      lastTapAtRef.current = now;
    }

    const audioContext = getAudioContext();
    if (!audioContext) return;
    if (audioContext.state === "suspended") void audioContext.resume().catch(() => undefined);

    const startAt = audioContext.currentTime + 0.008;
    try {
      for (const tone of soundTones[effect]) {
        const oscillator = audioContext.createOscillator();
        const envelope = audioContext.createGain();
        const toneStart = startAt + tone.delay;
        const toneEnd = toneStart + tone.duration;

        oscillator.type = tone.wave;
        oscillator.frequency.setValueAtTime(tone.frequency, toneStart);
        if (tone.endFrequency) oscillator.frequency.exponentialRampToValueAtTime(tone.endFrequency, toneEnd);
        envelope.gain.setValueAtTime(0.0001, toneStart);
        envelope.gain.exponentialRampToValueAtTime(tone.gain, toneStart + 0.012);
        envelope.gain.exponentialRampToValueAtTime(0.0001, toneEnd);
        oscillator.connect(envelope);
        envelope.connect(audioContext.destination);
        oscillator.start(toneStart);
        oscillator.stop(toneEnd + 0.01);
      }
    } catch {
      // Audio feedback is optional and should never interrupt play.
    }
  }, [getAudioContext]);

  const toggle = useCallback(() => {
    const nextEnabled = !enabledRef.current;
    enabledRef.current = nextEnabled;
    setEnabled(nextEnabled);
    if (nextEnabled) play("tap");
  }, [play]);

  const handleClickCapture = useCallback<MouseEventHandler<HTMLElement>>((event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest("button");
    if (!button || button.disabled || button.getAttribute("aria-disabled") === "true") return;
    play("tap");
  }, [play]);

  return { enabled, toggle, play, handleClickCapture };
}
