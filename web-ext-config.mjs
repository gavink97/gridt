import 'dotenv/config'

export default {
    build: {
        overwriteDest: true,
    },
    ignoreFiles: [
        'package-lock.json',
        'biome.json',
        'commitlint.config.js',
        'esbuild.config.mjs',
        'icon.afdesign',
        'images/gridt.jpg',
        'makefile',
        'package.json',
        'playwright.config.ts',
        'postcss-plugin.js',
        'tests',
        'tsconfig.json',
        'vitest.config.ts',
        'web-ext-config.mjs'
    ],
    sign: {
        apiKey: process.env.WEB_EXT_API_KEY,
        apiSecret: process.env.WEB_EXT_API_SECRET,
        channel: "listed"
    }
};
