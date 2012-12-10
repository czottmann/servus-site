require "rack/contrib/response_headers"
require "rack/rewrite"

use Rack::ResponseHeaders do |headers|
  headers["Access-Control-Allow-Origin"] = "https://assets.servus.io"
end

use Rack::Rewrite do
  found "/theme-docs", "http://documentup.com/carlo/servus-theme-boilerplate"
  found "/download-trial", "https://updates.servus.io/1.1/Servus.zip"
  found "/buy", "http://sites.fastspring.com/municode/product/servus"

  r301 %r{.*}, "https://servus.io/", :if => Proc.new {|rack_env|
    rack_env["SERVER_NAME"] != "servus.io"
  }
end

use Rack::Deflater
use Rack::Static, :urls => [/./], :root => "build", :index => "index.html"

run Proc
