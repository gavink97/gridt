const commandName = 'toggle-feature';

function saveOptions(e: Event) {
	e.preventDefault();
	browser.storage.sync.set({
		shortcut: (<HTMLInputElement>document.getElementById('shortcut')).value,
	});
}

function restoreOptions() {
	async function setCurrentChoice(result: any) {
		const commands = await browser.commands.getAll();
		for (const command of commands) {
			if (command.name === commandName) {
				(<HTMLInputElement>document.getElementById('shortcut')).value = result.shortcut ?? command.shortcut;
			}
		}
	}

	function onError(error: any) {
		console.log(`Error: ${error}`);
	}

	const getting = browser.storage.sync.get('shortcut');
	getting.then(setCurrentChoice, onError);
}

async function update(e: Event) {
	await browser.commands.update({
		name: commandName,
		shortcut: (<HTMLInputElement>document.getElementById('shortcut')).value,
	});
	saveOptions(e);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#submit').addEventListener('click', update);
