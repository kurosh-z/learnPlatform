define([], function() {
  return {
    twIndex: 0,
    twAni: 0,
    twWelcome: [
      'Welcome',
      'Willkommen',
      'Bem-vindo',
      "Servus, Grias'eich!",
      'Bienvenido',
      '美好的一天',
      'مرحبا',
      'Et küt wie et kütt',
      'Prost!',
      'Welcome'
    ], //"< Cheese sandwich menu..."
    isTyping: false,
    nav: 0,
    navTop: 0,
    isLoaded: false, //is the navigation icon shown
    isBreadcrumb: false, // is the breadcrumb shown
    isMenu: false, // is the menu currently active?

    /**
     * Navigation Controller
     *
     * Everything navigation related happens here - tightly integrated with routing as transitions are handled there
     *
     */
    init: function() {
      var self = this;

      this.navTop = { x: 0 };
      this.nav = { x: 0 };

      this.canvas = document.getElementById('navBg');
      this.context = this.canvas.getContext('2d');

      this.$headerWelcome = $('header .header__welcome');

      // Init Typewriter AnimationTimeline
      self.twAni = new TimelineMax({ repeatDelay: 0.1 });

      $('nav.main-nav a').on('tap', function(event) {
        var url = $(this).attr('href');
        DM.app.routing.goPage(url);
        event.preventDefault();
      });

      $('body').on('mouseenter', '.js-toggleMainNav', function(event) {
        DM.app.navigation.animateNavHoverButton(this, true);
      });

      $('body').on('mouseleave', '.js-toggleMainNav', function(event) {
        DM.app.navigation.animateNavHoverButton(this, false);
      });

      $('body').on('mouseleave', '.header__welcome', function(event) {
        DM.app.navigation.hideBreadcrumb();
      });

      $('body').on('tap', '.js-toggleMainNav', function() {
        if ($(this).hasClass('showLightbox')) {
          DM.app.lightbox.hideLightbox();
        } else {
          //                if(!DM.app.navigation.isMenu){

          if ($(this).hasClass('show')) {
            self.hideNav();
          } else {
            self.showNav();
          }
        }
      });

      $('body').on('mouseenter', '.main-nav li a', function() {
        // TweenMax.to($(this).parent(), 0.6, {  color: "#f87085" , ease: Quart.easeOut});
      });

      $('body').on('mouseleave', '.main-nav li a', function() {
        // TweenMax.to($(this).parent(), 0.6, {  color: "#3cc7e7" , ease: Quart.easeOut});
      });

      $('body').on('mouseenter', '.js-toggleMainNav', function() {
        if ($(this).hasClass('showLightbox')) {
        } else {
          if (
            $('#metaData').data('pagetype') == 'projects' ||
            $('#metaData').data('pagetype') == 'blog' ||
            $('#metaData').data('pagetype') == 'services'
          ) {
            if (!DM.app.navigation.isMenu) {
              DM.app.navigation.showBreadcrumbHover();
            }
          }
        }
      });

      $('body').on('mouseleave', '.headerContainer', function() {
        //ONLY ON BLOG AND PROJECT PAGES SHOW BREADCRUMB
        if (
          $('#metaData').data('pagetype') == 'projects' ||
          $('#metaData').data('pagetype') == 'blog' ||
          $('#metaData').data('pagetype') == 'services'
        ) {
          if (!DM.app.navigation.isMenu) {
            DM.app.navigation.hideBreadcrumb();
          }
        }
      });

      $('body').on('mouseenter', '#mask1', function(e) {
        if (DM.app.navigation.isMenu) {
          DM.app.navigation.hideBreadcrumb();
          self.hideNav();
        }
      });

      return this;
    },

    /**
     * Show the Navigation (uses some crazy Rotate and counter rotate dyanmic - prown to bugs - but looks cool
     */
    showNav: function() {
      // self.zoomFx.play();
      if ($('.js-toggleMainNav').hasClass('show')) {
        return;
      }

      DM.app.navigation.hideBreadcrumb();

      DM.app.videoPause();
      DM.app.navigation.isMenu = true;
      $('.js-toggleMainNav').addClass('show');

      var aniSpeed = 0.2 * DM.aniMultiplier;

      var offset = '100px';
      if (DM.isMobile || DM.isTablet) {
        var offset = '0px';
      }

      $('#maskBlack').on('click', function(e) {
        DM.app.navigation.hideNav();
      });

      DM.app.navigation.tl = new TimelineMax({
        onStart: function() {
          DM.app.navigation.animateNavCloseButton(true);
        },
        onComplete: function() {},
        onReverseComplete: function() {
          $('#realSpace').off();
          DM.app.navigation.animateNavCloseButton(false);
          DM.app.navigation.isMenu = false;
          $('.js-toggleMainNav').removeClass('show');

          if ($('body').hasClass('homepage')) {
            DM.app.navigation.doWelcomeTyper();
          }
        }
      })
        .fromTo(
          this.nav,
          aniSpeed,
          { x: 0 },
          {
            x: 320,
            ease: Quart.easeInOut,
            delay: 0,
            onComplete: function() {}
          },
          'navOut'
        )
        .fromTo(
          this.navTop,
          aniSpeed * 2.2,
          { x: 0 },
          {
            x: 500,
            ease: Quart.easeInOut,
            delay: 0,
            onUpdate: $.proxy(this.animateNavBg, this)
          },
          'navOut'
        )

        .fromTo(
          $('#spaceNav'),
          aniSpeed,
          { display: 'none' },
          { display: 'block' },
          'navOut'
        )
        .staggerFromTo(
          $('.main-nav li'),
          1,
          { x: '55px', opacity: 0 },
          { x: '85px', opacity: 1, ease: Quint.easeInOut },
          0.03 * DM.aniMultiplier,
          'navOut-=0.2'
        );

      TweenMax.fromTo(
        $('#mask1'),
        1,
        { x: '0px' },
        { x: offset, ease: Quint.easeInOut }
      );
    },

    /**
     * Hide Navigation and show current page again.
     */
    hideNav: function(isTransition) {
      $('#maskBlack').off();
      if (isTransition) {
        //DM.app.navigation.updateTypewriter();
        DM.app.navigation.stopTypewriter();
      } else {
        DM.app.videoPlay();
        TweenMax.to($('#mask1'), 1, { x: '0px', ease: Quint.easeInOut });
      }

      if (isTransition) {
        var aniSpeed = 2.5 * DM.aniMultiplier;
      } else {
        var aniSpeed = 1.2 * DM.aniMultiplier;
      }
      DM.app.navigation.tl.timeScale(aniSpeed);
      DM.app.navigation.tl.reverse();
    },

    /**
     * Command line functionality, type and do commands!
     * @param e
     */
    doCommandLine: function(e) {
      char = String.fromCharCode(e.which).toLowerCase();
      var cmd = $('.js-headerWelcomeTxt .typewriter')
        .html()
        .toLowerCase();
      if (e.which == 8) {
        var char = cmd.substring(0, cmd.length - 1);
        $('.js-headerWelcomeTxt .typewriter').html(char);
      } else if (e.which == 13) {
        if (cmd == 'help') {
          alert('Some help or not?');
        } else if (cmd == 'facebook') {
          window.open(
            'http://de-de.facebook.com/demodern',
            '_blank' //
          );
        } else if (cmd == 'contact') {
          window.location = '/contact';
        } else {
        }
        DM.app.navigation.stopTypewriter();
      } else {
        $('.js-headerWelcomeTxt .typewriter').append(char);
      }
      e.preventDefault();
    },

    /**
     * Init Typewritter effect next to navigation
     */
    doWelcomeTyper: function() {
      $('header .typewriter-cursor, header .typewriter_container').show();
      $('header .breadcrumb_container').hide();
      DM.app.navigation.isBreadcrumb = true;
      $('header .header__welcome').addClass('isTyping');
      $('.js-headerWelcomeTxt .typewriter').on('click', function(event) {
        DM.app.navigation.stopTypewriter();
        DM.app.navigation.twIndex = DM.app.navigation.twWelcome.length;
        DM.app.navigation.isTyping = true;
        event.preventDefault();
        event.stopPropagation();
      });

      doNextWord(DM.app.navigation.twIndex, true);
      DM.app.navigation.twAni.to('.js-headerWelcomeTxt .typewriter', 1, {
        text: ''
      });
      TweenMax.to($('.js-headerWelcomeTxt .typewriter'), 0.6, {
        x: '0px',
        ease: Quint.easeOut
      });

      //Internal function which types the next word.
      function doNextWord(index, doYoyo) {
        var doRepeat = doYoyo ? 1 : 0;
        $('.js-headerWelcomeTxt .typewriter').html(' ');
        DM.app.navigation.twAni
          .play()
          .to('.js-headerWelcomeTxt .typewriter', 1, {
            text: DM.app.navigation.twWelcome[index],
            repeat: doRepeat,
            yoyo: doYoyo,
            onRepeat: function() {
              DM.app.navigation.twIndex = DM.app.navigation.twIndex + 1;
              if (
                DM.app.navigation.twIndex < DM.app.navigation.twWelcome.length
              ) {
                var yoyo =
                  DM.app.navigation.twIndex ==
                  DM.app.navigation.twWelcome.length - 1
                    ? false
                    : true;
                doNextWord(DM.app.navigation.twIndex, yoyo);
              }
            },
            onComplete: function() {
              if (
                DM.app.navigation.twIndex ==
                DM.app.navigation.twWelcome.length - 1
              ) {
                $('header .typewriter-cursor').hide();
              }
            }
          });
      }
    },

    /**
     * Updates the Typewriter effcect to sho the history and breadcrumb in the top corner or the welcome text.
     */
    updateTypewriter: function() {
      DM.app.navigation.stopTypewriter();

      if (DM.isMobile) {
        return;
      }

      $('header .header__welcome').removeClass('isTyping');
      DM.app.navigation.isBreadcrumb = true;

      var breadcrumb = '';
      var curVal = '';
      var home = '';

      // Lets change this depending on the section (this could also be appended into <body> and edited via CRAFT CMS! (yea cool!)

      if ($('#metaData').data('pagetype') == 'projects') {
        var title = $('article.case').data('title');
        if ($('html').attr('lang') == 'de') {
          breadcrumb =
            home +
            '<span class="expander"><a href="' +
            DM.relativeSiteUrl +
            '/projekte">Projekte<i class="fa fa-chevron-right"></i></a></span>';
        } else {
          breadcrumb =
            home +
            '<span class="expander"><a href="' +
            DM.relativeSiteUrl +
            '/projects">Projects<i class="fa fa-chevron-right"></i></a></span>';
        }
        curVal = title;
      } else if ($('#metaData').data('pagetype') == 'blog') {
        var title = $('.blog-article').data('title');
        breadcrumb =
          home +
          '<span class="expander"><a href="' +
          DM.relativeSiteUrl +
          '/blog">Blog<i class="fa fa-chevron-right"></i></a></span>';
        curVal = title;
      } else if ($('#metaData').data('pagetype') == 'services') {
        var title = $('.header .intro-content h1').html();
        if ($('html').attr('lang') == 'de') {
          breadcrumb =
            home +
            '<span class="expander"><a href="' +
            DM.relativeSiteUrl +
            '/services">Services<i class="fa fa-chevron-right"></i></a></span>';
        } else {
          breadcrumb =
            home +
            '<span class="expander"><a href="' +
            DM.relativeSiteUrl +
            '/services">Services<i class="fa fa-chevron-right"></i></a></span>';
        }
        curVal = title;
      } else if ($('body').hasClass('homepage')) {
        DM.app.navigation.doWelcomeTyper();
        return;
      } else {
        breadcrumb = '';
      }

      if (breadcrumb != '') {
        $('header .breadcrumb_container').show();
        breadcrumb =
          breadcrumb + '<span class="currentBreadcrumb">' + curVal + '</span>';
        $('.js-headerWelcomeTxt .breadcrumb').html(breadcrumb);
        var offsetX = $('.js-headerWelcomeTxt .breadcrumb-container').width();
        TweenMax.set($('.js-headerWelcomeTxt .breadcrumb'), {
          x: offsetX + 'px'
        });
      }

      //$('.js-headerWelcomeTxt .breadcrumb').data('left', $('.js-headerWelcomeTxt .typewriter .current').position().left);
    },

    /**
     * Stop Typewriter animation
     */
    stopTypewriter: function() {
      this.$headerWelcome.removeClass('isTyping');
      /*DM.app.navigation.twAni.play().to(".js-headerWelcomeTxt .typewriter", 0, {text:'', onComplete: function(){
                   //({display:'none'});//('isTyping');
            }});*/
      $('header .typewriter_container').hide();
      DM.app.navigation.twAni.stop();
    },

    /**
     * Hide the breadcrumb completly
     */
    hideBreadcrumb: function() {
      DM.app.navigation.isBreadcrumb = false;
      DM.app.navigation.stopTypewriter();
      // $('header .header__welcome').css({'overflow':'hidden'});
      var width = ($('.js-headerWelcomeTxt .breadcrumb').width() + 30) * -1;
      TweenMax.to($('.js-headerWelcomeTxt .breadcrumb'), 0.6, {
        x: width + 'px',
        ease: Quint.easeOut,
        onComplete: function() {
          $('header .breadcrumb_container').hide();
        }
      });
    },

    /**
     * Animates the breadcrumb to reveal the history
     */
    showBreadcrumbHover: function() {
      if (DM.isMobile) {
        return;
      }
      DM.app.navigation.isBreadcrumb = true;
      $('header .breadcrumb_container').show();
      TweenMax.to($('.js-headerWelcomeTxt .breadcrumb'), 0.6, {
        x: '0px',
        ease: Quint.easeOut
      });
    },

    /**
     * Hamburger icon events
     * - animate on page load
     * - toggles main navigation
     */
    animateNavIn: function() {
      var self = this;
      if (!DM.app.navigation.isLoaded) {
        DM.app.navigation.isLoaded = true;
      } else {
        return;
      }
      TweenMax.fromTo(
        '.js-toggleMainNav .top',
        0.5,
        { display: 'block', left: '-150px' },
        { left: 0, ease: Quart.easeOut },
        0.1
      );
      TweenMax.fromTo(
        '.js-toggleMainNav .middle',
        0.7,
        { display: 'block', left: '-150px' },
        { left: 0, ease: Quart.easeOut },
        0.1
      );
      TweenMax.fromTo(
        '.js-toggleMainNav .bottom',
        0.8,
        { display: 'block', left: '-150px' },
        {
          left: 0,
          ease: Quart.easeOut,
          onComplete: function() {
            DM.app.navigation.updateTypewriter();
          }
        }
      );
    },

    /**
     * Animates the Nav Canvas element
     */
    animateNavBg: function() {
      var newH = $(window).height();
      this.canvas.width = this.canvas.width;
      this.canvas.height = newH;
      this.context.fillStyle = '#1a1c1a';
      this.context.beginPath();
      this.context.moveTo(0, 0);
      this.context.lineTo(this.navTop.x, 0);
      this.context.lineTo(this.nav.x, newH);
      this.context.lineTo(0, newH);
      this.context.closePath();
      this.context.fill();
    },

    /**
     * Animation for Nav Burger
     * @param open
     */
    animateNavCloseButton: function(open) {
      var aniSpeed = 0.2 * DM.aniMultiplier;
      if (open) {
        /** Make a X Button **/
        var tl = new TimelineLite();
        tl.to(
          $(
            '.navigation__toggle .top, .navigation__toggle .middle, .navigation__toggle .bottom'
          ),
          aniSpeed,
          { top: '7px', ease: Quart.easeOut },
          'merge'
        );
        tl.to(
          $('.navigation__toggle .top'),
          aniSpeed,
          { rotationZ: -45, ease: Quart.easeOut },
          'rotate'
        );
        tl.to(
          $('.navigation__toggle .bottom'),
          aniSpeed,
          { rotationZ: 45, ease: Quart.easeOut },
          'rotate'
        );
        tl.to(
          $('.navigation__toggle .middle'),
          aniSpeed,
          { rotationZ: -45, display: 'none', ease: Quart.easeOut },
          'rotate'
        );
      } else {
        /** Make the 3 Lines - default burger **/
        var tl = new TimelineLite();
        tl.to(
          $(
            '.navigation__toggle .top, .navigation__toggle .bottom, .navigation__toggle .middle'
          ),
          aniSpeed,
          { rotationZ: 0, width: '100%', ease: Quart.easeOut },
          'rotate'
        );
        tl.to(
          $('.navigation__toggle .top'),
          aniSpeed,
          { top: '0px', width: '100%', ease: Quart.easeOut },
          'merge'
        );
        tl.to(
          $('.navigation__toggle .middle'),
          aniSpeed,
          { top: '7px', width: '100%', display: 'block', ease: Quart.easeOut },
          'merge'
        );
        tl.to(
          $('.navigation__toggle .bottom'),
          aniSpeed,
          { top: '14px', width: '100%', ease: Quart.easeOut },
          'merge'
        );
      }
    },

    /**
     * Animate Burger on Hover (differences between back, and simple whooble animation
     * @param hoverIn
     */
    animateNavHoverButton: function(el, hoverIn) {
      if (hoverIn) {
        var aniSpeed = 0.1 * DM.aniMultiplier;
        if ($(el).hasClass('show') && $(el).hasClass('showLightbox')) {
          /** Make a Back Arrow **/
          // Make no Back Arrow !
          /*var tl = new TimelineLite();
                    tl.to($(".navigation__toggle .top"), aniSpeed, {top:'5px', width:'60%',ease: Quart.easeOut},"hover");
                    tl.to($(".navigation__toggle .bottom"), aniSpeed, {top:'14px',width:'60%',ease: Quart.easeOut},"hover");
                    tl.to($(".navigation__toggle .middle"), aniSpeed, {width:'0%', display:'none',ease: Quart.easeOut},"hover");
                    */
        } else if (!$(el).hasClass('show')) {
          /** Make the Whooble **/
          // Make no WHOBBLE!
          //var tl = new TimelineLite();
          //tl.to($(".navigation__toggle .top"), aniSpeed, {top:'-3px',width:'100%',ease: Quart.easeOut},"hover");
          //tl.to($(".navigation__toggle .bottom"), aniSpeed, {top:'17px', width:'100%',ease: Quart.easeOut},"hover");
        }
      } else {
        var aniSpeed = 0.1 * DM.aniMultiplier;
        if ($(el).hasClass('show')) {
          /** Make the X again **/
          var tl = new TimelineLite();
          tl.to(
            $('.navigation__toggle .top'),
            aniSpeed,
            { top: '7px', width: '100%', ease: Quart.easeOut },
            'hover'
          );
          tl.to(
            $('.navigation__toggle .bottom'),
            aniSpeed,
            { top: '7px', width: '100%', ease: Quart.easeOut },
            'hover'
          );
          tl.to(
            $('.navigation__toggle .middle'),
            aniSpeed,
            { top: '7px', width: '100%', display: 'none', ease: Quart.easeOut },
            'hover'
          );
        } else {
          /** Make the 3 Lines (standart burger **/
          var tl = new TimelineLite();
          tl.to(
            $('.navigation__toggle .top'),
            aniSpeed,
            { rotationZ: 0, top: '0px', width: '100%', ease: Quart.easeOut },
            'hover'
          );
          tl.to(
            $('.navigation__toggle .middle'),
            aniSpeed,
            {
              rotationZ: 0,
              top: '7px',
              width: '100%',
              display: 'block',
              ease: Quart.easeOut
            },
            'hover'
          );
          tl.to(
            $('.navigation__toggle .bottom'),
            aniSpeed,
            { rotationZ: 0, top: '14px', width: '100%', ease: Quart.easeOut },
            'hover'
          );
        }
      }
    }
  };
});
