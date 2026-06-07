import type { Action, PopupVariables } from '../utils/types.ts';

const ILLEGAL_UNITS = [
	'cm',
	'mm',
	'in',
	'px',
	'pt',
	'pc',
	'em',
	'ex',
	'ch',
	'rem',
	'vw',
	'vh',
	'vmin',
	'vmax',
	'%',
	'fr',
];

export function ValidateUnit(prop: string): string {
	for (const unit of ILLEGAL_UNITS) {
		if (prop.includes(unit)) {
			return prop;
		}
	}

	throw new Error(`property is missing or contains an invalid unit: ${prop}`);
}

export function EnumerateInput(input: string): number {
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

function adjustMargin(element: HTMLElement, popup: PopupVariables): HTMLElement {
	const margin = ValidateUnit(popup.margins.value);
	const attached = popup.attachedElement.value;
	const scrollX = window.scrollX;
	const scrollY = window.scrollY;

	let rects: DOMRect;
	let leftValue: number;
	let rightValue: number;
	let topValue: number;
	let bottomValue: number;
	let value: number;
	let temp: HTMLElement | null;

	let top: string;
	let bottom: string;
	let left: string;
	let right: string;

	const useWindow = attached === 'Window';
	const margins = margin.split(' ');
	const linkedMargins = margins.length === 1;

	switch (`${useWindow}-${linkedMargins}`) {
		case 'true-true':
			element.style.position = 'fixed';
			element.style.inset = margin;
			break;

		case 'true-false':
			element.style.position = 'fixed';

			switch (margins.length) {
				case 4:
					top = margins[0];
					right = margins[1];
					bottom = margins[2];
					left = margins[3];
					break;
				case 3:
					top = margins[0];
					right = margins[1];
					left = margins[1];
					bottom = margins[2];
					break;
				case 2:
					top = margins[0];
					bottom = margins[0];
					left = margins[1];
					right = margins[1];
					break;
				default:
					throw new Error(`invalid margin length: ${margins.length}`);
			}

			element.style.top = top;
			element.style.bottom = bottom;
			element.style.left = left;
			element.style.right = right;
			break;

		case 'false-true':
			temp = document.querySelector(attached);
			if (!temp) {
				throw new Error(`unable to attach to ${attached}: not present`);
			}

			rects = temp.getBoundingClientRect();
			element.style.position = 'absolute';
			element.style.inset = '0px';

			value = Number.parseInt(margin, 10);
			topValue = rects.top + scrollY;
			leftValue = rects.left + scrollX;

			element.style.width = `${rects.width - value * 2}px`;
			element.style.height = `${rects.height - value * 2}px`;
			element.style.top = `${value + topValue}px`;
			element.style.left = `${value + leftValue}px`;

			break;

		case 'false-false':
			temp = document.querySelector(attached);
			if (!temp) {
				throw new Error(`unable to attach to ${attached}: not present`);
			}

			rects = temp.getBoundingClientRect();
			element.style.position = 'absolute';
			element.style.inset = '0px';

			switch (margins.length) {
				case 4:
					topValue = Number.parseInt(margins[0], 10);
					rightValue = Number.parseInt(margins[1], 10);
					bottomValue = Number.parseInt(margins[2], 10);
					leftValue = Number.parseInt(margins[3], 10);
					break;
				case 3:
					topValue = Number.parseInt(margins[0], 10);
					rightValue = Number.parseInt(margins[1], 10);
					leftValue = Number.parseInt(margins[1], 10);
					bottomValue = Number.parseInt(margins[2], 10);
					break;
				case 2:
					topValue = Number.parseInt(margins[0], 10);
					bottomValue = Number.parseInt(margins[0], 10);
					rightValue = Number.parseInt(margins[1], 10);
					leftValue = Number.parseInt(margins[1], 10);
					break;
				default:
					throw new Error(`invalid margin length: ${margins.length}`);
			}

			element.style.width = `${rects.width - (leftValue + rightValue)}px`;
			element.style.height = `${rects.height - (topValue + bottomValue)}px`;
			element.style.top = `${topValue + (rects.top + scrollY)}px`;
			element.style.left = `${leftValue + (rects.left + scrollX)}px`;
			break;

		default:
			throw new Error(`invalid linked boolean in adjustMargin: ${useWindow}-${linkedMargins}`);
	}

	return element;
}

export function CSSGrid(request: Action) {
	const popup = request.popup;
	const options = request.options;

	if (!popup || !options) {
		throw new Error('action missing popup or options property');
	}

	const columns = popup.columns.value;
	const rows = popup.rows.value;
	const gaps = ValidateUnit(popup.gaps.value);
	const attached = popup.attachedElement.value;

	const stroke = ValidateUnit(options.strokeWidth.value);
	const color = options.strokeColor.value;

	const useWindow = attached === 'Window';
	let currentResizeHandler: (() => void) | null = null;

	function create() {
		let grid = document.createElement('gridt');
		if (!popup) {
			throw new Error('action missing popup property in create');
		}

		grid = adjustMargin(grid, popup);

		grid.id = 'gridt';
		grid.style.display = 'grid';
		grid.style.overflow = 'hidden';
		grid.style.pointerEvents = 'none';
		grid.style.gap = gaps;
		grid.style.zIndex = '10000';

		grid.style.gridTemplateColumns = columns;
		grid.style.gridTemplateRows = rows;

		const columnsValue = EnumerateInput(columns);
		const rowsValue = EnumerateInput(rows);

		// combine these if possible
		// need to draw a line at the end if %s are used
		for (const x of Array(columnsValue).keys()) {
			const line = document.createElement('gridt-column');
			line.style.width = stroke;
			line.style.backgroundColor = color;

			line.style.gridColumn = String(x + 1);
			line.style.gridRow = `1 / ${rowsValue + 1}`;

			grid.appendChild(line);
		}

		for (const x of Array(columnsValue).keys()) {
			const line = document.createElement('gridt-column');
			line.style.width = stroke;
			line.style.backgroundColor = color;
			line.style.justifySelf = 'end';

			line.style.gridColumn = String(x + 1);
			line.style.gridRow = `1 / ${rowsValue + 1}`;

			grid.appendChild(line);
		}

		for (const x of Array(rowsValue).keys()) {
			const line = document.createElement('gridt-row');
			line.style.height = stroke;
			line.style.backgroundColor = color;

			line.style.gridColumn = `1 / ${columnsValue + 1}`;
			line.style.gridRow = String(x + 1);

			grid.appendChild(line);
		}

		for (const x of Array(rowsValue).keys()) {
			const line = document.createElement('gridt-row');
			line.style.height = stroke;
			line.style.backgroundColor = color;
			line.style.alignSelf = 'end';

			line.style.gridColumn = `1 / ${columnsValue + 1}`;
			line.style.gridRow = String(x + 1);

			grid.appendChild(line);
		}

		return grid;
	}

	function listener(element: HTMLElement) {
		if (GridVisible()) {
			RemoveGrid();
			grid = create();
			element.appendChild(grid);
		} else {
			RemoveGrid();
		}
	}

	let grid = create();

	if (currentResizeHandler) {
		window.removeEventListener('resize', currentResizeHandler);
	}

	if (!useWindow) {
		const temp = document.querySelector(attached) as HTMLElement;
		if (!temp) {
			throw new Error(`unable to attach to ${attached}: not present`);
		}

		temp.appendChild(grid);

		currentResizeHandler = () => {
			listener(temp);
		};

		window.addEventListener('resize', currentResizeHandler);
	} else {
		document.body.appendChild(grid);

		currentResizeHandler = () => {
			listener(document.body);
		};

		window.addEventListener('resize', currentResizeHandler);
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
