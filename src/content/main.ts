import type { Action, Message } from '../utils/types.ts';
import { CSSGrid, GridPresence, GridVisible, HideGrid, RemoveGrid, ShowGrid } from './grid.ts';

async function receiver(request: Action): Promise<Message> {
	let message: string;

	try {
		if (!request) {
			throw new Error('expected a request but received nothing');
		}

		switch (request.action) {
			case 'show-grid':
				if (GridPresence()) {
					ShowGrid();
				} else {
					CSSGrid(request);
					//Canvas(request.variables);
				}

				message = 'visible';
				break;

			case 'hide-grid':
				HideGrid();
				message = 'hidden';
				break;

			case 'update-grid':
				if (GridVisible()) {
					RemoveGrid();
					CSSGrid(request);
					//Canvas(request.variables);
				} else {
					RemoveGrid();
				}

				message = 'ok';
				break;

			default:
				throw new Error(`unknown request action ${request.action}`);
		}
	} catch (error: any) {
		return Promise.reject({
			type: 'error',
			body: String(error),
		});
	}

	return Promise.resolve({
		type: 'message',
		body: message,
	});
}

(() => {
	if (window.hasRun) {
		return;
	}
	window.hasRun = true;

	if (!browser.runtime.onMessage.hasListener(receiver)) {
		browser.runtime.onMessage.addListener(receiver);
	}
})();
