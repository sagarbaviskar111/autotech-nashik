$(function () {

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // MENU - close the mobile menu after a link is tapped
  $('.navbar-nav .nav-link').on('click', function () {
    $('.navbar-collapse').collapse('hide');
  });


  // AOS ANIMATION (off on small screens and for reduced-motion users)
  if (window.AOS) {
    AOS.init({
      disable: function () {
        return reduceMotion || window.innerWidth < 768;
      },
      duration: 800,
      once: true,
      anchorPlacement: 'center-bottom'
    });
  }


  // SMOOTH SCROLL - only for in-page "#section" links that exist on this page
  $('a.nav-link[href^="#"]').on('click', function (event) {
    var $target = $(this.hash);
    if (!$target.length) { return; }

    event.preventDefault();
    $('html, body').stop().animate({
      scrollTop: $target.offset().top - ($(".navbar").outerHeight() || 0) + 1
    }, reduceMotion ? 0 : 700);

    if (window.history && history.pushState) {
      history.pushState(null, '', this.hash);
    }
  });


  // PROJECT SLIDE
  if ($.fn.owlCarousel && $('#project-slide').length) {
    $('#project-slide').owlCarousel({
      loop: true,
      center: true,
      autoplay: !reduceMotion,
      autoplayTimeout: 4000,
      autoplayHoverPause: true,
      margin: 30,
      smartSpeed: 600,
      responsiveClass: true,
      responsive: {
        0:   { items: 1, margin: 16 },
        768: { items: 2, margin: 30 }
      }
    });
  }


  // FOOTER YEAR
  $('#year').text(new Date().getFullYear());

});
