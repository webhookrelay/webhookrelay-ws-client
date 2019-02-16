build:
	npm run build

test:
	./node_modules/mocha/bin/mocha --reporter spec --compilers ts:ts-node/register src/*.test.ts

publish:
	npm run build
	npm publish

# https://blog.npmjs.org/post/118393368555/deploying-with-npm-private-modules
drone-publish:
	echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc	
	npm publish