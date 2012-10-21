require "rack/contrib/response_headers"
require "rack/rewrite"

use Rack::ResponseHeaders do |headers|
  headers["Access-Control-Allow-Origin"] = "https://assets.servus.io"
end

use Rack::Rewrite do
  found "/theme-docs", "http://documentup.com/carlo/servus-theme-boilerplate"
end

use Rack::Deflater
use Rack::Static, :urls => [/./], :root => "build", :index => "index.html"

run Proc
