/*jshint asi: false, bitwise: false, boss: false, browser: true,
  camelcase: true, curly: true, debug: false, devel: true, eqeqeq: true,
  eqnull: false, evil: false, forin: false, immed: true, indent: 2,
  laxbreak: true, newcap: true, noarg: true, noempty: false, nomen: false,
  nonew: false, onevar: false, passfail: false, plusplus: false,
  quotmark: 'double', regexp: false, shadow: false, strict: false, sub: true,
  trailing: true, undef: true, white: false */
/*global window: false, self: false, $: false */


if ( top !== self ) {
  top.location = self.location.href;
}
else if ( document.location.host !== "servus.io" && document.location.hostname !== "localhost" ) {
  document.location.href = "https://servus.io";
}


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
    $elem.closest("section").find("li, p, dl").last().append(
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
