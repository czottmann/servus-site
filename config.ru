require "rack/contrib/response_headers"

use Rack::ResponseHeaders do |headers|
  headers["Access-Control-Allow-Origin"] = "https://assets.drpln.gs"
end

use Rack::Deflater
use Rack::Static, :urls => [/./], :root => "build", :index => "index.html"

run Proc
