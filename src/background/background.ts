import { defaultVariables } from '../utils/default-variables.ts';
import type { Action, Config, ResponseSender } from '../utils/types.ts';

let Storage: Config;

function handleError(error: any) {
	const message = {
		error: String(error),
		response: String(error),
		type: 'error',
	};

	browser.runtime.sendMessage(message);
}

function handleResponse(message: any) {
	const response = {
		response: String(message),
		type: 'message',
	};

	browser.runtime.sendMessage(response);
	if (!message) {
		console.error('Expected a response from content script but received nothing.');
	}

	return message.response;
}

function messageTab(tabs: browser.tabs.Tab[], message: any): any {
	const current = tabs[0].id;

	return browser.tabs.sendMessage(current, message).catch((error) => {
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

					if (sendResponse) {
						sendResponse({ type: 'error', response: error, error: error });
					}
				});
		})
		.catch((error) => {
			handleError(error);

			if (sendResponse) {
				sendResponse({
					type: 'error',
					response: `An error ocurred when communicating with the content script: ${error}`,
					error: error.message,
				});
			}
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
					storeVariables(request.variables);
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

function storeVariables(variables: Config) {
	browser.storage.session.set({ config: variables });
	Storage = variables;
}

async function checkOnReload() {
	try {
		const result = await browser.storage.session.get('config');
		if (!result.config) {
			await browser.storage.session.set({
				config: defaultVariables,
			});
		}

		Storage = result.config as Config;
		if (Storage.extra.onReload.value || Storage.extra.onReload.default_value) {
			const current = await browser.tabs.query({ active: true, currentWindow: true });

			if (current[0].url !== lastUrl) {
				visible = false;
				return;
			}

			const request = {
				action: 'show-grid',
				variables: Storage,
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
	const request = {
		action: visible ? 'hide-grid' : 'show-grid',
		variables: Storage,
	};

	receiver(request, undefined, undefined);

	handleResponse('Pushing command');
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
