.PHONY: run
run:
	web-ext run --devtools --browser-console --reload --no-config-discovery

.PHONY: lint
lint:
	web-ext lint

.PHONY: build
build:
	web-ext build

.PHONY: sign
sign:
	web-ext sign

.PHONY: watch
watch:
	node ./esbuild.config.mjs

.PHONY: eb
eb:
	node ./esbuild.config.mjs --build

.PHONY: playwright
playwright:
	npx playwright test tests

.PHONY: codegen
codegen:
	npx playwright codegen

.PHONY: report
report:
	npx playwright show-report

.PHONY: vitest
vitest:
	npx vitest run src

.PHONY: biome
biome:
	biome check --write ./src
