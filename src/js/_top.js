if ( top !== self ) {
  top.location = self.location.href;
}
else if ( document.location.host !== "servus.io" && document.location.hostname !== "localhost" ) {
  document.location.href = "https://servus.io";
}


// GoSquared
var GoSquared = { acct: "GSN-208108-B" };

// Google Analytics
var _gaq = _gaq || [];
_gaq.push(["_setAccount", "UA-3142618-11"]);
_gaq.push(["_setDomainName", "servus.io"]);
_gaq.push(["_setAllowLinker", true]);
_gaq.push(["_trackPageview"]);

(function(isLocalhost) {
  if (isLocalhost) {
    return;
  }

  var d = document,
    gs = d.createElement("script"),
    gss = d.getElementsByTagName("script")[0],
    ga = d.createElement("script"),
    gas = d.getElementsByTagName("script")[0];

  // GoSquared
  window._gstc_lt = +new Date();
  gs.type = "text/javascript";
  gs.src = "//d1l6p2sc9645hc.cloudfront.net/tracker.js";
  gs.async = true;
  gss.parentNode.insertBefore(gs, s);

  // Google Analytics
  ga.type = "text/javascript";
  ga.src = "https://ssl.google-analytics.com/ga.js";
  ga.async = true;
  gas.parentNode.insertBefore(ga, s);
})( document.location.hostname === "localhost" );


// Initialize Foundation.
$(document).foundation();


// Highlighting the right menu section.
$(document).ready( function() {
  if ( location.pathname === "/" ) {
    return;
  }

  $("#main-nav a[href^='" + location.pathname + "']")
    .closest("li")
    .addClass("active");
});


// TOC generation
$(document).ready( function() {
  if ( !$("#toc").length ) {
    return;
  }

  var $ul = $("<ul id='faq-toc' class='square'>").appendTo("#toc");

  $("#content-column h3").each( function() {
    var $elem = $(this),
      sectionID = "#" + $elem.closest("section").attr("id"),
      $li = $( "<li>", {
        "html": $( "<a>", {
          "html": $.trim( $elem.text() ),
          "href": sectionID
        })
      });

    $ul.append($li);

    // Append link back to TOC to headline.
    $elem.append(
      "&nbsp;",
      $( "<a>", {
        "class": "nav-marker",
        "href": sectionID,
        "title": "Link to this section",
        "html": "&para;"
      })
    );

    // Add back-to-top arrows to each section's last paragraph.
    $elem.closest("section").find("li, p").last().append(
      "&nbsp;",
      $( "<a>", {
        "class": "nav-marker back-to-top",
        "href": "#",
        "title": "Back to top",
        "html": "&uArr;"
      })
    );
  });
});
