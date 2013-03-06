// FAQ
$(document).ready( function() {
  if ( !$(".page-faq").length ) {
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
      $( "<a>", {
        "class": "faq-marker",
        "href": sectionID,
        "title": "Link to this FAQ section",
        "html": "&para;"
      })
    );

    // Add back-to-top arrows to each section's last paragraph.
    $elem.closest("section").find("p:last").append(
      "&nbsp;",
      $( "<a>", {
        "class": "faq-marker",
        "href": "#",
        "title": "Back to top",
        "html": "&uArr;"
      })
    );
  });
});
