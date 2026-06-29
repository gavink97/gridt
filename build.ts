import { globSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { cwd } from 'node:process';
import cssnano from 'cssnano';
import * as esbuild from 'esbuild';
import postcss from 'postcss';
import postcssAutoReset from 'postcss-autoreset';
import postcssImport from 'postcss-import';
import postcssInitial from 'postcss-initial';
import postcssPresetEnv from 'postcss-preset-env';

var isBuild = process.argv.includes('--build') || process.argv.includes('-b');

const distDir = join(cwd(), 'dist');
const inputDir = join(cwd(), 'src');

async function main() {
	const entryPoints = globSync(join(inputDir, '**/**/*.*'));
	const inputs = entryPoints.filter((entry) => !entry.includes('__tests__'));

	const postCSSPlugins: any[] = [
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
		postCSSPlugins.push(
			cssnano({
				preset: 'default',
			}),
		);
	}

	const postCSSPlugin: esbuild.Plugin = {
	name: "postcss",
	setup: (build) => {
		build.onResolve(
			{ filter: /\.css$/, namespace: "file" },
			async (args) => {
				return { path: args.path, namespace: "file" };
			}
		);


		build.onLoad(
			{ filter: /\.css$/, namespace: "file" },
			async (args) => {
				try {
					const css = await readFile(args.path, {encoding: 'utf8'})
					const result = await postcss(postCSSPlugins).process(css, {
						from: args.path
					})

					return {
						contents: result.css,
						loader: 'css'
					};

					} catch(err: any) {
          				return { errors: [err] };
					}
				})
		}
	}

	const settings: esbuild.BuildOptions = {
		entryPoints: inputs,
		bundle: true,
		outdir: distDir,
		format: 'iife',
		platform: 'browser',
		minify: isBuild,
		loader: {
			'.html': 'copy'
		},
		plugins: [
			postCSSPlugin,
		],
	};

	const ctx = await esbuild.context(settings);

	if (isBuild) {
		try {
			console.log('Starting build process...');
			await esbuild.build(settings);
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

try {
	await main()
} catch (err: any) {
	console.error(err)
	process.exit(1)
}
