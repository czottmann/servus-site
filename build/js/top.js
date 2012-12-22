if ( top !== self ) {
  top.location = self.location.href;
}
else if ( document.location.host !== "servus.io" && document.location.host !== "localhost" ) {
  document.location.href = "https://servus.io";
}

// Google Analytics
var _gaq = _gaq || [];
_gaq.push(["_setAccount", "UA-3142618-11"]);
_gaq.push(["_setDomainName", "servus.io"]);
_gaq.push(["_setAllowLinker", true]);
_gaq.push(["_trackPageview"]);

(function() {
  var ga = document.createElement("script"),
    s = document.getElementsByTagName("script")[0];

  ga.type = "text/javascript";
  ga.src = "https://ssl.google-analytics.com/ga.js";
  ga.async = true;
  s.parentNode.insertBefore(ga, s);
})();


// GoSquared
var GoSquared = { acct: "GSN-208108-B" };
(function() {
  window._gstc_lt = +new Date();

  var d = document,
    g = d.createElement("script"),
    s = d.getElementsByTagName("script")[0];

  g.type = "text/javascript";
  g.src = "//d1l6p2sc9645hc.cloudfront.net/tracker.js";
  g.async = true;
  s.parentNode.insertBefore(g, s);
})();


// Click tracking
/*
$("a").on( "click", function(evt) {
  evt.preventDefault();

  var $elem = $(this);

  if ( $elem.hasClass("download") ) {
    GoSquared.DefaultTracker.TrackEvent("Clicked 'Download'");
    _gaq.push([ "_trackEvent", "Outbound links", "Download", this.href, null, false ]);
  }
  else if ( $elem.hasClass("buy") ) {
    GoSquared.DefaultTracker.TrackEvent("Clicked 'Buy'");
    _gaq.push([ "_trackEvent", "Outbound links", "Store", this.href, null, false ]);
  }
  else if ( this.host !== document.location.host ) {
    GoSquared.DefaultTracker.TrackEvent("Clicked outbound link", this.href);
    _gaq.push([ "_trackEvent", "Outbound links", this.text, this.href, null, false ]);
  }

  setTimeout( function() {
    document.location = $elem.attr("href"); }, 100
  );
});
*/


// FAQ
$(document).ready( function() {
  if ( !$("#faq").length ) {
    return;
  }

  var $ul = $("<ul id='faq-toc' class='square'>").insertAfter("#content-column h1");

  $("#content-column h2").each( function() {
    var $elem = $(this),
      $li = $( "<li>", {
        "html": $( "<a>", {
          "html": $.trim( $elem.text() ),
          "href": "#" + $elem.attr("id")
        })
      });

    $ul.append($li);

    // Add link to self to headline.
    $elem.append(
      $( "<a>", {
        "href": "#" + $elem.attr("id"),
        "title": "Link to this FAQ section",
        "html": "&para;"
      })
    );

    // Add back-to-top arrows to each section's last paragraph.
    $elem.closest("section").find("p:last").append(
      $("<br>"),
      $( "<a>", {
        "class": "back-to-top",
        "href": "#",
        "title": "Back to top",
        "html": "&uArr;"
      })
    );
  });
});


// Development
(function() {
  if ( document.location.host === "localhost" ) {
    var ga = document.createElement('script'); ga.type = 'text/javascript';
    ga.src = "http://localhost:35729/livereload.js?snipver=1";
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  }
})();
