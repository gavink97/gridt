export type Input<T> = {
	id: string;
	value: T | undefined;
	default_value: T;
};

export type Extra = {
	columns: Input<string>;
	rows: Input<string>;
	top: Input<string>;
	bottom: Input<string>;
	left: Input<string>;
	right: Input<string>;
	stroke: Input<string>;
	color: Input<string>;
	onReload: Input<boolean>;
	linkedMargins: Input<boolean>;
};

export type Config = {
	columns: Input<number>;
	rows: Input<number>;
	gaps: Input<string>;
	margin: Input<string>;
	useExtra: Input<boolean>;
	useWindow: Input<boolean>;
	attachedElement: Input<string>;
	extra: Extra;
};

export type Action = {
	action: string;
	variables: Config;
};

export type Message = {
	type: string;
	response: string;
	error: string | undefined;
};

export type ResponseSender = (response: Partial<Message>) => void;

export function isInput<T>(item: any, t: (value: any) => value is T): item is Input<T> {
	return item && typeof item.id === 'string' && (item.value === undefined || t(item.value)) && t(item.default_value);
}

export function isValidType(value: any): value is string | number | boolean | undefined {
	return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === undefined;
}
