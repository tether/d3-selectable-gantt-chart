PATH        := $(PATH):node_modules/.bin
SHELL       := /bin/bash
example_dir := example

.PHONY: install
install: node_modules

node_modules: package.json
	@npm install
	@touch $@

.PHONY: serve
serve: install
	@$(MAKE) build.watch &
	@ruby -run -e httpd example/ --port=8080

.PHONY: build.watch
build.watch:
	@watchify $(example_dir)/example.js --outfile=$(example_dir)/example.dist.js --verbose &

.PHONY: build.example
build.example: install
	@browserify $(example_dir)/example.js --outfile=$(example_dir)/example.dist.js --verbose

.PHONY: lint
lint: install
	@jshint main.js
	@[ $$? -eq 0 ] && echo 'Lint ✅'

.PHONY: test
test: install lint
	@jasmine-node test/
