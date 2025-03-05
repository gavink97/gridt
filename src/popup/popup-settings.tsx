// biome-ignore lint: using this method to build tsx
import { DOMcreateElement } from '../utils/tsx.ts';

const SharedPanel = () => {
	return (
		<shared-panel>
			<div class='advanced'>
				<input type='checkbox' id='extra-options' name='extra-options' />
				<label for='extra-options' id='extra-label' title='Show extra options'>
					Show Advanced Options
				</label>
			</div>

			<div class='attach'>
				<input type='checkbox' id='use-window' name='use-window' checked />
				<label for='use-window' id='use-window-label' title='attaches fixed to client window size'>
					Attach to Window
				</label>
				<input
					class='hidden'
					type='text'
					id='append-to-element'
					name='append-to-element'
					title='attaches absolute to an element'
					value='body'
				/>
			</div>
		</shared-panel>
	);
};

function standard() {
	return (
		<standard-options>
			<div class='columns'>
				<label for='columns' id='columns-label'>
					Columns:
				</label>
				<input
					type='number'
					name='columns'
					id='columns'
					value='6'
					min='1'
					placeholder='6'
					title='grid-template-columns'
				/>
			</div>

			<div class='rows'>
				<label for='rows' id='rows-label'>
					Rows:
				</label>
				<input
					type='number'
					name='rows'
					id='rows'
					value='8'
					min='1'
					placeholder='8'
					title='grid-template-rows'
				/>
			</div>

			<div class='gaps'>
				<label for='gaps' id='gaps-label'>
					Gaps:
				</label>
				<input type='text' name='gaps' id='gaps' value='20px' placeholder='20px' title='gap' />
			</div>

			<div id='margins'>
				<label for='margin' id='margin-label'>
					Outside Margin:
				</label>
				<input type='text' name='margin' id='margin' value='15px' placeholder='15px' title='inset' />
			</div>

			<SharedPanel />
		</standard-options>
	);
}

function extra() {
	return (
		<extra-options>
			<div class='extra-columns'>
				<label for='extra-columns' id='extra-columns-label'>
					Grid-template-columns:
				</label>
				<input
					type='text'
					name='extra-columns'
					id='extra-columns'
					value='repeat(6, 1fr)'
					placeholder='repeat(6, 1fr)'
					title='grid.grid-template-columns'
				/>
			</div>

			<div class='extra-rows'>
				<label for='extra-rows' id='extra-rows-label'>
					Grid-template-rows:
				</label>
				<input
					type='text'
					name='extra-rows'
					id='extra-rows'
					value='repeat(8, 1fr)'
					placeholder='repeat(8, 1fr)'
					title='grid.grid-template-rows'
				/>
			</div>

			<div class='gaps'>
				<label for='gaps' id='gaps-label'>
					Gaps:
				</label>
				<input type='text' name='gaps' id='gaps' value='20px' placeholder='20px' title='gap' />
			</div>

			<div id='margins'>
				<label for='margin' id='margin-label'>
					Outside Margin:
				</label>
				<input type='text' name='margin' id='margin' value='15px' placeholder='15px' title='inset' />
			</div>

			<div class='line-stroke'>
				<label for='extra-stroke' id='extra-stroke-label'>
					Line Width:
				</label>
				<input
					type='text'
					name='extra-stroke'
					id='extra-stroke'
					value='1px'
					placeholder='1px'
					title='line.width'
				/>
			</div>

			<div class='line-color'>
				<label for='extra-color' id='extra-color-label'>
					Line Color:
				</label>
				<input
					type='text'
					name='extra-color'
					id='extra-color'
					value='blue'
					placeholder='blue'
					title='line.backgroundcolor'
				/>
			</div>

			<div class='keep-open'>
				<input type='checkbox' id='extra-keep-open' name='extra-keep-open' />
				<label for='extra-keep-open' id='extra-keep-open-label'>
					Keep open onreload
				</label>
			</div>

			<SharedPanel />
		</extra-options>
	);
}

document.body.appendChild(standard());
