import type { Config, Extra, Input } from '../utils/types.ts';

export function getVariables(): Config {
	const columns = Number.parseInt((<HTMLInputElement>document.getElementById('columns'))?.value);
	const rows = Number.parseInt((<HTMLInputElement>document.getElementById('rows'))?.value);
	const gaps = (<HTMLInputElement>document.getElementById('gaps'))?.value;
	const margin = (<HTMLInputElement>document.getElementById('margin'))?.value;
	const extra = (<HTMLInputElement>document.getElementById('extra-options'))?.checked;
	const useWindow = (<HTMLInputElement>document.getElementById('use-window'))?.checked;
	const attachedElement = (<HTMLInputElement>document.getElementById('append-to-element'))?.value;

	const extraColumns = (<HTMLInputElement>document.getElementById('extra-columns'))?.value;
	const extraRows = (<HTMLInputElement>document.getElementById('extra-rows'))?.value;
	const top = (<HTMLInputElement>document.getElementById('extra-top'))?.value;
	const bottom = (<HTMLInputElement>document.getElementById('extra-bottom'))?.value;
	const left = (<HTMLInputElement>document.getElementById('extra-left'))?.value;
	const right = (<HTMLInputElement>document.getElementById('extra-right'))?.value;
	const stroke = (<HTMLInputElement>document.getElementById('extra-stroke'))?.value;
	const color = (<HTMLInputElement>document.getElementById('extra-color'))?.value;
	const reload = (<HTMLInputElement>document.getElementById('extra-keep-open'))?.checked;
	let linked = (<HTMLInputElement>document.getElementById('extra-link-margins'))?.checked;

	switch (`${linked}-${extra}`) {
		case 'true-true':
			break;

		case 'true-false':
			break;

		case 'false-true':
			break;

		case 'false-false':
			linked = true;
			break;

		case 'default':
			throw Error('Someething strange happened here');
	}

	return {
		columns: {
			id: 'columns',
			value: columns,
			default_value: 6,
		},
		rows: {
			id: 'rows',
			value: rows,
			default_value: 8,
		},
		gaps: {
			id: 'gaps',
			value: gaps,
			default_value: '20px',
		},
		margin: {
			id: 'margin',
			value: margin,
			default_value: '15px',
		},
		useExtra: {
			id: 'extra-options',
			value: extra,
			default_value: false,
		},
		useWindow: {
			id: 'use-window',
			value: useWindow,
			default_value: true,
		},
		attachedElement: {
			id: 'append-to-element',
			value: attachedElement,
			default_value: 'body',
		},
		extra: {
			columns: {
				id: 'extra-columns',
				value: extraColumns,
				default_value: 'repeat(6, 1fr)',
			},
			rows: {
				id: 'extra-rows',
				value: extraRows,
				default_value: 'repeat(8, 1fr)',
			},
			top: {
				id: 'extra-top',
				value: top,
				default_value: '15px',
			},
			bottom: {
				id: 'extra-bottom',
				value: bottom,
				default_value: '15px',
			},
			left: {
				id: 'extra-left',
				value: left,
				default_value: '15px',
			},
			right: {
				id: 'extra-right',
				value: right,
				default_value: '15px',
			},
			stroke: {
				id: 'extra-stroke',
				value: stroke,
				default_value: '1px',
			},
			color: {
				id: 'extra-color',
				value: color,
				default_value: 'blue',
			},
			onReload: {
				id: 'extra-keep-open',
				value: reload,
				default_value: false,
			},
			linkedMargins: {
				id: 'extra-link-margins',
				value: linked,
				default_value: true,
			},
		},
	};
}

function assignValue(item: Input<string | number | boolean>) {
	const element = document.getElementById(item.id) as HTMLInputElement;
	switch (element?.type) {
		case 'text':
		case 'number':
			element.value = `${item.value ?? item.default_value}`;
			break;

		case 'checkbox':
			element.checked = (item.value as boolean) ?? (item.default_value as boolean);
			break;

		default:
			console.warn(`No element found for selector: ${item.id}.`);
	}
}

export function restoreOptions(items: Config) {
	for (const key in items) {
		const item = items[key as keyof Config];

		if (key === 'extra') {
			for (const key in item) {
				const prop = item[key as keyof Extra];
				assignValue(prop);
			}
		} else {
			assignValue(item as Input<string | number | boolean>);
		}
	}
}
