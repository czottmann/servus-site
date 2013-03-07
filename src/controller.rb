require "rubygems"
require "bundler/setup"
Bundler.require(:development)

layout "_layout.html.haml"

ignore /\/_.*\.(scss|js)/
ignore /\/js\/foundation.*/

# Concatenate all relevant JS files into `js/all.js`
before 'js/all.js' do |f|
  js_files = %w( foundation/foundation.js foundation/foundation.topbar.js foundation/foundation.clearing.js _top.js ) \
    + Dir.glob("_page*")

  js_output = js_files.map do |name|
    render(name)
  end

  instead js_output.join("\n\n")
end
