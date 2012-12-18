$("a").on( "click", function(evt) {
  evt.preventDefault();

  var $elem = $(this);

  if ( $elem.hasClass("download") ) {
    _gaq.push([ "_trackEvent", "Outbound links", "Download", this.href, null, false ]);
  }
  else if ( $elem.hasClass("buy") ) {
    _gaq.push([ "_trackEvent", "Outbound links", "Store", this.href, null, false ]);
  }
  else if ( this.host !== document.location.host ) {
    _gaq.push([ "_trackEvent", "Outbound links", this.text, this.href, null, false ]);
  }

  setTimeout( function() { document.location = $elem.attr("href"); }, 100 );
});

var GoSquared = { acct: "GSN-208108-B" };
(function(w) {
  function gs() {
    w._gstc_lt = +new Date;
    var d = document, g = d.createElement("script"), s = d.getElementsByTagName("script")[0];
    g.type = "text/javascript"; g.src = "//d1l6p2sc9645hc.cloudfront.net/tracker.js";
    s.parentNode.insertBefore(g, s);
  }
  w.addEventListener ?
    w.addEventListener("load", gs, false) :
    w.attachEvent("onload", gs);
})(window);
