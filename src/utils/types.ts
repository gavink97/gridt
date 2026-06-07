export type Input<T> = {
	elementId: string;
	value: T;
};

export type Options = {
	gridKeybinding: Input<string>;
	strokeWidth: Input<string>;
	strokeColor: Input<string>;
};

export type PopupVariables = {
	columns: Input<string>;
	rows: Input<string>;
	margins: Input<string>;
	gaps: Input<string>;
	attachedElement: Input<string>;
	onReload: Input<boolean>;
};

export type Action = {
	action: string;
	popup?: PopupVariables | undefined;
	options?: Options | undefined;
};

export type Message = {
	type: string;
	body: string;
};

export type State = {
	visible: boolean;
	needsUpdate: boolean;
};

export async function SendAction(action: Action): Promise<Message> {
	return await browser.runtime.sendMessage(action);
}
