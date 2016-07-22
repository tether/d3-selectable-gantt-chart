PATH        := $(PATH):node_modules/.bin
example_dir := example

.PHONY: install
install: node_modules

node_modules: package.json
	@npm install
	@touch $@

.PHONY: serve
serve: build.example
	@ruby -run -e httpd example/ --port=8080

.PHONY: build.example
build.example: install
	@browserify $(example_dir)/example.js -o $(example_dir)/example.dist.js

.PHONY: lint
lint: install
	@jshint main.js
	@[ $$? -eq 0 ] && echo 'Lint ✅'
