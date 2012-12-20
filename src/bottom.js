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
