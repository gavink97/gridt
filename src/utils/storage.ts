import { DefaultOptions, DefaultPopupVariables, DefaultState } from './default-variables.ts';
import type { Options, PopupVariables, State } from './types.ts';

export async function RetrievePopupVariables(): Promise<PopupVariables> {
	const def = DefaultPopupVariables;

	const results = await browser.storage.sync.get('popup');
	if (!results.popup) {
		await browser.storage.sync.set({
			popup: def,
		});
		return def;
	}

	return results.popup;
}

export async function StorePopupVariables(variables: PopupVariables): Promise<void> {
	await browser.storage.sync.set({ popup: variables });
}

export async function RetrieveOptions(): Promise<Options> {
	const def = DefaultOptions;

	const results = await browser.storage.sync.get('options');
	if (!results.options) {
		await browser.storage.sync.set({
			options: def,
		});
		return def;
	}

	return results.options;
}

export async function StoreOptions(variables: Options): Promise<void> {
	await browser.storage.sync.set({ options: variables });
}

export async function RetrieveState(tabId: string | number): Promise<State> {
	const def = DefaultState;

	const results = await browser.storage.session.get(String(tabId));
	if (!results[String(tabId)]) {
		await browser.storage.session.set({
			[String(tabId)]: {
				state: def,
			},
		});
		return def;
	}

	return results[String(tabId)].state;
}

export async function StoreState(tabId: string | number, state: State): Promise<void> {
	await browser.storage.session.set({
		[String(tabId)]: {
			state: state,
		},
	});
}
