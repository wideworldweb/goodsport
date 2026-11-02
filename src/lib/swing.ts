const STIFFNESS = 49;
const DAMPING = 6.3;
const MAX_FRAME = 0.05;
const SUBSTEP = 1 / 240;
const REST = 0.05;
const TRIGGER_DEPTH = 0.25;

/**
 * Document y positions where each section takes over the oval: a quarter of the way into the
 * section, or the furthest line the reader can reach if the page ends before that.
 */
export function sectionTriggers(sections: { top: number; height: number }[], furthest: number): number[] {
	return sections.map(({ top, height }) => Math.min(top + height * TRIGGER_DEPTH, furthest));
}

/**
 * The oval's angle for a reading line (a document y position), given each section's trigger.
 * Sections alternate between -tilt and +tilt, and a section takes over once its trigger
 * reaches the reading line.
 */
export function sectionAngle(triggers: number[], readingLine: number, tilt: number): number {
	const passed = triggers.filter((y) => y <= readingLine).length;
	const index = Math.max(0, passed - 1);
	return index % 2 === 0 ? -tilt : tilt;
}

/** A damped spring that swings toward `target`, overshooting a little before it settles. */
export function createPendulum(angle: number) {
	let velocity = 0;

	return {
		target: angle,
		step(dt: number) {
			let remaining = Math.min(dt, MAX_FRAME);
			while (remaining > 0) {
				const h = Math.min(SUBSTEP, remaining);
				velocity += (-STIFFNESS * (angle - this.target) - DAMPING * velocity) * h;
				angle += velocity * h;
				remaining -= h;
			}
			const settled = Math.abs(angle - this.target) < REST && Math.abs(velocity) < REST;
			if (settled) {
				angle = this.target;
				velocity = 0;
			}
			return { angle, settled };
		}
	};
}
