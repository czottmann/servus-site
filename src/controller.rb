require "rubygems"
require "bundler/setup"
Bundler.require(:development)

layout "layout.html.haml"

ignore /\/_.*\.(scss|js)/
ignore /\/js\/foundation.*/

before 'js/all.js' do |f|
  instead %w( foundation/foundation foundation/foundation.topbar _top ).map { |name|
    render("js/#{name}.js")
  }.join("\n\n")
end
