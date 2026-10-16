/**
 * Soft synthesized cues via Web Audio. No files, no autoplay: the context is
 * only created after the person explicitly turns sound on (a user gesture).
 */

type Cue = "move" | "rest" | "tick" | "done";

let ctx: AudioContext | null = null;

export function enableAudio(): boolean {
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return false;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return true;
  } catch {
    return false;
  }
}

function tone(freq: number, start: number, length: number, peak = 0.12) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + length + 0.05);
}

export function playCue(cue: Cue): void {
  if (!ctx || ctx.state !== "running") return;
  const t = ctx.currentTime + 0.01;
  switch (cue) {
    case "move":
      tone(660, t, 0.35);
      tone(880, t + 0.12, 0.45);
      break;
    case "rest":
      tone(523, t, 0.5, 0.09);
      break;
    case "tick":
      tone(990, t, 0.12, 0.05);
      break;
    case "done":
      tone(523, t, 0.5);
      tone(659, t + 0.15, 0.5);
      tone(784, t + 0.3, 0.8);
      break;
  }
}
