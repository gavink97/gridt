import { validateUnit } from '../content/grid.ts';
import type { Config, Input } from './types.ts';

export function covertFRToPX(variables: Config): Map<string, Partial<Input<number>>> {
	const client = document.body.getBoundingClientRect();

	// need to convert these units if they're not px
	const gaps = Number.parseInt(validateUnit(variables.gaps.value));
	const margin = Number.parseInt(validateUnit(variables.margin.value));

	const columns = variables.columns.value;
	const rows = variables.rows.value;

	const hfrValue = (client.width - margin * 2 + (gaps * columns - 1)) / columns;
	const vfrValue = (client.height - margin * 2 + (gaps * rows - 1)) / rows;

	const map: Map<string, Partial<Input<number>>> = new Map();
	map.set('hfr', { value: hfrValue });
	map.set('vfr', { value: vfrValue });

	return map;
}
