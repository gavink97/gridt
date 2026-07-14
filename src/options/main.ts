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
		value: strokeWidth.value ? `${strokeWidth.value}px` : def.strokeWidth.value,
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
	const wrapper = document.getElementById('color-wrapper');
	if (wrapper) {
		wrapper.style.backgroundColor = options.strokeColor.value;
	}

	const preview = document.getElementById('gridt-preview');
	if (preview) {
		preview.style.stroke = options.strokeColor.value;
		preview.style.strokeWidth = options.strokeWidth.value;
	}

	const keybind = document.getElementById('keybind');
	if (keybind) {
		const keyStroke = options.gridKeybinding.value.split('+');

		for (const key of keyStroke) {
			const label = document.createElement('label');
			label.setAttribute('for', 'grid-keybinding');
			label.className = 'key';
			label.textContent = convert(key);
			keybind.appendChild(label);
		}
	}

	kb.value = options.gridKeybinding.value;
	width.value = String(options.strokeWidth.value).slice(0, -2);
	color.value = options.strokeColor.value;
}

function macOS(): boolean {
	return 'mac' === navigator.platform.slice(0, 3).toLowerCase();
}

function capitalize(word: string): string {
	return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
}

function convert(key: string): string {
	if (macOS()) {
		switch (key) {
			case 'Ctrl':
				return '⌘';
			case 'Command':
				return '⌘';
			case 'MacCtrl':
				return '⌃';
			case 'Alt':
				return '⌥';
		}
	}

	switch (key) {
		case 'Period':
			return '.';
		case 'Comma':
			return ',';
		case 'Control':
			return 'Ctrl';
		default:
			return capitalize(key);
	}
}

function setCommand() {
	const popup = document.getElementById('popup');
	if (popup) {
		popup.style.opacity = '1';
	}

	const macos = macOS();
	const keyStroke: string[] = [];

	const handler = (event: KeyboardEvent) => {
		event.preventDefault();

		const modifiers: string[] = ['Control', 'Alt', 'Shift', 'Meta'];

		if (event.type === 'keydown') {
			if (!modifiers.includes(event.key)) {
				if (event.code.includes('Key')) {
					keyStroke.push(event.code.slice(3));
				} else {
					keyStroke.push(event.code);
				}

				return;
			}

			if (macos && event.key === 'Meta') {
				keyStroke.push('Command');
				return;
			}

			if (macos && event.key === 'Control') {
				keyStroke.push('MacCtrl');
				return;
			}

			keyStroke.push(event.key);
		}

		if (event.type === 'keyup') {
			const keybind = document.getElementById('keybind');
			if (keybind && keyStroke.length > 1) {
				keybind.innerHTML = '';

				for (const key of keyStroke) {
					const label = document.createElement('label');
					label.setAttribute('for', 'grid-keybinding');
					label.className = 'key';
					label.textContent = convert(key);
					keybind.appendChild(label);
				}

				const binding = keyStroke.join('+');
				const input = document.getElementById('grid-keybinding') as HTMLInputElement;
				if (input) {
					input.value = binding;
				}
			}

			if (popup) {
				popup.style.opacity = '0';
			}

			window.removeEventListener('keydown', handler);
			window.removeEventListener('keyup', handler);
		}
	};

	window.addEventListener('keydown', handler);
	window.addEventListener('keyup', handler);
}

let hasRun = false;

if (!hasRun) {
	document.addEventListener('DOMContentLoaded', async () => {
		await restoreOptions();
	});

	document.getElementById('submit')?.addEventListener('click', async (event: Event) => {
		await update(event);
	});

	document.getElementById('stroke-color')?.addEventListener('input', (event) => {
		const color = (event.target as HTMLInputElement).value;
		const wrapper = document.getElementById('color-wrapper');
		if (wrapper) {
			wrapper.style.backgroundColor = color;
		}

		const preview = document.getElementById('gridt-preview');
		if (preview) {
			preview.style.stroke = color;
		}
	});

	document.getElementById('stroke-width')?.addEventListener('input', (event) => {
		const range = (event.target as HTMLInputElement).value;

		const preview = document.getElementById('gridt-preview');
		if (preview) {
			preview.style.strokeWidth = range;
		}
	});

	document.getElementById('grid-keybinding')?.addEventListener('click', setCommand);

	hasRun = true;
}
