import { DefaultOptions } from '../utils/default-variables.ts';
import { RetrieveOptions, StoreOptions } from '../utils/storage.ts';
import type { Input, Options } from '../utils/types.ts';

function getOptions(): Options {
	const def = DefaultOptions;

	const keybind = document.getElementById(def.gridKeybinding.elementId) as HTMLInputElement;
	const shortcut: Input<string> = {
		elementId: def.gridKeybinding.elementId,
		value: keybind.value ?? def.gridKeybinding.value,
	};

	const strokeWidth = document.getElementById(def.strokeWidth.elementId) as HTMLInputElement;
	const width: Input<string> = {
		elementId: def.strokeWidth.elementId,
		value: strokeWidth.value ?? def.strokeWidth.value,
	};

	const strokeColor = document.getElementById(def.strokeColor.elementId) as HTMLInputElement;
	const color: Input<string> = {
		elementId: def.strokeColor.elementId,
		value: strokeColor.value ?? def.strokeColor.value,
	};

	return {
		gridKeybinding: shortcut,
		strokeWidth: width,
		strokeColor: color,
	};
}

async function update(e: Event): Promise<void> {
	e.preventDefault();
	const options = getOptions();

	const commandName = 'toggle-feature';

	await browser.commands.update({
		name: commandName,
		shortcut: options.gridKeybinding.value,
	});

	await StoreOptions(options);
}

async function restoreOptions() {
	const options = await RetrieveOptions();

	const kb = document.getElementById(options.gridKeybinding.elementId) as HTMLInputElement;
	const width = document.getElementById(options.strokeWidth.elementId) as HTMLInputElement;
	const color = document.getElementById(options.strokeColor.elementId) as HTMLInputElement;

	kb.value = options.gridKeybinding.value;
	width.value = options.strokeWidth.value;
	color.value = options.strokeColor.value;
}

let hasRun = false;

if (!hasRun) {
	document.addEventListener('DOMContentLoaded', restoreOptions);

	const button = document.getElementById('submit');
	button?.addEventListener('click', update);

	hasRun = true;
}
