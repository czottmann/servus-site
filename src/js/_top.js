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


// Pay-What-You-Want functionality
$(document).ready( function() {
  if ( !$("#pwyw").length ) {
    return;
  }

  var rangeLow = 2,
    rangeHigh = 20,
    suggestedPrice = 5;

  function getComputedPrices(rawValue) {
    return {
      eur: +rawValue,
      usd: +( rawValue * 1.3 ).toPrecision(3)
    };
  }

  function getFormattedComputedPrices(rawValue) {
    var prices = getComputedPrices(rawValue);

    return {
      eur: prices.eur.toFixed(2).replace( /\.00$/, "" ),
      usd: prices.usd.toFixed(2).replace( /\.00$/, "" )
    };
  }

  function updateCurrentPriceDisplay(rawValue) {
    var prices = getFormattedComputedPrices(rawValue);

    $("#pwyw .js-selected-price").text(
      [ "€", prices.eur,
        " / ",
        "$", prices.usd
      ].join("")
    );
  }

  function renderPriceRangeDisplay() {
    var priceLow = getFormattedComputedPrices(rangeLow),
      priceHigh = getFormattedComputedPrices(rangeHigh);

    $("#pwyw")
      .find(".js-range-low").html(
        [ "€", priceLow.eur,
          "<br>",
          "$", priceLow.usd
        ].join("")
      )
      .end()
      .find(".js-range-high").html(
        [ "€", priceHigh.eur,
          "<br>",
          "$", priceHigh.usd
        ].join("")
      );
  }

  function updateStoreLink(rawValue) {
    var prices = getFormattedComputedPrices(rawValue),
      link = document.createElement("a"),
      $elem = $("#pwyw a.button-buy");

    link.href = $elem.attr("href");
    link.search = [
      "?tags=total_eur=",
      prices.eur * 100,
      ",total_usd=",
      prices.usd * 100
    ].join("");

    $("#pwyw a.button-buy").attr({
      href: link.href
    });
  }

  $("#pwyw-slider").noUiSlider({
    handles: 1,
    range: [ rangeLow, rangeHigh ],
    start: suggestedPrice,
    step: 0.5,
    slide: function() {
      var price = +$(this).val();

      updateCurrentPriceDisplay(price);
      updateStoreLink(price);
    }
  });

  renderPriceRangeDisplay();
  updateCurrentPriceDisplay(suggestedPrice);
  updateStoreLink(suggestedPrice);

  // Toggle "read more" section visibility
  $("#read-more")
    .data( "height", $("#read-more").height() )
    .height(0)
    .css( "opacity", 0 );

  $(".js-toggle-read-more").one( "click", function() {
    var $section = $("#read-more");

    $section.animate({
      height: $section.data("height") + 26,
      opacity: 1
    }, 300 );

    $(".js-toggle-read-more").remove();
  });
});
