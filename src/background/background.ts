import { RetrieveOptions, RetrievePopupVariables, RetrieveState, StoreState } from '../utils/storage.ts';
import type { Action, Message } from '../utils/types.ts';
import { GetActiveTab } from '../utils/utils.ts';

async function messageClient(request: Action): Promise<Message | undefined> {
	const content = ['./dist/content/main.js'];

	const active = await GetActiveTab();
	if (active === -1) {
		throw new Error('invalid tab id');
	}

	await browser.scripting.executeScript({
		target: { tabId: active, allFrames: true },
		files: content,
	});

	const response = await browser.tabs.sendMessage(active, request);
	if (!response || response.type === 'error') {
		throw new Error(response ? response.body : 'expected a response from content script but received nothing');
	}

	return response;
}

async function receiver(request: Action): Promise<Message | boolean> {
	if (!request) {
		return false;
	}

	var response: Message | undefined;
	let message: string;

	try {
		const active = await GetActiveTab();
		if (active === -1) {
			throw new Error('invalid tab id');
		}

		switch (request.action) {
			case 'hide-grid':
				response = await messageClient(request);
				if (!response || response.type === 'error') {
					throw new Error(
						response ? response.body : 'expected a response from content script but received nothing',
					);
				}

				await StoreState(active, {
					visible: false,
					needsUpdate: false,
				});

				message = response.body;
				break;

			case 'show-grid':
				response = await messageClient(request);
				if (!response || response.type === 'error') {
					throw new Error(
						response ? response.body : 'expected a response from content script but received nothing',
					);
				}

				await StoreState(active, {
					visible: true,
					needsUpdate: false,
				});

				message = response.body;
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

async function reload(details: browser.webNavigation._OnDOMContentLoadedDetails): Promise<void> {
	try {
		if (details.tabId === browser.tabs.TAB_ID_NONE) {
			throw new Error('invalid tab id');
		}

		const popup = await RetrievePopupVariables();
		const options = await RetrieveOptions();
		const state = await RetrieveState(details.tabId);

		if (!state.visible || !popup.onReload.value) {
			return;
		}

		const response = await messageClient({
			action: 'show-grid',
			popup: popup,
			options: options,
		});

		if (!response || response.type === 'error') {
			throw new Error(response ? response.body : 'Expected a response from content script but received nothing');
		}

		await StoreState(details.tabId, {
			visible: true,
			needsUpdate: false,
		});
	} catch (error: any) {
		console.error(error);
	}
}

async function toggle(): Promise<void> {
	var response: Message | undefined;

	try {
		const active = await GetActiveTab();
		if (active === -1) {
			throw new Error('invalid tab id');
		}

		const popup = await RetrievePopupVariables();
		const options = await RetrieveOptions();
		const state = await RetrieveState(active);

		response = await messageClient({
			action: state.visible ? 'hide-grid' : 'show-grid',
			popup: popup,
			options: options,
		});

		if (!response || response.type === 'error') {
			throw new Error(response ? response.body : 'Expected a response from content script but received nothing');
		}

		await StoreState(active, {
			visible: response.body === 'visible',
			needsUpdate: false,
		});
	} catch (error: any) {
		console.error(error);
	}
}

async function forceUpdate(): Promise<void> {
	try {
		const active = await GetActiveTab();
		if (active === -1) {
			throw new Error('invalid tab id');
		}

		const state = await RetrieveState(active);
		if (!state.needsUpdate) {
			return;
		}

		if (state.needsUpdate) {
			const popup = await RetrievePopupVariables();
			const options = await RetrieveOptions();

			const response = await messageClient({
				action: 'update-grid',
				popup: popup,
				options: options,
			});

			if (!response || response.type === 'error') {
				throw new Error(
					response ? response.body : 'Expected a response from content script but received nothing',
				);
			}

			await StoreState(active, {
				visible: state.visible,
				needsUpdate: false,
			});
		}
	} catch (error: any) {
		console.log(error);
	}
}

async function update(): Promise<void> {
	try {
		const popup = await RetrievePopupVariables();
		const options = await RetrieveOptions();

		const response = await messageClient({
			action: 'update-grid',
			popup: popup,
			options: options,
		});

		if (!response || response.type === 'error') {
			throw new Error(response ? response.body : 'Expected a response from content script but received nothing');
		}

		const active = await GetActiveTab();
		if (active === -1) {
			throw new Error('invalid tab id');
		}

		const tabs = await browser.tabs.query({ currentWindow: true });
		for (const tab of tabs) {
			if (tab.id === browser.tabs.TAB_ID_NONE || tab.id === undefined || tab.id === active) {
				continue;
			}

			const state = await RetrieveState(tab.id);
			if (!state.visible) {
				continue;
			}

			await StoreState(tab.id, {
				visible: state.visible,
				needsUpdate: true,
			});
		}
	} catch {
		const tabs = await browser.tabs.query({ currentWindow: true });

		for (const tab of tabs) {
			if (tab.id === browser.tabs.TAB_ID_NONE || tab.id === undefined) {
				continue;
			}

			const state = await RetrieveState(tab.id);
			if (!state.visible) {
				continue;
			}

			await StoreState(tab.id, {
				visible: state.visible,
				needsUpdate: true,
			});
		}
	}
}

async function removeFromStorage(tabId: number): Promise<void> {
	await browser.storage.session.remove(String(tabId));
}

if (!browser.commands.onCommand.hasListener(toggle)) {
	browser.commands.onCommand.addListener(toggle);
}

if (!browser.runtime.onMessage.hasListener(receiver)) {
	browser.runtime.onMessage.addListener(receiver);
}

if (!browser.storage.sync.onChanged.hasListener(update)) {
	browser.storage.sync.onChanged.addListener(update);
}

if (!browser.tabs.onActivated.hasListener(forceUpdate)) {
	browser.tabs.onActivated.addListener(forceUpdate);
}

if (
	!browser.webNavigation.onDOMContentLoaded.hasListener((details) => {
		reload(details);
	})
) {
	browser.webNavigation.onDOMContentLoaded.addListener((details) => {
		reload(details);
	});
}

if (
	!browser.tabs.onRemoved.hasListener((tabId) => {
		removeFromStorage(tabId);
	})
) {
	browser.tabs.onRemoved.addListener((tabId) => {
		removeFromStorage(tabId);
	});
}
