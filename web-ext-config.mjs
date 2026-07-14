import 'dotenv/config';

export default {
	build: {
		overwriteDest: true,
	},
	ignoreFiles: [
		'package-lock.json',
		'biome.json',
		'commitlint.config.js',
		'icon.afdesign',
		'images/gridt.jpg',
		'makefile',
		'package.json',
		'tests',
		'tsconfig.json',
		'vitest.config.ts',
		'web-ext-config.mjs',
		'src',
		'build.ts',
	],
	sign: {
		apiKey: process.env.WEB_EXT_API_KEY,
		apiSecret: process.env.WEB_EXT_API_SECRET,
		channel: 'listed',
	},
};
