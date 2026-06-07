import * as esbuild from 'esbuild';
import { glsl } from 'esbuild-plugin-glsl';
import postCSSPlugin from './postcss-plugin.js';
import postcssPresetEnv from 'postcss-preset-env';
import cssnano from 'cssnano';
import postcssAutoReset from 'postcss-autoreset';
import postcssInitial from 'postcss-initial';
import postcssImport from 'postcss-import';
import { cp, globSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

var isBuild = process.argv.includes('--build') || process.argv.includes('-b');

const distDir = join(cwd(), 'dist');
const inputDir = join(cwd(), 'src');

export async function build() {
	let minify = false;

	getHtml();

	const entryPoints = globSync(join(inputDir, '**/**/*.*'));
	const inputs = entryPoints.filter((entry) => !entry.includes('__tests__') && !entry.endsWith('.html'));

	let postcss = [
		postcssImport(),
		postcssInitial({ reset: 'inherited' }),
		postcssAutoReset({
			reset: {
				margin: 0,
				padding: 0,
				borderRadius: 0,
			},
		}),
		postcssPresetEnv({
			features: {},
		}),
	];

	if (isBuild) {
		postcss.push(
			cssnano({
				preset: 'default',
			}),
		);

		minify = true;
	}

	const settings = {
		entryPoints: inputs,
		bundle: true,
		outdir: distDir,
		format: 'iife',
		platform: 'browser',
		minify: minify,
		plugins: [
			glsl({
				minify: minify,
			}),

			postCSSPlugin({
				plugins: postcss,
			}),
		],
	};

	let ctx = await esbuild.context(settings);

	if (isBuild) {
		try {
			console.log('Starting build process...');
			await esbuild.build(settings);
		} catch (err) {
			throw err;
		} finally {
			if (ctx) {
				await ctx.dispose();
			}
		}
	} else {
		await ctx.watch();
		console.log('watching...');
	}
}

function main() {
	if (isBuild) {
		build()
			.catch((err) => {
				console.error('An error occurred in the build process:', err);
				process.exit(1);
			})
			.finally(() => {
				console.log('Build Complete');
			});
	} else {
		build().catch((err) => {
			console.error('An error occurred in the build process:', err);
			process.exit(1);
		});
	}
}

function getHtml() {
	const files = readdirSync(inputDir, { withFileTypes: true, recursive: true });

	for (const file of files) {
		if (!file.name.endsWith('html')) {
			continue;
		}
		const input = join(file.parentPath, file.name);
		const path = join(file.parentPath.split(inputDir)[1], file.name);
		const output = join(distDir, path);

		cp(input, output, (err) => {
			if (err) {
				throw err;
			}

			console.log(`copied ${path}`);
		});
	}
}

main();
