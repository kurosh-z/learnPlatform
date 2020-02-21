define([], function() {
  return {
    animateObj: [], //{grad:135, color1:"", color2: ""},
    animateArr: [],
    animateLineObj: [],

    init: function() {
      var self = this;
      var width = 0;

      width = $(window).width();

      // Disables Command Line typing functionality...
      $('body').on('click', function() {
        if (DM.app.navigation.isTyping) {
          DM.app.navigation.isTyping = false;
          $('#typewriter-cursor').hide();
        }
      });

      $('body').on('mouseenter', '.button, .js-button', function() {
        //bId = $(this).data('bId');
        //TweenMax.to(DM.app.effects.animateObj[bId], 0.5, {grad:45, deg: 15, ease:Quart.easeOut, overwrite:"all", onUpdate: DM.app.effects.doButtonRolloverAnimation,  onUpdateParams:[$(this), bId, true]});
        // TweenMax.to($(this), 0.5, {rotationX: 15, ease:Quart.easeOut, overwrite:"all"});
      });

      $('body').on('mouseleave', '.button, .js-button', function() {
        //bId = $(this).data('bId');
        //TweenMax.to(DM.app.effects.animateObj[bId], 0.5, {grad:90, deg: 0,  ease:Quart.easeOut, overwrite:"all", onUpdate: DM.app.effects.doButtonRolloverAnimation,  onUpdateParams:[$(this), bId, false]});
        //TweenMax.to($(this), 0.5, {rotationX: 0, ease:Quart.easeOut, overwrite:"all"});
      });

      $('body').on('mouseenter', '.project', function() {
        TweenMax.to($(this).find('img'), 4, {
          scale: 1.05,
          ease: Quart.easeOut
        });
      });
      $('body').on('mouseleave', '.project', function() {
        TweenMax.to($(this).find('img'), 4, { scale: 1, ease: Quart.easeOut });
      });

      self.initKeyboardNavigation();
      return this;
    },

    /******
     *
     * KEYBOARD NAVIGATION
     *
     *
     */

    initKeyboardNavigation: function() {
      $('body').keydown(function(e) {
        //if (!DM.app.loading) {

        // CHECK IF USER IS INSIDE THE COMMAND FIELD...

        if (DM.app.navigation.isTyping) {
          console.log(e.which);
          DM.app.navigation.doCommandLine(e);
        } else {
          //DO COOL OPERATIONS LIKE ANIMATION SPEEDS ETC.
          if (e.which == 39) {
            // left

            if ($('.js-toggleMainNav').hasClass('showLightbox')) {
              DM.app.lightbox.goNext();
            }
          } else if (e.which == 37) {
            // right
            if ($('.js-toggleMainNav').hasClass('showLightbox')) {
              DM.app.lightbox.goPrev();
            }
          } else if (e.which == 40) {
            // top
          } else if (e.which == 38) {
            // bottom
          } else if (e.which == 16) {
            // SHIFT
            //DM.aniMultiplier = 10;
          } else if (e.which == 78) {
            // N
            /* if($('.js-toggleMainNav').hasClass("show")){
                            DM.app.navigation.hideNav();
                        }else{
                            DM.app.navigation.showNav();
                        }*/
          } else if (e.which == 27) {
            // ESC
            if ($('.js-toggleMainNav').hasClass('showLightbox')) {
              DM.app.lightbox.hideLightbox();
            }
          }
        }

        //}
      });

      $('body').keyup(function(e) {
        //console.log('up again');
        // DM.aniMultiplier = 1;
      });
    },

    shapehelper: function() {
      /* $( ".createPolygon" ).each(function( index ) {
                DM.app.effects.polygonCreater(this);
            });*/
      //DM.app.effects.deleteLines();
      /*$( ".lines" ).each(function( index ) {
                DM.app.effects.createLines($(this));
            });*/
    },

    parallaxhelper: function() {
      //console.log('Parallax helper');
      if (!DM.isAnimating) {
        return;
      }
      if (DM.isMobileScroll) {
        $(DM.scrollEl).stellar({
          hideDistantElements: false,
          scrollProperty: 'transform',
          positionProperty: 'transform',
          horizontalScrolling: false,
          responsive: true
        });
      } else {
        $.stellar({
          hideDistantElements: true,
          horizontalScrolling: false,
          //scrollProperty: 'transform',
          positionProperty: 'transform',
          responsive: true
        });
      }

      $.stellar('refresh');
    },

    waypointhelper: function() {
      if (!DM.isAnimating) {
        return;
      }
      /** Waypoint dynamic helper
       *
       * Add .waypoints to any element and wpTrigger class toa ny subelement to be animated in
       * this function is called after a page transition so new waypoints can be created... (DM.app.routing.afterPageLoadedEffects)
       * this can be extended to your wishes...*/

      //DM.app.scrollcontainer.resetScenes();
      $.each($('.waypoints'), function(index, element) {
        var el = $(element);

        var tween = '';
        if (el.data('fx')) {
          if (el.hasClass('wpTrigger')) {
            tween = TweenMax.staggerFromTo(
              el,
              0.8,
              { opacity: 0, left: '-=10px', force3D: true },
              { opacity: 1, left: '+=10px', scale: 1, ease: Quart.easeOut },
              0.4
            );
          }
          tween = TweenMax.staggerFromTo(
            el.find('.wpTrigger'),
            0.8,
            { opacity: 0, left: '-=10px', force3D: true },
            { opacity: 1, left: '+=10px', scale: 1, ease: Quart.easeOut },
            0.4
          );
        } else {
          if (el.hasClass('wpTrigger') && el.hasClass('moveIn')) {
            tween = TweenMax.fromTo(
              el,
              1,
              { y: '50px', opacity: 0 },
              { y: '0px', force3D: true, opacity: 1, ease: Quart.easeOut }
            );
          } else if (el.hasClass('wpTrigger')) {
            tween = TweenMax.fromTo(
              el,
              0.6,
              { y: '50px', opacity: 0 },
              { force3D: true, y: '0px', opacity: 1, ease: Quart.easeOut }
            );
          } else if (el.hasClass('fxSuckUp')) {
            tween = TweenMax.fromTo(
              el,
              0.6,
              { opacity: 0, y: 200 },
              { opacity: 1, y: 0, ease: Quart.easeInOut }
            );
          } else if (el.hasClass('fxSlideDown')) {
            tween = TweenMax.fromTo(
              el,
              0.6,
              { opacity: 0, y: -50 },
              { opacity: 1, y: 0, ease: Quart.easeInOut }
            );
          } else {
            tween = TweenMax.staggerFromTo(
              el.find('.wpTrigger'),
              0.5,
              { opacity: 0, y: 50 },
              { force3D: true, opacity: 1, y: 0, ease: Quart.easeOut },
              0.1
            );
          }
        }

        var wpScene = new ScrollScene({
          reverse: false,
          triggerElement: el,
          offset: 0,
          duration: 0,
          triggerHook: 0.9
        })
          .setTween(tween)
          .addTo(DM.app.scrollController);
      });

      $.each($('.js-sticky'), function(index, element) {
        var h = $(this)
          .parent()
          .outerHeight();
        var wpScene = new ScrollScene({
          reverse: false,
          offset: -400,
          triggerElement: $(this).parent(),
          duration: h * 2,
          triggerHook: 1
        })
          .setPin($(this), { pushFollowers: false })
          .addTo(DM.app.scrollController)
          .addIndicators();
      });
    },

    createLines: function(el) {
      var id = 'svg_' + Math.round(Math.random() * 10000000);
      var lineColor = '#d2d2d0';
      var circleSize = 8;

      if ($(el).hasClass('dark')) {
        lineColor = '#404140';
      }

      var dHeight = $(document).height();
      var dWidth = $(document).width();

      elHeight = $(el).height();

      $(el).append(
        '<div id="' + id + '" class="svg_lines" data-stellar-ratio="0.9"></div>'
      );
      // Draw Line
      var draw = SVG(id).size('100%', '100%');

      var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
      var upOrDown = Math.random() < 0.5 ? true : false;

      if (upOrDown) {
        var startPoint = Math.floor((Math.random() * elHeight) / 2 + 1);
        var endPoint = Math.floor(
          (Math.random() * elHeight) / 2 + elHeight / 2
        );
      } else {
        var startPoint = Math.floor(
          (Math.random() * elHeight) / 2 + elHeight / 2
        );
        var endPoint = Math.floor((Math.random() * elHeight) / 2 + 1);
      }

      if (endPoint < 0) endPoint = 4;
      if (endPoint > elHeight) endPoint = elHeight - 4;
      draw
        .line(0, startPoint, '100%', endPoint)
        .stroke({ color: lineColor, width: 0.5 });

      // Draw some small dots animating on the line.
      var circleSMtmpl = {
        fill: lineColor
      };
      var circleSM = draw
        .circle(circleSize, circleSize)
        .attr(circleSMtmpl)
        .move(circleSize, startPoint - circleSize);
      //var circleSM2 = draw.circle(12, 12).attr(circleSMtmpl).move(-6, startPoint-(6));
      //var circleSM3 = draw.circle(10, 10).attr(circleSMtmpl).move(-5, startPoint-(5));

      //Animate Dots

      console.log('STARTPOINT: ', startPoint, endPoint);
      DM.app.effects.animateLineObj.push(
        TweenMax.to(circleSM, DM.app.effects.randTime(10, 50), {
          delay: DM.app.effects.randTime(1, 10),
          x: DM.width,
          y: endPoint - 4,
          repeat: -1,
          ease: Linear.easeNone
        })
      );
      // DM.app.effects.animateLineObj.push(TweenMax.to(circleSM2, DM.app.effects.randTime(10,20),{delay:8, x:DM.width, y: endPoint-(6), repeat:-1,ease:Linear.easeNone}));
      //DM.app.effects.animateLineObj.push(TweenMax.to(circleSM3, DM.app.effects.randTime(20,100), {delay:DM.app.effects.randTime(1,10), x:String(DM.width), y: endPoint-(5), repeat:-1,ease:Linear.easeNone}));
    },

    randTime: function(min, max) {
      return Math.floor(Math.random() * max) + min;
    },

    deleteLines: function() {
      $('.lines').each(function(index) {
        $(this)
          .find('.svg_lines')
          .empty();
      });

      TweenMax.killTweensOf($('ellipse'));
    }
  };
});
