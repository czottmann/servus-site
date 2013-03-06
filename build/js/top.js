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


// Frontpage
$(document).ready( function() {
  if ( !$(".page-frontpage").length ) {
    return;
  }

  var $adjective = $("#claim .adjective"),
    $targetDemographic = $("#claim .target-demographic"),
    adjectives = $adjective.data("words").split(","),
    targetDemographics = $targetDemographic.data("words").split(","),
    indexAdjective = 1,
    indexTargetDemographic = 1;

  window.setInterval( function() {
    $adjective.fadeOut( 400, function() {
      $(this)
        .text( adjectives[ indexAdjective++ % adjectives.length ] )
        .fadeIn(400);
    });
  }, 5000 );

  window.setTimeout( function() {
    window.setInterval( function() {
      $targetDemographic.fadeOut( 400, function() {
        $(this)
          .text( targetDemographics[ indexTargetDemographic++ % targetDemographics.length ] + "." )
          .fadeIn(400);
      });
    }, 5000 );
  }, 2500 );
});


// FAQ
$(document).ready( function() {
  if ( !$(".page-faq").length ) {
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
