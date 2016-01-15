# Makefile for building js & css
#

.PHONY: help clean png

help:
	@echo "Please use \`make <target>' where <target> is one of"
	@echo "  all       build images according to make.py script"

clean:
	rm -rf build 

all:
	hg addremove --similarity=1 && hg commit -u make ; echo building...
	python make.py source build
