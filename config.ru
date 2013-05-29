require "rack/contrib/response_headers"
require "rack/rewrite"

use Rack::ResponseHeaders do |headers|
  headers["Access-Control-Allow-Origin"] = "https://assets.servus.io"
end

use Rack::Rewrite do
  # Campaigns
  found "/~fb1", "https://servus.io/?utm_campaign=fb1"

  found "/beta", "https://rink.hockeyapp.net/apps/bf33ffe8d7ef7387daaf9d947b6af0a6"
  found "/buy", "/buy.html"   # "https://sites.fastspring.com/municode/instant/servus"
  found "/download", "https://updates.servus.io/download"
  found "/theme-docs", "/theme-docs.html"

  found "/+", "https://plus.google.com/101996114152007191046"
  found "/twitter", "https://twitter.com/servusio"

  moved_permanently "/download-trial", "/download"
  moved_permanently %r{.*}, "https://servus.io/", :if => Proc.new { |rack_env|
    rack_env["SERVER_NAME"] != "servus.io" && rack_env["SERVER_NAME"] != "localhost"
  }
end

use Rack::Deflater
use Rack::Static, :urls => [/./], :root => "build", :index => "index.html"

run Proc
