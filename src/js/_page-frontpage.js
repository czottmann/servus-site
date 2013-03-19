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
