import * as esbuild from 'esbuild';
import { glsl } from "esbuild-plugin-glsl";
import postCSSPlugin from './postcss-plugin.js';
import postcssPresetEnv from 'postcss-preset-env';
import cssnano from 'cssnano';
import postcssAutoReset from 'postcss-autoreset';
import postcssInitial from 'postcss-initial';

var isBuild = process.argv.includes('--build') || process.argv.includes('-b');

export async function build() {
    let minify = false;

    const entryPoints = [
        './src/**/*.ts',
        './src/**/*.tsx',
        './src/**/*.glsl',
        './src/popup/styles.css'
    ]

    let postcss = [
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
        })
    ]

    if (isBuild) {
        postcss.push(
            cssnano({
                preset: 'default',
            }));

        minify = true;
    };

    const settings = {
        entryPoints: entryPoints,
        bundle: true,
        outdir: './dist',
        format: 'iife',
        platform: 'browser',
        minify: minify,
        plugins: [
            glsl({
                minify: minify
            }),

            postCSSPlugin({
                plugins: postcss
            })
        ]
    };

    let ctx = await esbuild.context(settings);

    if (isBuild) {
        try{
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
        await ctx.watch()
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
        build()
            .catch((err) => {
                console.error('An error occurred in the build process:', err);
                process.exit(1);
            })
    }
}

main();
