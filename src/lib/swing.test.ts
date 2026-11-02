import { describe, expect, it } from 'vitest';
import { createPendulum, sectionAngle } from './swing';

describe('sectionAngle', () => {
	const triggers = [500, 1800, 2900];

	it('starts at the first section’s angle before any section middle has been reached', () => {
		expect(sectionAngle(triggers, 300, 17)).toBe(-17);
	});

	it('keeps the first section’s angle once its own middle passes', () => {
		expect(sectionAngle(triggers, 900, 17)).toBe(-17);
	});

	it('mirrors the angle when the next section’s middle passes the reading line', () => {
		expect(sectionAngle(triggers, 1799, 17)).toBe(-17);
		expect(sectionAngle(triggers, 1800, 17)).toBe(17);
	});

	it('alternates back for the section after that', () => {
		expect(sectionAngle(triggers, 3200, 17)).toBe(-17);
	});
});

function run(pendulum: ReturnType<typeof createPendulum>, seconds: number, hz: number) {
	const angles: number[] = [];
	let state = { angle: 0, settled: false };
	for (let i = 0; i < Math.round(seconds * hz); i++) {
		state = pendulum.step(1 / hz);
		angles.push(state.angle);
	}
	return { angles, ...state };
}

describe('createPendulum', () => {
	it('swings past the new angle, then settles on it', () => {
		const pendulum = createPendulum(-17);
		pendulum.target = 17;

		const { angles, angle, settled } = run(pendulum, 4, 60);

		expect(Math.max(...angles)).toBeGreaterThan(17.5);
		expect(Math.max(...angles)).toBeLessThan(26);
		expect(angle).toBeCloseTo(17, 1);
		expect(settled).toBe(true);
	});

	it('is at rest when nothing has changed', () => {
		expect(createPendulum(-17).step(1 / 60)).toEqual({ angle: -17, settled: true });
	});

	it('moves the same way at 60Hz and 120Hz', () => {
		const at60 = createPendulum(-17);
		const at120 = createPendulum(-17);
		at60.target = 17;
		at120.target = 17;

		expect(run(at120, 0.4, 120).angle).toBeCloseTo(run(at60, 0.4, 60).angle, 0);
	});

	it('does not jump when a frame takes far too long', () => {
		const pendulum = createPendulum(-17);
		pendulum.target = 17;

		const { angle } = pendulum.step(2);

		expect(Math.abs(angle - -17)).toBeLessThan(10);
	});

	it('keeps its momentum when the target changes mid-swing', () => {
		const pendulum = createPendulum(-17);
		pendulum.target = 17;
		const before = run(pendulum, 0.15, 60).angle;
		pendulum.target = -17;

		const after = pendulum.step(1 / 60).angle;

		expect(after).toBeGreaterThan(before);
	});
});
