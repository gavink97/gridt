import { DefaultOptions } from '../utils/default-variables.ts';
import { RetrieveOptions, StoreOptions } from '../utils/storage.ts';
import type { Input, Options } from '../utils/types.ts';

function getOptions(): Options {
	const def = DefaultOptions;

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
		strokeWidth: width,
		strokeColor: color,
	};
}

async function update(e: Event): Promise<void> {
	e.preventDefault();
	const options = getOptions();
	await StoreOptions(options);
}

async function restoreOptions() {
	const options = await RetrieveOptions();

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

	width.value = String(options.strokeWidth.value).slice(0, -2);
	color.value = options.strokeColor.value;
}

let hasRun = false;

if (!hasRun) {
	document.addEventListener('DOMContentLoaded', restoreOptions);

	document.getElementById('submit')?.addEventListener('click', update);

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

	hasRun = true;
}
