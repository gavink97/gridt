import type { Action, ResponseSender } from '../utils/types.ts';
import { CSSGrid, GridPresence, GridVisible, HideGrid, RemoveGrid, ShowGrid } from './grid.ts';

function receiver(request: Action, sender: browser.runtime.MessageSender, sendResponse: ResponseSender) {
	let visibility: boolean;

	if (request) {
		switch (request.action) {
			case 'show-grid':
				if (GridPresence()) {
					ShowGrid();
					sendResponse({ type: 'message', response: 'Grid is now visible' });
				} else {
					CSSGrid(request.variables);
					//Canvas(request.variables);
					sendResponse({ type: 'message', response: 'Grid is now present & visible' });
				}
				break;

			case 'hide-grid':
				HideGrid();
				sendResponse({ type: 'message', response: 'Grid is now hidden' });
				break;

			case 'update-grid':
				if (GridVisible()) {
					RemoveGrid();
					CSSGrid(request.variables);
					//Canvas(request.variables);
					sendResponse({ type: 'message', response: 'Grid has been replaced & updated' });
				} else {
					RemoveGrid();
					sendResponse({ type: 'message', response: 'Grid has been removed' });
				}
				break;

			case 'check-grid-visibility':
				visibility = GridVisible();
				sendResponse({ type: 'message', response: String(visibility) });
				break;

			default:
				console.error(`Unknown request action ${request.action}`);
				sendResponse({
					type: 'error',
					response: `Unknown request received: ${request.action}`,
					error: request.action,
				});
		}

		return true;
	}

	sendResponse({
		type: 'error',
		response: 'Expected a request but received nothing',
		error: 'Did not receive incoming request',
	});
	return false;
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
