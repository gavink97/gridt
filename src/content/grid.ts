import type { Config } from '../utils/types.ts';

export function validateUnit(prop: string): string {
	const units = ['cm', 'mm', 'in', 'px', 'pt', 'pc', 'em', 'ex', 'ch', 'rem', 'vw', 'vh', 'vmin', 'vmax', '%', 'fr'];

	for (const unit of units) {
		if (prop.includes(unit)) {
			return prop;
		}
	}

	// make this more transparent
	console.error(`property is missing or contains an invalid unit: ${prop}`);
	return `${Number.parseInt(prop)}px`;
}

export function enumerateInput(input: string): number {
	function parseProps(input: string) {
		const props = [];
		let current = '';
		let index = 0;

		for (const char of input) {
			if (char === '(') index++;
			else if (char === ')') index--;

			if (char === ' ' && index === 0) {
				props.push(current.trim());
				current = '';
			} else {
				current += char;
			}
		}

		props.push(current.trim());
		return props.filter((t) => t !== '');
	}

	function countProps(props: Array<string>) {
		let total = 0;

		for (const prop of props) {
			if (prop.startsWith('repeat(')) {
				const args = prop.slice(7, -1).split(/(?<!\(.*),\s*/);
				const count = Number.parseInt(args[0], 10);
				total += count || 0;
			} else {
				total += 1;
			}
		}

		return total;
	}

	const parsedTracks = parseProps(input);
	return countProps(parsedTracks);
}

// assuming these are all in pixels! Needs conversion to use other units
function adjustMargin(element: HTMLElement, vars: Config): HTMLElement {
	const margin = validateUnit(vars.margin.value ?? vars.margin.default_value);
	const linkedMargins = vars.extra.linkedMargins.value ?? vars.extra.linkedMargins.default_value;
	const top = validateUnit(vars.extra.top.value ?? vars.extra.top.default_value);
	const bottom = validateUnit(vars.extra.bottom.value ?? vars.extra.bottom.default_value);
	const left = validateUnit(vars.extra.left.value ?? vars.extra.left.default_value);
	const right = validateUnit(vars.extra.right.value ?? vars.extra.right.default_value);
	const useWindow = vars.useWindow.value ?? vars.useWindow.default_value;
	const attached = vars.attachedElement.value ?? vars.attachedElement.default_value;
	const scrollX = window.scrollX;
	const scrollY = window.scrollY;

	let rects: DOMRect;
	let leftValue: number;
	let rightValue: number;
	let topValue: number;
	let bottomValue: number;
	let value: number;

	const units = ['cm', 'mm', 'in', 'pt', 'pc', 'em', 'ex', 'ch', 'rem', 'vw', 'vh', 'vmin', 'vmax', '%', 'fr'];
	for (const unit of units) {
		for (const value of [margin, top, bottom, left, right]) {
			if (value.includes(unit)) {
				throw Error(`Unit not supported in margins. Use px instead for ${value}`);
			}
		}
	}

	switch (`${useWindow}-${linkedMargins}`) {
		case 'true-true':
			element.style.position = 'fixed';
			element.style.inset = margin;
			break;

		case 'true-false':
			element.style.position = 'fixed';
			element.style.top = top;
			element.style.bottom = bottom;
			element.style.left = left;
			element.style.right = right;
			break;

		case 'false-true':
			rects = document.querySelector(attached).getBoundingClientRect();
			element.style.position = 'absolute';
			element.style.inset = '0px';

			value = Number.parseInt(margin);
			topValue = rects.top + scrollY;
			leftValue = rects.left + scrollX;

			element.style.width = `${rects.width - value * 2}px`;
			element.style.height = `${rects.height - value * 2}px`;
			element.style.top = `${value + topValue}px`;
			element.style.left = `${value + leftValue}px`;

			break;

		case 'false-false':
			rects = document.querySelector(attached).getBoundingClientRect();
			element.style.position = 'absolute';
			element.style.inset = '0px';

			leftValue = Number.parseInt(left);
			rightValue = Number.parseInt(right);
			topValue = Number.parseInt(top);
			bottomValue = Number.parseInt(bottom);

			element.style.width = `${rects.width - (leftValue + rightValue)}px`;
			element.style.height = `${rects.height - (topValue + bottomValue)}px`;
			element.style.top = `${topValue + (rects.top + scrollY)}px`;
			element.style.left = `${leftValue + (rects.left + scrollX)}px`;
			break;

		default:
			throw Error('Someething strange happened here');
	}

	return element;
}

export function CSSGrid(variables: Config) {
	let columns = variables.columns.value ?? variables.columns.default_value;
	let rows = variables.rows.value ?? variables.rows.default_value;
	const gaps = validateUnit(variables.gaps.value ?? variables.gaps.default_value);
	const useWindow = variables.useWindow.value ?? variables.useWindow.default_value;
	const attached = variables.attachedElement.value ?? variables.attachedElement.default_value;

	const useExtra = variables.useExtra.value ?? variables.useExtra.default_value;
	const extraColumns = variables.extra.columns.value ?? variables.extra.columns.default_value;
	const extraRows = variables.extra.rows.value ?? variables.extra.rows.default_value;
	const stroke = validateUnit(variables.extra.stroke.value ?? variables.extra.stroke.default_value);
	const color = variables.extra.color.value ?? variables.extra.color.default_value;

	let grid = document.createElement('grid');
	grid = adjustMargin(grid, variables);

	grid.id = 'gridt';
	grid.style.display = 'grid';
	grid.style.overflow = 'hidden';
	grid.style.pointerEvents = 'none';
	grid.style.gap = gaps;
	grid.style.zIndex = '10000';

	if (!useExtra) {
		grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
		grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
	} else {
		grid.style.gridTemplateColumns = extraColumns;
		grid.style.gridTemplateRows = extraRows;

		columns = enumerateInput(extraColumns);
		rows = enumerateInput(extraRows);
	}

	// combine these if possible
	// need to draw a line at the end if %s are used
	for (const x of Array(columns).keys()) {
		const line = document.createElement('gridline');
		line.style.width = stroke;
		line.style.backgroundColor = color;

		line.style.gridColumn = String(x + 1);
		line.style.gridRow = `1 / ${rows + 1}`;

		grid.appendChild(line);
	}

	for (const x of Array(columns).keys()) {
		const line = document.createElement('gridline');
		line.style.width = stroke;
		line.style.backgroundColor = color;
		line.style.justifySelf = 'end';

		line.style.gridColumn = String(x + 1);
		line.style.gridRow = `1 / ${rows + 1}`;

		grid.appendChild(line);
	}

	for (const x of Array(rows).keys()) {
		const line = document.createElement('gridline');
		line.style.height = stroke;
		line.style.backgroundColor = color;

		line.style.gridColumn = `1 / ${columns + 1}`;
		line.style.gridRow = String(x + 1);

		grid.appendChild(line);
	}

	for (const x of Array(rows).keys()) {
		const line = document.createElement('gridline');
		line.style.height = stroke;
		line.style.backgroundColor = color;
		line.style.alignSelf = 'end';

		line.style.gridColumn = `1 / ${columns + 1}`;
		line.style.gridRow = String(x + 1);

		grid.appendChild(line);
	}

	if (!useWindow) {
		document.querySelector(attached).appendChild(grid);
	} else {
		document.body.appendChild(grid);
	}
}

export function RemoveGrid() {
	const grid = document.getElementById('gridt');
	if (grid) {
		grid.remove();
	}
}

export function GridPresence(): boolean {
	const grid = document.getElementById('gridt');
	if (grid) {
		return true;
	}
	return false;
}

export function GridVisible(): boolean {
	const grid = document.getElementById('gridt');

	if (grid) {
		const visibility = grid.checkVisibility();

		if (visibility) {
			return true;
		}
		return false;
	}
	return false;
}

export function HideGrid() {
	const grid = document.getElementById('gridt');
	if (grid) {
		grid.style.display = 'none';
	}
}

export function ShowGrid() {
	const grid = document.getElementById('gridt');
	if (grid) {
		grid.style.display = 'grid';
	}
}
