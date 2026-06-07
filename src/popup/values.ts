import { DefaultPopupVariables } from '../utils/default-variables.ts';
import type { Input, PopupVariables } from '../utils/types.ts';

export function GetPopupVariables(): PopupVariables {
	const def = DefaultPopupVariables;

	let columns = (<HTMLInputElement>document.getElementById(def.columns.elementId))?.value;
	if (!columns || columns === '') {
		columns = def.columns.value;
	}

	let rows = (<HTMLInputElement>document.getElementById(def.rows.elementId))?.value;
	if (!rows || rows === '') {
		rows = def.rows.value;
	}

	let gaps = (<HTMLInputElement>document.getElementById(def.gaps.elementId))?.value;
	if (!gaps || gaps === '') {
		gaps = def.gaps.value;
	}

	let margins = (<HTMLInputElement>document.getElementById(def.margins.elementId))?.value;
	if (!margins || margins === '') {
		margins = def.margins.value;
	}

	let attach = (<HTMLInputElement>document.getElementById(def.attachedElement.elementId))?.value;
	if (!attach || attach === '') {
		attach = def.attachedElement.value;
	}

	const reload = (<HTMLInputElement>document.getElementById(def.onReload.elementId))?.checked;

	return {
		columns: {
			elementId: def.columns.elementId,
			value: columns,
		},
		rows: {
			elementId: def.rows.elementId,
			value: rows,
		},
		gaps: {
			elementId: def.gaps.elementId,
			value: gaps,
		},
		margins: {
			elementId: def.margins.elementId,
			value: margins,
		},
		attachedElement: {
			elementId: def.attachedElement.elementId,
			value: attach,
		},
		onReload: {
			elementId: def.onReload.elementId,
			value: reload ?? def.onReload.value,
		},
	};
}

function assignValue(item: Input<string | boolean>) {
	const element = document.getElementById(item.elementId) as HTMLInputElement;
	switch (element?.type) {
		case 'text':
		case 'number':
			element.value = item.value as string;
			break;

		case 'checkbox':
			element.checked = item.value as boolean;
			break;

		default:
			console.warn(`No element found for selector: ${item.elementId}.`);
	}
}

export function RestorePopup(items: PopupVariables) {
	for (const key in items) {
		const item = items[key as keyof PopupVariables];
		assignValue(item as Input<string | boolean>);
	}
}
