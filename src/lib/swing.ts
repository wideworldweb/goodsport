const STIFFNESS = 49;
const DAMPING = 6.3;
const MAX_FRAME = 0.05;
const SUBSTEP = 1 / 240;
const REST = 0.05;

/**
 * The oval's angle for a reading line (a document y position), given the y position of
 * each section's middle. Sections alternate between -tilt and +tilt, and a section takes
 * over once its middle reaches the reading line.
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
