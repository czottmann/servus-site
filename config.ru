require "rack/contrib/response_headers"
require "rack/rewrite"

use Rack::ResponseHeaders do |headers|
  headers["Access-Control-Allow-Origin"] = "https://assets.servus.io"
end

use Rack::Deflater
use Rack::Static, :urls => [/./], :root => "build", :index => "index.html"
use Rack::Rewrite do
  302 "/theme-docs", "http://documentup.com/carlo/servus-theme-boilerplate"
end

run Proc
