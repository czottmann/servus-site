require "rubygems"
require "bundler/setup"
Bundler.require(:development)

layout "_layout.html.haml"

ignore /\/_.*\.(scss|js)/
ignore /\/js\/foundation.*/

before /.*html\.haml/ do
  @page_title = nil
end

# Concatenate all relevant JS files into `js/all.js`
before 'js/all.js' do |f|
#      vendor/jquery.min.js
  js_files = %w(
      foundation/foundation.js
      foundation/foundation.topbar.js
      foundation/foundation.clearing.js
      vendor/css3-mediaqueries.js
      vendor/jquery.nouislider.min.js
      _top.js
    ) + Dir.glob("_page*")

  js_output = js_files.map do |name|
    render(name)
  end

  instead js_output.join("\n\n")
end
