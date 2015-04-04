/*
 * jQuery.plainModal
 * https://github.com/anseki/jquery-plainmodal
 *
 * Copyright (c) 2015 anseki
 * Licensed under the MIT license.
 */

;(function($, undefined) {
'use strict';

var APP_NAME = 'plainModal',
    APP_PREFIX = APP_NAME.toLowerCase(),

    EVENT_TYPE_OPEN         = APP_PREFIX + 'open',
    EVENT_TYPE_CLOSE        = APP_PREFIX + 'close',
    EVENT_TYPE_BEFOREOPEN   = APP_PREFIX + 'beforeopen',
    EVENT_TYPE_BEFORECLOSE  = APP_PREFIX + 'beforeclose',

    /*
      jqOpened === null : Not opened
      jqOpened === 0    : Fading now
    */
    jqOpened = null,

    lockAction, jqNextOpen, jqFading,
    jqWin, jqBody, jqOverlay, jqActive, jq1st,
    orgOverflow, orgMarginR, orgMarginB,
    winLeft, winTop;

function init(jq, options) {
  // The options object is shared by all elements in jq.
  // Therefore, don't change properties later. (Replace options object for new object.)
  var opt = $.extend(true, {
        duration:       200,
        effect:         {open: $.fn.fadeIn, close: $.fn.fadeOut},
        overlay:        {opacity: 0.6, zIndex: 9000},
        closeClass:     APP_PREFIX + '-close'
        // Optional: offset, open, close
      }, options);
  opt.overlay.fillColor = opt.overlay.fillColor || opt.overlay.color /* alias */ || '#888';
  opt.zIndex = opt.zIndex || opt.overlay.zIndex + 1;

  if (!jqWin) { // page init
    jqWin = $(window);
    jqOverlay = $('<div class="' + APP_PREFIX + '-overlay" />').css({
      position:       'fixed',
      left:           0,
      top:            0,
      width:          '100%',
      height:         '150%', // for address bar of touch devices
      display:        'none'
    }).appendTo(jqBody = $('body')).click(modalClose)
      .on('touchmove', function() { return false; }); // avoid scroll on touch devices
    $(document).focusin(function(e) {
      if (jqOpened && !jqOpened.has(e.target).length) {
        if (jq1st) { jq1st.focus(); }
        else { $(document.activeElement).blur(); }
      }
    })
    .keydown(function(e) {
      if (jqOpened && e.keyCode === 27) { // Escape key
        return modalClose(e);
      }
    });
  }

  return jq.each(function() {
    var that = $(this),
        cssProp = {
          position:       'fixed',
          display:        'none',
          zIndex:         opt.zIndex
        };

    if (opt.offset) {
      if (typeof opt.offset === 'function') {
        opt.offset = (function(org) { // wrap with setCenter
          return function() {
            var that = this; // specified by caller.
            return org.call(that, function() { setCenter.call(that); });
          };
        })(opt.offset);
      } else { // static
        cssProp.left = opt.offset.left;
        cssProp.top = opt.offset.top;
        cssProp.marginLeft = cssProp.marginTop = ''; // for change
      }
    } else {
      opt.offset = setCenter;
    }

    if (opt.closeClass) {
      that.find('.' + opt.closeClass).off('click', modalClose).click(modalClose);
    }
    // events
    $.each([['open', EVENT_TYPE_OPEN],
        ['close', EVENT_TYPE_CLOSE],
        ['beforeopen', EVENT_TYPE_BEFOREOPEN],
        ['beforeclose', EVENT_TYPE_BEFORECLOSE]], function(i, elm) {
      var optName = elm[0], type = elm[1];
      if (typeof opt[optName] === 'function')
        { that.off(type, opt[optName]).on(type, opt[optName]); }
    });
    that.css(cssProp).data(APP_NAME, opt).appendTo(jqBody)
      .on('touchmove', function() { return false; }); // avoid scroll on touch devices
  });
}

function modalOpen(jq, options) {
  var jqTarget = jq.length ? jq.eq(0) : undefined, // only 1st
    opt, inlineStyles, calMarginR, calMarginB, event;
  if (lockAction || !jqTarget) { return jq; }

  if (options || !(opt = jqTarget.data(APP_NAME))) {
    opt = init(jqTarget, options).data(APP_NAME);
  }

  if (!jqNextOpen && opt.force && jqFading && jqFading.get(0) !== jqTarget.get(0)) {
    // Fix status immediately
    jqFading.stop(true, true);
    jqOverlay.stop(true, true);
  }

  if (!jqNextOpen && opt.force && jqOpened && jqOpened.get(0) !== jqTarget.get(0)) {
    jqNextOpen = jqTarget; // options is saved to .data().
    modalClose(jqOpened);
  } else if (jqOpened === null) {
    lockAction = true;
    // Event: beforeopen
    event = $.Event(EVENT_TYPE_BEFOREOPEN, {cancelable: true});
    jqTarget.trigger(event);
    if (!event.isDefaultPrevented()) {
      inlineStyles = jqBody.get(0).style;
      orgOverflow = inlineStyles.overflow;
      calMarginR = jqBody.prop('clientWidth');
      calMarginB = jqBody.prop('clientHeight');
      jqBody.css('overflow', 'hidden');
      calMarginR -= jqBody.prop('clientWidth');
      calMarginB -= jqBody.prop('clientHeight');
      orgMarginR = inlineStyles.marginRight;
      orgMarginB = inlineStyles.marginBottom;
      if (calMarginR < 0) { jqBody.css('marginRight', '+=' + (-calMarginR)); }
      if (calMarginB < 0) { jqBody.css('marginBottom', '+=' + (-calMarginB)); }

      jqActive = $(document.activeElement).blur(); // Save activeElement
      jq1st = null;
      winLeft = jqWin.scrollLeft();
      winTop = jqWin.scrollTop();
      jqWin.scroll(avoidScroll);

      callOffset(jqTarget, opt);
      // If duration is 0, callback is called now.
      opt.effect.open.call((jqFading = jqTarget), opt.duration || 1, function() {
        jqFading = undefined;
        jqTarget.find('a,input,select,textarea,button,object,area,img,map').each(function() {
          var that = $(this);
          if (that.focus().get(0) === document.activeElement) { // Can focus
            jq1st = that;
            return false;
          }
        });
        jqOpened = jqTarget; // set before trigger()
        // Event: open
        jqTarget.trigger(EVENT_TYPE_OPEN);
      });
      // Re-Style the overlay that is shared by all 'opt'.
      jqOverlay.css({backgroundColor: opt.overlay.fillColor, zIndex: opt.overlay.zIndex})
        .fadeTo(opt.duration, opt.overlay.opacity);
      jqOpened = 0;
    }
    lockAction = false;
  }
  return jq;
}

function modalClose(jq) { // jq: target/event
  var isEvent = jq instanceof $.Event, jqTarget, opt, event, duration;
  if (!lockAction && jqOpened) {
    lockAction = true;
    jqTarget = isEvent ? jqOpened : (function() { // jqOpened in jq
      var index = jq.index(jqOpened);
      return index > -1 ? jq.eq(index) : undefined;
    })();
    if (jqTarget) {
      // Event: beforeclose
      event = $.Event(EVENT_TYPE_BEFORECLOSE, {cancelable: true});
      if (isEvent) { event.from = jq; }
      else if (jqNextOpen) { event.from = jqNextOpen; }
      jqTarget.trigger(event);
      if (!event.isDefaultPrevented()) {
        opt = jqTarget.data(APP_NAME);
        // If duration is 0, callback is called now.
        duration = jqNextOpen ? 1 : (opt.duration || 1);
        opt.effect.close.call((jqFading = jqTarget), duration, function() {
          var event;
          jqFading = undefined;
          jqBody.css({overflow: orgOverflow,
            marginRight: orgMarginR, marginBottom: orgMarginB});
          if (jqActive && jqActive.length) { jqActive.focus(); } // Restore activeElement
          jqWin.off('scroll', avoidScroll).scrollLeft(winLeft).scrollTop(winTop);
          jqOpened = null; // set before trigger()
          // Event: close
          event = $.Event(EVENT_TYPE_CLOSE);
          if (isEvent) { event.from = jq; }
          else if (jqNextOpen) { event.from = jqNextOpen; }
          jqTarget.trigger(event);
          if (jqNextOpen) {
            window.setTimeout(function() {
              modalOpen(jqNextOpen);
              jqNextOpen = undefined;
            }, 0);
          }
        });
        jqOverlay.fadeOut(duration);
        jqOpened = 0;
      } else {
        jqNextOpen = undefined;
      }
    }
    lockAction = false;
  }
  if (isEvent) { jq.preventDefault(); return false; }
  return jq;
}

function callOffset(jq, options) {
  var offset;
  options = options || jq.data(APP_NAME);
  if (typeof options.offset === 'function' &&
      (offset = options.offset.call(jq))) {
    jq.css({left: offset.left, top: offset.top, marginLeft: '', marginTop: ''});
  }
}

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
  if (lastWidth === undefined || lastHeight === undefined) { // first time
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

/* jshint validthis:true */
  this.css({
    left: '50%',
    top: '50%',
    marginLeft: '-' + (this.outerWidth() / 2) + 'px',
    marginTop: '-' + (this.outerHeight() / 2) + 'px'
  });
/* jshint validthis:false */
}

function avoidScroll(e) {
  jqWin.scrollLeft(winLeft).scrollTop(winTop);
  e.preventDefault();
  return false;
}

function setOption(jq, name, newValue) {
  var jqTarget = jq.length ? jq.eq(0) : undefined, // only 1st
    opt;
  if (!jqTarget) { return; }
  opt = jqTarget.data(APP_NAME) || init(jqTarget).data(APP_NAME);
  if (!opt.hasOwnProperty(name)) { return; }
/* jshint eqnull:true */
  if (newValue != null) { opt[name] = newValue; }
/* jshint eqnull:false */
  return opt[name];
}

$(function() {
  $(window).resize(function() {
    if (jqOpened) { callOffset(jqOpened); }
  });
});

$.fn[APP_NAME] = function(action, arg1, arg2) {
  return (
    action === 'open' ?   modalOpen(this, arg1) :
    action === 'close' ?  modalClose(this) :
    action === 'option' ? setOption(this, arg1, arg2) :
                          init(this, action)); // action = options.
};

})(jQuery);
