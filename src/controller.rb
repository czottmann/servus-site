%w( rubygems bundler/setup haml sass ).each do |g|
  require g
end

layout "layout.html.haml"
