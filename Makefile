build:
	npm run build

test:
	./node_modules/mocha/bin/mocha --reporter spec --compilers ts:ts-node/register src/*.test.ts

publish:
	npm run build
	npm publish
