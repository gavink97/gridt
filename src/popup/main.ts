import { RetrieveOptions, RetrievePopupVariables, RetrieveState, StorePopupVariables } from '../utils/storage.ts';
import { type Message, SendAction, type State } from '../utils/types.ts';
import { GetActiveTab } from '../utils/utils.ts';
import { GetPopupVariables, RestorePopup } from './values.ts';

const gridButton = 'show-grid-button';

function isDarkMode(): boolean {
	const iframe = document.createElement('iframe');
	iframe.style.display = 'none';
	document.body.appendChild(iframe);

	const frameWindow = iframe.contentWindow;
	if (!frameWindow) {
		return true;
	}

	const dark = frameWindow.matchMedia('(prefers-color-scheme: dark)').matches;
	document.body.removeChild(iframe);

	return dark;
}

function _applyTheme(): void {
	if (!isDarkMode()) {
		document.documentElement.style.setProperty('color-scheme', 'light');
	} else {
		document.documentElement.style.setProperty('color-scheme', 'dark');
	}
}

// going to do something with this later
function handleError(response: Message): void {
	console.error(response.body);
	const errorElement = document.getElementById('error-content') as HTMLParagraphElement | null;

	if (!errorElement) {
		return;
	}

	errorElement.innerText = response.body;
}

async function onPopupOpen(): Promise<void> {
	const popup = await RetrievePopupVariables();
	RestorePopup(popup);
}

async function messenger(e: Event): Promise<void> {
	e.preventDefault();
	const popup = GetPopupVariables();
	const options = await RetrieveOptions();
	const button = document.getElementById(gridButton);

	let state: State;
	let response: Message;
	let active: number;

	try {
		switch (e.type) {
			case 'DOMContentLoaded':
				active = await GetActiveTab();
				if (active === -1) {
					throw new Error('invalid tab id');
				}

				state = await RetrieveState(active);

				if (button) {
					button.innerText = state.visible ? 'Hide Grid' : 'Show Grid';
				}

				break;

			case 'click':
				active = await GetActiveTab();
				if (active === -1) {
					throw new Error('invalid tab id');
				}

				state = await RetrieveState(active);

				response = await SendAction({
					action: state.visible ? 'hide-grid' : 'show-grid',
					popup: popup,
					options: options,
				});

				if (!response || response.type === 'error') {
					handleError({
						type: 'error',
						body: response ? response.body : 'did not receieve a reponse from background',
					});
					return;
				}

				if (button) {
					button.innerText = response.body === 'visible' ? 'Hide Grid' : 'Show Grid';
				}

				break;

			case 'change':
				await StorePopupVariables(popup);
				break;
		}
	} catch (error: any) {
		console.error(error);
	}
}

async function receiver(response: Message): Promise<boolean> {
	if (!response || response.type === 'error') {
		handleError({
			type: 'error',
			body: response ? response.body : 'did not receieve a reponse from background',
		});
	}
	return true;
}

async function openSettings(): Promise<void> {
	await browser.runtime.openOptionsPage();
	window.close();
}

async function command(): Promise<void> {
	try {
		const active = await GetActiveTab();
		if (active === -1) {
			throw new Error('invalid tab id');
		}

		const state = await RetrieveState(active);

		const button = document.getElementById(gridButton);
		if (button) {
			button.innerText = !state.visible ? 'Hide Grid' : 'Show Grid';
		}
	} catch (error: any) {
		console.error(error);
	}
}

let listenersAttached = false;

if (!browser.runtime.onMessage.hasListener(receiver)) {
	browser.runtime.onMessage.addListener(receiver);
}

if (!listenersAttached) {
	document.addEventListener('DOMContentLoaded', async (event: Event) => {
		await messenger(event);
	});

	const grid = document.getElementById(gridButton);
	grid?.addEventListener('click', async (event: Event) => {
		await messenger(event);
	});

	const settingsIcon = document.getElementById('open-options');
	settingsIcon?.addEventListener('click', async () => {
		await openSettings();
	});

	for (const input of document.querySelectorAll('input')) {
		input.addEventListener('change', async (event: Event) => {
			await messenger(event);
		});
	}

	browser.commands.onCommand.addListener(command);
	listenersAttached = true;
}

(async () => {
	await onPopupOpen();
})();
