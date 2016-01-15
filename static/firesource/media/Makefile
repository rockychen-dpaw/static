# Makefile for building js & css
#

CLOSURELIBRARY=/opt/closure-library
OUTPUT=compiled

.PHONY: help clean css soy script all

help:
	@echo "Please use \`make <target>' where <target> is one of"
	@echo "  css        csstidy css"
	@echo "  soy        closure soy templates javascript"
	@echo "  script     concatenated javascript"
	@echo "  all  css and concatenated javascript"

clean:
	rm firesource-raw.css
	rm firesource-tidy.css
	rm js/firesource/templates.soy
	rm js/firesource/templates.js
	rm firesource.js

css:
	cat css/*.css > firesource-raw.css
	cssbeautify firesource-raw.css > firesource-tidy.css;

soy:
	echo "{namespace fssoy}" > js/firesource/templates.soy;
	cat js/firesource/templates/*.soy >> js/firesource/templates.soy;
	java -jar /opt/closure-templates/SoyToJsSrcCompiler.jar --outputPathFormat js/firesource/templates.js js/firesource/templates.soy;
	sed -i -e "1igoog.provide('fssoy');\\" js/firesource/templates.js
	sed -i -e "1igoog.require('soy');\\" js/firesource/templates.js

script: soy
	$(CLOSURELIBRARY)/closure/bin/build/closurebuilder.py --root=$(CLOSURELIBRARY) --root=js -i js/closure-firesource.js -o $(OUTPUT) --compiler_jar /opt/closure-compiler/compiler.jar --output_file=firesource.js;

ugly: soy
	$(CLOSURELIBRARY)/closure/bin/build/closurebuilder.py --root=$(CLOSURELIBRARY) --root=js -i js/closure-firesource.js -o script --compiler_jar /opt/closure-compiler/compiler.jar --output_file=firesource-raw.js;
	uglifyjs firesource-raw.js -b --screw-ie8 > firesource-ugly.js

all: css script

