import Browser from 'webextension-polyfill';
import type { Config, Message, ResponseSender } from '../utils/types.ts';
import { getVariables, restoreOptions } from './values.ts';
const browser = Browser;

// log this out in a file for catching errors
function handleResponse(response: Partial<Message>) {
	//console.log(`Message from the background script: ${message.response}`);
	if (!response) {
		handleError({
			type: 'error',
			response: 'Expected a response from background page but received nothing.',
			error: 'Expected a response from background page but received nothing.',
		});
	}
}

function handleError(response: Partial<Message>) {
	const errorElement = <HTMLLinkElement>document.getElementById('error-content');

	const body =
		'Please check if an issue containing this error exists before submitting. Also try to provide any steps we can use to reproduce the error.';
	const title = String(response.error).replaceAll(' ', '+');

	const bodyConv = body.replaceAll(' ', '+');
	const url = `https://github.com/gavink97/gridt/issues/new?labels=bug&title=${title}&body=${bodyConv}`;

	errorElement.innerText = response.error;
	errorElement.href = url;
	errorElement.classList.add('visible');
	errorElement.classList.remove('vanish');

	console.error(response.error);

	setTimeout(() => {
		errorElement.classList.add('vanish');
		errorElement.classList.remove('visible');

		setTimeout(() => {
			errorElement.innerText = '';
			errorElement.href = '';
		}, 2000);
	}, 5000);
	return;
}

function storeVariables(variables: Config): any {
	browser.storage.local.set(variables).then(null, handleError);
}

// combine these checkbox functions
// when active make body 440px
// #popup-content grid-template-rows 1fr 1fr 1.5fr
// #error-content remove top and relative
function extraSettings() {
	const extra = (<HTMLInputElement>document.getElementById('extra-options'))?.checked;
	if (extra) {
		document.querySelector('.columns')?.classList.add('hidden');
		document.querySelector('.rows')?.classList.add('hidden');

		document.querySelector('.extra-columns')?.classList.remove('hidden');
		document.querySelector('.extra-rows')?.classList.remove('hidden');
		document.querySelector('.line-stroke')?.classList.remove('hidden');
		document.querySelector('.line-color')?.classList.remove('hidden');
		document.querySelector('.link-margins')?.classList.remove('hidden');
		document.querySelector('.keep-open')?.classList.remove('hidden');
		return;
	}
	document.querySelector('.columns')?.classList.remove('hidden');
	document.querySelector('.rows')?.classList.remove('hidden');

	document.querySelector('.extra-columns')?.classList.add('hidden');
	document.querySelector('.extra-rows')?.classList.add('hidden');
	document.querySelector('.line-stroke')?.classList.add('hidden');
	document.querySelector('.line-color')?.classList.add('hidden');
	document.querySelector('.link-margins')?.classList.add('hidden');
	document.querySelector('.keep-open')?.classList.add('hidden');
	return;
}

function linkedMargins() {
	const linked = (<HTMLInputElement>document.getElementById('extra-link-margins'))?.checked;
	const extra = (<HTMLInputElement>document.getElementById('extra-options'))?.checked;

	switch (`${linked}-${extra}`) {
		case 'true-true':
			document.getElementById('extra-margins')?.classList.add('hidden');
			document.getElementById('standard-margins')?.classList.remove('hidden');
			break;

		case 'true-false':
			document.getElementById('extra-margins')?.classList.add('hidden');
			document.getElementById('standard-margins')?.classList.remove('hidden');
			break;

		case 'false-true':
			document.getElementById('extra-margins')?.classList.remove('hidden');
			document.getElementById('standard-margins')?.classList.add('hidden');
			break;

		case 'false-false':
			document.getElementById('extra-margins')?.classList.add('hidden');
			document.getElementById('standard-margins')?.classList.remove('hidden');
			break;

		case 'default':
			throw Error('Someething strange happened here');
	}

	return;
}

function attachedWindow() {
	const useWindow = (<HTMLInputElement>document.getElementById('use-window'))?.checked;

	if (!useWindow) {
		document.getElementById('use-window-label')?.classList.add('hidden');
		document.getElementById('append-to-element').classList.remove('hidden');
		return;
	}

	document.getElementById('use-window-label')?.classList.remove('hidden');
	document.getElementById('append-to-element')?.classList.add('hidden');
	return;
}

async function onPopupOpen() {
	try {
		const local = await browser.storage.local.get();
		restoreOptions(<Config>local);
	} catch (error) {
		handleError(error);
	}

	extraSettings();
	linkedMargins();
	attachedWindow();
}

async function checkVisible(): Promise<boolean> {
	return browser.runtime
		.sendMessage({
			action: 'check-grid-visibility',
		})
		.then((message: Partial<Message>) => {
			if (message.response.toLowerCase() === 'true') {
				return true;
			}
			return false;
		})
		.catch((error: any) => {
			handleError(error);
			return false;
		});
}

function messenger(e: Event) {
	let sending: Promise<any>;

	e.preventDefault();

	const vars = getVariables();
	extraSettings();
	linkedMargins();
	attachedWindow();

	switch (e.type) {
		case 'DOMContentLoaded':
			checkVisible().then((result) => {
				visible = result;
				document.getElementById('show-grid-button').innerText = visible ? 'Hide Grid' : 'Show Grid';
			});
			return;

		case 'click':
			sending = browser.runtime.sendMessage({
				action: visible ? 'hide-grid' : 'show-grid',
				variables: vars,
			});
			visible = !visible;
			document.getElementById('show-grid-button').innerText = visible ? 'Hide Grid' : 'Show Grid';
			break;

		case 'change':
			sending = browser.runtime.sendMessage({
				action: 'update-grid',
				variables: vars,
			});
			break;

		default:
			console.error(`Unknown event triggered: ${e.type}`);
			break;
	}

	storeVariables(vars);
	sending.then(handleResponse, handleError);
}

function receiver(response: Partial<Message>, sender: any, sendResponse: ResponseSender) {
	if (response.type === 'error') {
		handleError(response);
		sendResponse({ type: 'message', response: 'received error' });
		return true;
	}
	return false;
}

let listenersAttached = false;
let visible: boolean | undefined;

if (!browser.runtime.onMessage.hasListener(receiver)) {
	browser.runtime.onMessage.addListener(receiver);
}

if (!listenersAttached) {
	document.addEventListener('DOMContentLoaded', messenger);

	const grid = document.getElementById('show-grid-button');
	grid?.addEventListener('click', messenger);

	for (const input of document.querySelectorAll('input')) {
		input.addEventListener('change', messenger);
	}

	browser.commands.onCommand.addListener(() => {
		checkVisible().then((result) => {
			visible = result;
			document.getElementById('show-grid-button').innerText = visible ? 'Hide Grid' : 'Show Grid';
		});
	});

	listenersAttached = true;
}

(async () => {
	try {
		await onPopupOpen();
	} catch (error) {
		handleError(error);
	}
})();
