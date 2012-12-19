if ( top !== self ) {
  top.location = self.location.href;
}
else if ( document.location.host !== "servus.io" && document.location.host !== "localhost" ) {
  document.location.href = "https://servus.io";
}

var _gaq = _gaq || [];
_gaq.push(["_setAccount", "UA-3142618-11"]);
_gaq.push(["_setDomainName", "servus.io"]);
_gaq.push(["_setAllowLinker", true]);
_gaq.push(["_trackPageview"]);

(function() {
  var ga = document.createElement("script");
  ga.type = "text/javascript";
  ga.async = true;
  ga.src = "https://ssl.google-analytics.com/ga.js";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(ga, s);
})();

(function() {
  if ( document.location.host === "localhost" ) {
    var ga = document.createElement('script'); ga.type = 'text/javascript';
    ga.src = "http://localhost:35729/livereload.js?snipver=1";
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  }
})();
