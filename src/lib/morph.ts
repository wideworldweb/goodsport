const DURATION = 1;
const MAX_FRAME = 0.05;
const SHRINK_END = 0.75;

export interface OvalShape {
	x: number;
	y: number;
	width: number;
	height: number;
	angle: number;
}

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * The oval's shape partway through turning into the subscribe card: it shrinks and tilts
 * onto the card for the first three quarters of the morph, then fills in.
 */
export function morphFrame(progress: number, from: OvalShape, to: OvalShape): OvalShape & { fill: number } {
	const t = easeInOut(clamp01(progress / SHRINK_END));
	return {
		x: lerp(from.x, to.x, t),
		y: lerp(from.y, to.y, t),
		width: lerp(from.width, to.width, t),
		height: lerp(from.height, to.height, t),
		angle: lerp(from.angle, to.angle, t),
		fill: clamp01((progress - SHRINK_END) / (1 - SHRINK_END))
	};
}

/** Morph progress that runs toward 1 while `forward` is set and back toward 0 otherwise. */
export function createMorph() {
	let progress = 0;

	return {
		forward: false,
		step(dt: number) {
			const delta = Math.min(dt, MAX_FRAME) / DURATION;
			progress = clamp01(progress + (this.forward ? delta : -delta));
			return { progress, done: progress === (this.forward ? 1 : 0) };
		}
	};
}
