require "rubygems"
require "bundler/setup"
Bundler.require(:development)

layout "_layout.html.haml"

ignore /\/_.*\.(scss|js)/
ignore /\/js\/foundation.*/

before /.*html\.haml/ do
  @page_title = ""
end

# Concatenate all relevant JS files into `js/all.js`
before 'js/all.js' do |f|
  js_files = %w(
      vendor/jquery.min.js
      foundation/foundation.js
      foundation/foundation.topbar.js
      foundation/foundation.clearing.js
      vendor/css3-mediaqueries.js
      _top.js
    ) + Dir.glob("_page*")

  js_output = js_files.map do |name|
    render(name)
  end

  instead js_output.join("\n\n")
end
