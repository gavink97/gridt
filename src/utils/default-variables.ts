import type { Options, PopupVariables, State } from './types.ts';

export const DefaultPopupVariables: PopupVariables = {
	columns: {
		elementId: 'columns',
		value: 'repeat(6, 1fr)',
	},
	rows: {
		elementId: 'rows',
		value: 'repeat(8, 1fr)',
	},
	margins: {
		elementId: 'margins',
		value: '15px',
	},
	gaps: {
		elementId: 'gaps',
		value: '20px',
	},
	attachedElement: {
		elementId: 'attach-to',
		value: 'Window',
	},
	onReload: {
		elementId: 'keep-open',
		value: true,
	},
};

export const DefaultOptions: Options = {
	strokeWidth: {
		elementId: 'stroke-width',
		value: '1px',
	},
	strokeColor: {
		elementId: 'stroke-color',
		value: '#0000FF',
	},
};

export const DefaultState: State = {
	visible: false,
	needsUpdate: false,
};
