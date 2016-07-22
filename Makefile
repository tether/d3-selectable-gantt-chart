PATH        := $(PATH):node_modules/.bin
example_dir := example

.PHONY: install
install: node_modules

node_modules: package.json
	@npm install
	@touch $@

.PHONY: serve
serve: build.example
	@ruby -run -e httpd example/

.PHONY: build.example
build.example:
	@browserify $(example_dir)/example.js -o $(example_dir)/example.dist.js

.PHONY: lint
lint:
	@jshint main.js
	@[ $$? -eq 0 ] && echo 'Lint ✅'
