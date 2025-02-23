import { defaultVariables } from '../utils/default-variables.ts';
import type { Action, Config, ResponseSender } from '../utils/types.ts';

function handleError(error: any) {
	const message = {
		error: String(error),
		response: String(error),
		type: 'error',
	};

	browser.runtime.sendMessage(message);
}

function handleResponse(message: any) {
	if (!message) {
		console.error('Expected a response from content script but received nothing.');
	}

	return message.response;
}

function messageTab(tabs: browser.tabs.Tab[], message: any): any {
	const current = tabs[0].id;

	return browser.tabs
		.sendMessage(current, message)
		.then(handleResponse)
		.catch((error) => {
			throw error;
		});
}

function inject(tabs: browser.tabs.Tab[], message: any): any {
	const content = ['./dist/content/main.js'];

	return browser.scripting
		.executeScript({
			target: { tabId: tabs[0].id, allFrames: true },
			files: content,
		})
		.then(() => messageTab(tabs, message))
		.catch((error) => {
			throw error;
		});
}

function sendMessageToClient(request: Action, sender: browser.runtime.MessageSender, sendResponse: ResponseSender) {
	browser.tabs
		.query({ active: true, currentWindow: true })
		.then((tabs) => {
			inject(tabs, request)
				.then((response: any) => {
					if (sendResponse) {
						sendResponse({ type: 'message', response: response });
					}
				})
				.catch((error: any) => {
					handleError(error);
					sendResponse({ type: 'error', response: error, error: error });
				});
		})
		.catch((error) => {
			handleError(error);
			sendResponse({
				type: 'error',
				response: `An error ocurred when communicating with the content script: ${error}`,
				error: error.message,
			});
		});
}

function receiver(request: Action, sender: browser.runtime.MessageSender, sendResponse: ResponseSender) {
	if (request) {
		switch (request.action) {
			case 'check-grid-visibility':
				sendResponse({ type: 'message', response: String(visible) });
				break;

			case 'hide-grid':
				try {
					sendMessageToClient(request, sender, sendResponse);
					visible = false;
					lastUrl = '';
					break;
				} catch {
					handleError(`An error occured when performing: ${request.action}`);
					break;
				}

			case 'show-grid':
				try {
					sendMessageToClient(request, sender, sendResponse);
					getCurrentUrl();
					visible = true;
					break;
				} catch {
					handleError(`An error occured when performing: ${request.action}`);
					break;
				}

			case 'update-grid':
				try {
					sendMessageToClient(request, sender, sendResponse);
					break;
				} catch {
					handleError(`An error occured when performing: ${request.action}`);
					break;
				}

			default:
				handleError(`Unknown request action ${request.action}`);
				sendResponse({
					type: 'error',
					response: `Unknown request received ${request.action}`,
					error: `Unknown request received ${request.action}`,
				});
		}
		return true;
	}
	return false;
}

function getCurrentUrl() {
	const gettingCurrent = browser.tabs.query({ active: true, currentWindow: true });

	// this will error if on an invalid tab
	gettingCurrent.then((tabInfo) => {
		lastUrl = tabInfo[0].url;
	});
}

async function checkOnReload() {
	try {
		const local = (await browser.storage.local.get()) as Config;

		if (local.extra.onReload.value || local.extra.onReload.default_value) {
			const current = await browser.tabs.query({ active: true, currentWindow: true });

			if (current[0].url !== lastUrl) {
				visible = false;
				return;
			}

			const request = {
				action: 'show-grid',
				variables: local,
			};

			browser.tabs
				.query({ active: true, currentWindow: true })
				.then((tabs) => {
					inject(tabs, request);
					visible = true;
				})
				.catch((error) => {
					handleError(error);
					visible = false;
				});
		} else {
			visible = false;
		}
	} catch (error) {
		handleError(error);
		visible = false;
	}
}

function checkGridState() {
	const request = {
		action: 'check-grid-visibility',
	};

	browser.tabs
		.query({ active: true, currentWindow: true })
		.then((tabs) => {
			inject(tabs, request)
				.then((response: any) => {
					visible = response;
				})
				.catch((error: any) => {
					handleError(error);
				});
		})
		.catch((error) => {
			handleError(error);
		});
}

function command() {
	let local: Config | undefined;

	browser.storage.local
		.get()
		.then((result: Config) => {
			local = result;
		})
		.catch((error: any) => {
			handleError(error);
		});

	const request = {
		action: visible ? 'hide-grid' : 'show-grid',
		variables: local || defaultVariables,
	};

	receiver(request, null, null);
}

let visible = false;
let lastUrl: string | undefined;

if (!browser.runtime.onMessage.hasListener(receiver)) {
	browser.runtime.onMessage.addListener(receiver);
}

if (!browser.webNavigation.onDOMContentLoaded.hasListener(checkOnReload)) {
	browser.webNavigation.onDOMContentLoaded.addListener(checkOnReload);
}

if (!browser.commands.onCommand.hasListener(command)) {
	browser.commands.onCommand.addListener(command);
}

(async () => {
	try {
		await checkOnReload();
		checkGridState();
	} catch (error) {
		handleError(error);
	}
})();
