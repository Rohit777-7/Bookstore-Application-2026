// Tiny UI sound engine built on the Web Audio API.
// Every sound is synthesised on the fly — no audio files to download.
//
// Usage:
//   playSound('tap' | 'add' | 'wish' | 'unwish' | 'open' | 'close' | 'toggle' | 'error')
//
// Any <button>, `.button` or `[data-sound]` element plays a sound on click via the
// global listener in pages/_app.js. Set data-sound="none" to opt out, or
// data-sound="<name>" to pick a specific sound.

const STORAGE_KEY = 'bs-sound';
let ctx = null;
let master = null;
let enabled = null;
const listeners = new Set();

export function isSoundOn() {
	if (enabled === null) {
		try {
			enabled = localStorage.getItem(STORAGE_KEY) !== 'off';
		} catch {
			enabled = true;
		}
	}
	return enabled;
}

export function setSoundOn(value) {
	enabled = Boolean(value);
	try {
		localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
	} catch {
		/* storage unavailable — keep the in-memory value */
	}
	listeners.forEach((fn) => fn(enabled));
}

export function onSoundChange(fn) {
	listeners.add(fn);
	return () => listeners.delete(fn);
}

function audio() {
	if (typeof window === 'undefined') return null;
	const AC = window.AudioContext || window.webkitAudioContext;
	if (!AC) return null;
	if (!ctx) {
		ctx = new AC();
		master = ctx.createGain();
		master.gain.value = 0.9;
		master.connect(ctx.destination);
	}
	if (ctx.state === 'suspended') ctx.resume();
	return ctx;
}

function tone(c, { freq, to, type = 'sine', start = 0, dur = 0.15, vol = 0.08 }) {
	const t0 = c.currentTime + start;
	const osc = c.createOscillator();
	const gain = c.createGain();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, t0);
	if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
	gain.gain.setValueAtTime(0.0001, t0);
	gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
	gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
	osc.connect(gain).connect(master);
	osc.start(t0);
	osc.stop(t0 + dur + 0.05);
}

// Soft paper "whoosh": band-passed noise with a sweeping centre frequency.
function whoosh(c, { start = 0, dur = 0.3, vol = 0.05, from = 500, to = 2600 }) {
	const t0 = c.currentTime + start;
	const length = Math.floor(c.sampleRate * dur);
	const buffer = c.createBuffer(1, length, c.sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
	const src = c.createBufferSource();
	src.buffer = buffer;
	const filter = c.createBiquadFilter();
	filter.type = 'bandpass';
	filter.Q.value = 1.2;
	filter.frequency.setValueAtTime(from, t0);
	filter.frequency.exponentialRampToValueAtTime(to, t0 + dur);
	const gain = c.createGain();
	gain.gain.setValueAtTime(0.0001, t0);
	gain.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.35);
	gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
	src.connect(filter).connect(gain).connect(master);
	src.start(t0);
	src.stop(t0 + dur + 0.05);
}

const SOUNDS = {
	// crisp, quiet tick for ordinary buttons
	tap: (c) => tone(c, { freq: 760, to: 540, type: 'triangle', dur: 0.07, vol: 0.05 }),
	// rising two-step for switches
	toggle: (c) => {
		tone(c, { freq: 520, dur: 0.09, vol: 0.05 });
		tone(c, { freq: 780, start: 0.06, dur: 0.12, vol: 0.045 });
	},
	// sparkling three-note chime (E5 · B5 · E6) for add-to-cart
	add: (c) => {
		[659.25, 987.77, 1318.51].forEach((freq, i) =>
			tone(c, { freq, start: i * 0.075, dur: 0.6, vol: 0.06 - i * 0.012 })
		);
	},
	wish: (c) => {
		tone(c, { freq: 880, dur: 0.14, vol: 0.05 });
		tone(c, { freq: 1174.66, start: 0.08, dur: 0.3, vol: 0.045 });
	},
	unwish: (c) => tone(c, { freq: 620, to: 380, dur: 0.2, vol: 0.045 }),
	open: (c) => whoosh(c, { dur: 0.32, vol: 0.06, from: 450, to: 2600 }),
	close: (c) => whoosh(c, { dur: 0.24, vol: 0.045, from: 2400, to: 500 }),
	error: (c) => {
		tone(c, { freq: 330, to: 260, type: 'triangle', dur: 0.12, vol: 0.06 });
		tone(c, { freq: 260, to: 200, type: 'triangle', start: 0.12, dur: 0.16, vol: 0.06 });
	},
};

export function playSound(name = 'tap') {
	if (!isSoundOn()) return;
	const c = audio();
	if (!c || !SOUNDS[name]) return;
	try {
		SOUNDS[name](c);
	} catch {
		/* never let a sound break the UI */
	}
}
