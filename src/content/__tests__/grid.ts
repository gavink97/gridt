import { expect, test } from 'vitest';
import { EnumerateInput } from '../grid.ts';

test('Test: enumerateInput', () => {
	const inputs = ['repeat(6, 1fr)', '1fr 1fr 1fr', 'minmax(min-content, 350px) minmax(150px, 1fr) 120px'];

	const expected = [6, 3, 3];

	inputs.forEach((input, index) => {
		expect(EnumerateInput(input)).toBe(expected[index]);
	});
});
