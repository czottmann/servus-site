require "rubygems"
require "bundler/setup"
Bundler.require(:development)

layout "layout.html.haml"
ignore /\/_.*\.scss/
