/*
 * jQuery.plainModal
 * https://anseki.github.io/jquery-plainmodal/
 *
 * Copyright (c) 2017 anseki
 * Licensed under the MIT license.
 */

;(function($) { // eslint-disable-line no-extra-semi
  'use strict';

  var APP_NAME = 'plainModal',
    APP_PREFIX = APP_NAME.toLowerCase(),

    /* eslint-disable no-multi-spaces */
    EVENT_TYPE_OPEN         = APP_PREFIX + 'open',
    EVENT_TYPE_CLOSE        = APP_PREFIX + 'close',
    EVENT_TYPE_BEFOREOPEN   = APP_PREFIX + 'beforeopen',
    EVENT_TYPE_BEFORECLOSE  = APP_PREFIX + 'beforeclose',
    /* eslint-enable no-multi-spaces */

    DEFAULT_OPTIONS = {
      /* eslint-disable key-spacing */
      duration:       200,
      effect:         {open: $.fn.fadeIn, close: $.fn.fadeOut},
      overlay:        {opacity: 0.6, zIndex: 9000},
      fixOverlay:     false,
      offset:         void 0,
      zIndex:         0, // set, after
      closeClass:     APP_PREFIX + '-close',
      force:          false,
      child:          void 0
      // Optional: open, close, beforeopen, beforeclose
      /* eslint-enable key-spacing */
    },

    undef,
    init, modalOpen, modalClose,
    jqOpened = null, // null: Not opened, 0: In effect
    lockAction, jqNextOpen, jqInEffect, inOpenEffect,
    jqWin, jqBody, jqOverlay, jqOverlayBlur, jqActive, jq1st,
    bodyStyles, winScroll, blurSync;

  /* @this jQuery */
  function setCenter() {
    /*
    var
      cssProp = {},
      cur = this.data(APP_NAME + '-cur') || {}, // .data(APP_NAME) is shared
      lastWidth = cur.width,
      lastHeight = cur.height,
      width = this.outerWidth(),
      height = this.outerHeight();
    if (width === lastWidth && height === lastHeight) { return; }
    if (lastWidth == null || lastHeight == null) { // first time
      cssProp.left = cssProp.top = '50%';
    }
    cssProp.marginLeft = '-' + (width / 2) + 'px';
    cssProp.marginTop = '-' + (height / 2) + 'px';
    this.css(cssProp).data(APP_NAME + '-cur', {width: width, height: height});
    */

    /*
      The way of the positioning may be changed always.
      Then set CSS properties everytime.
    */

    this.css({
      left: '50%',
      top: '50%',
      marginLeft: '-' + (this.outerWidth() / 2) + 'px',
      marginTop: '-' + (this.outerHeight() / 2) + 'px'
    });
  }

  function callOffset(jq, options) {
    var offset;
    options = options || jq.data(APP_NAME);
    if (typeof options.offset === 'function' &&
        (offset = options.offset.call(jq))) {
      jq.css({left: offset.left, top: offset.top, marginLeft: '', marginTop: ''});
    }
  }

  function insSetOffset(newValue, jq, options) {
    var props;
    if (!newValue) {
      newValue = setCenter;
    } else if (typeof newValue === 'function') {
      newValue = (function(org) { // wrap with setCenter
        return /* @this jQuery */ function() {
          var that = this; // specified by caller.
          return org.call(that, function() { setCenter.call(that); });
        };
      })(newValue);
    }
    if (jq && typeof newValue !== 'function' &&
      (!options || typeof options.offset === 'function' ||
        options.offset.left !== newValue.left || options.offset.top !== newValue.top)) {
      props = jq.jquery ? {} : jq; // for init
      props.left = newValue.left;
      props.top = newValue.top;
      props.marginLeft = props.marginTop = ''; // for change
      if (jq.jquery) { jq.css(props); }
    }
    if (options) {
      options.offset = newValue;
      if (jq && jqOpened && jq.get(0) === jqOpened.get(0)) { callOffset(jq, options); }
    }
  }

  function insSetCloseClass(newValue, jq, options) {
    if (jq && options && options.closeClass && options.closeClass !== newValue) {
      jq.find('.' + options.closeClass).off('click', modalClose);
    }
    if (jq && newValue && (!options || options.closeClass !== newValue)) {
      jq.find('.' + newValue).off('click', modalClose).click(modalClose);
    }
    if (options) { options.closeClass = newValue; }
  }

  function modalBlur(jq, on, duration, complete) {
    var jqTarget = jq.length ? jq.eq(0) : null, // only 1st
      opt;

    function blendOpacity(val) {
      jqOverlay.css('opacity', (1 - opt.overlay.opacity) / (1 - val) * -1 + 1);
    }

    if (!jqTarget || !(opt = jqTarget.data(APP_NAME))) { return undef; }
    if (on == null) { on = true; }
    duration = duration || opt.duration;
    jqOverlayBlur = jqOverlayBlur || jqOverlay.clone(true).appendTo(jqBody);

    jqOverlay.stop(true).css({
      /* eslint-disable key-spacing */
      backgroundColor:    opt.overlay.fillColor,
      zIndex:             opt.overlay.zIndex
      /* eslint-enable key-spacing */
    });
    jqOverlayBlur.stop(true).css({
      /* eslint-disable key-spacing */
      backgroundColor:    opt.overlay.fillColor,
      zIndex:             opt.zIndex // same as modal
      /* eslint-enable key-spacing */
    }).insertAfter(jqTarget);

    if (on) {
      jqOverlay.css({
        /* eslint-disable key-spacing */
        opacity:            opt.overlay.opacity,
        display:            'block'
        /* eslint-enable key-spacing */
      });
      jqOverlayBlur.css({
        /* eslint-disable key-spacing */
        opacity:            0,
        display:            'block'
        /* eslint-enable key-spacing */
      }).animate({opacity: opt.overlay.opacity}, {
        duration: duration,
        step: blendOpacity,
        complete: function() {
          jqOverlay.css('display', 'none');
          if (complete) { complete(); }
        }
      });
    } else {
      jqOverlay.css({
        /* eslint-disable key-spacing */
        opacity:            0,
        display:            'block'
        /* eslint-enable key-spacing */
      });
      jqOverlayBlur.css({
        /* eslint-disable key-spacing */
        opacity:            opt.overlay.opacity,
        display:            'block'
        /* eslint-enable key-spacing */
      }).animate({opacity: 0}, {
        duration: duration,
        step: blendOpacity,
        complete: function() {
          jqOverlayBlur.css('display', 'none');
          if (complete) { complete(); }
        }
      });
    }
    return jq;
  }

  function avoidScroll(e) {
    if (winScroll) { jqWin.scrollLeft(winScroll.left).scrollTop(winScroll.top); }
    e.preventDefault();
    return false;
  }

  function insSetZIndex(newValue, jq, options) {
    if (jq && (!options || options.zIndex !== newValue)) {
      jq.css('zIndex', newValue);
    }
    if (options) { options.zIndex = newValue; }
  }

  function setOption(jq, name, newValue) {

    function setEachOption(jq, name, newValue) {
      var opt = jq.data(APP_NAME) || init(jq).data(APP_NAME);
      if (!DEFAULT_OPTIONS.hasOwnProperty(name)) { return undef; }
      if (arguments.length === 3) {
        switch (name) {
          /* eslint-disable no-multi-spaces */
          case 'offset':      insSetOffset(newValue, jq, opt); break;
          case 'zIndex':      insSetZIndex(newValue, jq, opt); break;
          case 'closeClass':  insSetCloseClass(newValue, jq, opt); break;
          default: opt[name] = newValue;
          /* eslint-enable no-multi-spaces */
        }
      }
      return opt[name];
    }

    return arguments.length === 2 && typeof name === 'string' ?
        (jq.length ? setEachOption(jq.eq(0), name) : void 0) : // Get
      jq.each(typeof name === 'string' ?
        /* @this jQuery */
        function() { setEachOption($(this), name, newValue); } : // one prop
        /* @this jQuery */
        function() { // multiple props
          var that = $(this);
          $.each(name, function(name, newValue) { setEachOption(that, name, newValue); });
        });
  }

  init = function(jq, options) {
    var opt = $.extend(true, {}, DEFAULT_OPTIONS, options);
    opt.overlay.fillColor = opt.overlay.fillColor || opt.overlay.color /* alias */ || '#888';
    opt.zIndex = opt.zIndex || opt.overlay.zIndex + 1;
    insSetOffset(opt.offset, void 0, opt);

    if (!jqWin) { // page init
      jqWin = $(window).resize(function() {
        if (jqInEffect) { jqInEffect.stop(true, true); }
        jqOverlay.stop(true, true);
        if (jqOverlayBlur) { jqOverlayBlur.stop(true, true); }
        if (jqOpened) { callOffset(jqOpened); }
        if (blurSync) { callOffset(blurSync.parent); }
      });

      jqOverlay = $('<div class="' + APP_PREFIX + '-overlay" />').css({
        /* eslint-disable key-spacing */
        position:       'fixed',
        left:           0,
        top:            0,
        width:          '100%',
        height:         '150%', // for address bar of touch devices
        display:        'none'
        /* eslint-enable key-spacing */
      }).appendTo(jqBody = $('body')).click(modalClose)
        .on('touchmove', function() { return false; }); // avoid scroll on touch devices

      $(document).focusin(function(e) {
        if (jqOpened && !jqOpened.has(e.target).length) {
          if (jq1st) {
            jq1st.focus();
          } else {
            $(document.activeElement).blur();
          }
        }
      }).keydown(function(e) {
        if (jqOpened && e.keyCode === 27) { // Escape key
          return modalClose(e);
        }
        return null;
      });
    }

    return jq.each(/* @this HTMLElement */ function() {
      var that = $(this),
        cssProp = {
          /* eslint-disable key-spacing */
          position:       'fixed',
          display:        'none',
          zIndex:         opt.zIndex
          /* eslint-enable key-spacing */
        };
      insSetOffset(opt.offset, cssProp);
      insSetCloseClass(opt.closeClass, that);
      // events
      $.each([['open', EVENT_TYPE_OPEN],
          ['close', EVENT_TYPE_CLOSE],
          ['beforeopen', EVENT_TYPE_BEFOREOPEN],
          ['beforeclose', EVENT_TYPE_BEFORECLOSE]], function(i, elm) {
        var optName = elm[0], type = elm[1];
        if (typeof opt[optName] === 'function') { that.off(type, opt[optName]).on(type, opt[optName]); }
      });
      that.css(cssProp).data(APP_NAME, $.extend(true, {}, opt)).appendTo(jqBody)
        .on('touchmove', function() { return false; }); // avoid scroll on touch devices
    });
  };

  modalOpen = function(jq, options, forceAction) { // only 1st in jq
    var jqTarget = jq.length ? jq.eq(0) : void 0,
      opt, event, cancelable, isParent, isChild, fixWin,
      startNextOpen, inlineStyles, calMarginR, calMarginB;

    function complete() {
      var event;
      jqTarget.find('a,input,select,textarea,button,object,area,img,map').each(/* @this HTMLElement */ function() {
        var that = $(this);
        if (that.focus().get(0) === document.activeElement) { // Can focus
          jq1st = that;
          return false;
        }
        return true;
      });
      if (isParent && blurSync.jqActive && blurSync.jqActive.length) { blurSync.jqActive.focus(); }

      jqInEffect = null;
      jqOpened = jqTarget;
      lockAction = false;

      // Event: open
      event = $.Event(EVENT_TYPE_OPEN); // eslint-disable-line new-cap
      if (isParent) {
        event.from = blurSync.child;
        blurSync = null; // set before trigger()
      } else if (isChild) {
        event.isChild = true;
      }
      jqTarget.trigger(event);
    }

    function isMyParent(jq) {
      var opt = jq.data(APP_NAME);
      return opt.child && opt.child.index(jqTarget) > -1;
    }

    if (jqTarget) {
      if (options || !(opt = jqTarget.data(APP_NAME))) {
        opt = init(jqTarget, options).data(APP_NAME);
      }

      if (!jqNextOpen && !blurSync && jqInEffect &&
          (!inOpenEffect || jqInEffect.get(0) !== jqTarget.get(0)) &&
          (opt.force/* || isMyParent(jqInEffect)*/)) {
        // Another in effect now (open/close). Fix status immediately.
        jqInEffect.stop(true, true);
        jqOverlay.stop(true, true);
      }
      if (lockAction && !forceAction) { return jq; }

      if (!jqNextOpen && !blurSync && jqOpened && jqOpened.get(0) !== jqTarget.get(0)) {
        if (opt.force) {
          startNextOpen = true;
        } else if (isMyParent(jqOpened)) {
          blurSync = {
            parent: jqOpened,
            child: jqTarget.insertAfter(jqOpened),
            jqActive: $(document.activeElement).blur() // Save to return to parent.
          };
          startNextOpen = true;
        }
        if (startNextOpen) {
          jqNextOpen = jqTarget;
          modalClose(jqOpened);
          return jq;
        }
      }

      if (jqOpened === null) {
        lockAction = true;
        if (blurSync) {
          isParent = jqTarget.get(0) === blurSync.parent.get(0);
          isChild = jqTarget.get(0) === blurSync.child.get(0);
        }

        // Event: beforeopen
        cancelable = !jqNextOpen && !blurSync;
        event = $.Event(EVENT_TYPE_BEFOREOPEN, {cancelable: cancelable}); // eslint-disable-line new-cap
        if (isParent) {
          event.from = blurSync.child;
        } else if (isChild) {
          event.isChild = true;
        }
        jqTarget.trigger(event);
        // jQuery doesn't support `cancelable`.
        if (!cancelable || !event.isDefaultPrevented()) {
          fixWin = !jqNextOpen && !blurSync && !opt.fixOverlay;
          if (fixWin) {
            if (!bodyStyles) {
              inlineStyles = jqBody.get(0).style;
              bodyStyles = {overflow: inlineStyles.overflow};
              calMarginR = jqBody.prop('clientWidth');
              calMarginB = jqBody.prop('clientHeight');
              jqBody.css('overflow', 'hidden');
              calMarginR -= jqBody.prop('clientWidth');
              calMarginB -= jqBody.prop('clientHeight');
              bodyStyles.marginRight = inlineStyles.marginRight;
              bodyStyles.marginBottom = inlineStyles.marginBottom;
              if (calMarginR < 0) { jqBody.css('marginRight', '+=' + (-calMarginR)); }
              if (calMarginB < 0) { jqBody.css('marginBottom', '+=' + (-calMarginB)); }
            }
            jqActive = $(document.activeElement).blur();
            if (!winScroll) {
              winScroll = {left: jqWin.scrollLeft(), top: jqWin.scrollTop()};
              jqWin.scroll(avoidScroll);
            }
          }
          jq1st = null;

          callOffset(jqTarget, opt);
          // Add callback to the queue absolutely without depending on the effect.
          window.setTimeout(function() {
            if (isParent) {
              complete(); // skip effect
            } else {
              inOpenEffect = true;
              opt.effect.open.call((jqInEffect = jqTarget), opt.duration, complete);
              if (isChild) { modalBlur(blurSync.parent, true, opt.duration); }
            }
          }, 0);
          // Check blurSync for re-open parent.
          if (fixWin) {
            jqOverlay.css({ // Re-Style the overlay that is shared by all 'opt'.
              /* eslint-disable key-spacing */
              backgroundColor:    opt.overlay.fillColor,
              zIndex:             opt.overlay.zIndex
              /* eslint-enable key-spacing */
            }).fadeTo(opt.duration, opt.overlay.opacity);
          }
          jqOpened = 0;
        } else {
          lockAction = false;
        }
      }
    }
    return jq;
  };

  modalClose = function(jq) { // jq: target/event
    var jqTarget, opt, event, cancelable, isParent, isChild, fixWin,
      isEvent = jq instanceof $.Event, duration;

    function complete() {
      var event;
      if (fixWin) {
        if (bodyStyles) {
          jqBody.css(bodyStyles);
          bodyStyles = null;
        }
        if (jqActive && jqActive.length) { jqActive.focus(); } // before scroll
        if (winScroll) {
          jqWin.off('scroll', avoidScroll)
            .scrollLeft(winScroll.left).scrollTop(winScroll.top);
          winScroll = null;
        }
      }

      jqInEffect = null;
      jqOpened = null;
      if (!jqNextOpen && !isChild) { lockAction = false; }

      // Event: close
      event = $.Event(EVENT_TYPE_CLOSE); // eslint-disable-line new-cap
      if (isEvent) {
        event.from = jq;
      } else if (jqNextOpen) {
        event.from = jqNextOpen;
      }
      if (isChild) { event.isChild = true; }
      jqTarget.trigger(event);

      if (jqNextOpen) {
        modalOpen(jqNextOpen, null, true);
        // reset before open#complete
        jqNextOpen = null;
      } else if (isChild) {
        modalOpen(blurSync.parent, null, true);
      }
    }

    if (!lockAction && jqOpened) {
      jqTarget = isEvent || jq.index(jqOpened) > -1 ? jqOpened : null; // jqOpened in jq
      if (jqTarget) {
        lockAction = true;
        if (blurSync) {
          isParent = jqTarget.get(0) === blurSync.parent.get(0);
          isChild = jqTarget.get(0) === blurSync.child.get(0);
        }

        // Event: beforeclose
        cancelable = true;
        event = $.Event(EVENT_TYPE_BEFORECLOSE, {cancelable: cancelable}); // eslint-disable-line new-cap
        if (isEvent) {
          event.from = jq;
        } else if (jqNextOpen) {
          event.from = jqNextOpen;
        }
        if (isChild) { event.isChild = true; }
        jqTarget.trigger(event);
        // jQuery doesn't support `cancelable`.
        if (!cancelable || !event.isDefaultPrevented()) {
          opt = jqTarget.data(APP_NAME);
          fixWin = !jqNextOpen && !blurSync && !opt.fixOverlay;
          duration = jqNextOpen ? 0 : opt.duration;

          // Add callback to the queue absolutely without depending on the effect.
          window.setTimeout(function() {
            if (isParent) {
              complete(); // skip effect
            } else {
              inOpenEffect = false;
              opt.effect.close.call((jqInEffect = jqTarget), duration, complete);
              if (isChild) { modalBlur(blurSync.parent, false, opt.duration); }
            }
          }, 0);
          // Check blurSync for closing child.
          if (fixWin) { jqOverlay.fadeOut(duration); }
          jqOpened = 0;
        } else { // Cancel
          lockAction = false;
          jqNextOpen = null;
          if (isParent) { blurSync = null; }
        }
      }
    }
    if (isEvent) { jq.preventDefault(); return false; }
    return jq;
  };

  $.fn[APP_NAME] = function(action, arg1, arg2, arg3) {
    /* eslint-disable no-multi-spaces */
    return (
      action === 'open' ?   modalOpen(this, arg1) :
      action === 'close' ?  modalClose(this) :
      action === 'blur' ?   modalBlur(this, arg1, arg2, arg3) :
      action === 'option' ? (arguments.length <= 2 ?  setOption(this, arg1) :
                                                      setOption(this, arg1, arg2)) :
                            init(this, action)); // action = options.
    /* eslint-enable no-multi-spaces */
  };

})(jQuery);
