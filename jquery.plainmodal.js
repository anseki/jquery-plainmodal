/*
 * jQuery.plainModal
 * https://github.com/anseki/jquery-plainmodal
 *
 * Copyright (c) 2014 anseki
 * Licensed under the MIT license.
 */

;(function($, undefined) {
'use strict';

var APP_NAME = 'plainModal',
    APP_PREFIX = APP_NAME.toLowerCase(),
    EVENT_TYPE_OPEN = APP_PREFIX + 'open',
    EVENT_TYPE_CLOSE = APP_PREFIX + 'close',

    jqOpened = null, // jqOpened === null : Not opened / jqOpened === 0 : Fading now
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
      height:         '150%', // for Address Bar of Firefox for Android
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
      if (typeof opt.offset !== 'function') {
        cssProp.left = opt.offset.left;
        cssProp.top = opt.offset.top;
      }
      cssProp.marginLeft = cssProp.marginTop = ''; // for change
    } else {
      cssProp.left = cssProp.top = '50%';
      cssProp.marginLeft = '-' + (that.outerWidth() / 2) + 'px';
      cssProp.marginTop = '-' + (that.outerHeight() / 2) + 'px';
    }
    if (opt.closeClass) {
      that.find('.' + opt.closeClass).off('click', modalClose).click(modalClose);
    }
    if (typeof opt.open === 'function')
      { that.off(EVENT_TYPE_OPEN, opt.open).on(EVENT_TYPE_OPEN, opt.open); }
    if (typeof opt.close === 'function')
      { that.off(EVENT_TYPE_CLOSE, opt.close).on(EVENT_TYPE_CLOSE, opt.close); }
    that.css(cssProp).data(APP_NAME, opt).appendTo(jqBody)
      .on('touchmove', function() { return false; }); // avoid scroll on touch devices
  });
}

function modalOpen(jq, options) {
  var jqTarget, opt, inlineStyles, calMarginR, calMarginB, offset;
  if (jqOpened === null && jq.length) {
    jqTarget = jq.eq(0); // only 1st
    if (options || !(opt = jqTarget.data(APP_NAME))) {
      opt = init(jqTarget, options).data(APP_NAME);
    }
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

    if (typeof opt.offset === 'function') {
      offset = opt.offset.call(jqTarget);
      jqTarget.css({left: offset.left, top: offset.top});
    }
    // If duration is 0, callback is called now.
    opt.effect.open.call(jqTarget, opt.duration || 1, function() {
      jqTarget.find('a,input,select,textarea,button,object,area,img,map').each(function() {
        var that = $(this);
        if (that.focus().get(0) === document.activeElement) { // Can focus
          jq1st = that;
          return false;
        }
      });
      jqOpened = jqTarget.trigger(EVENT_TYPE_OPEN);
    });
    // Re-Style the overlay that is shared by all 'opt'.
    jqOverlay.css({backgroundColor: opt.overlay.fillColor, zIndex: opt.overlay.zIndex})
      .fadeTo(opt.duration, opt.overlay.opacity);
    jqOpened = 0;
  }
  return jq;
}

function modalClose(jq) { // jq: target/event
  var isEvent = jq instanceof $.Event, jqTarget, opt;
  if (jqOpened) {
    jqTarget = isEvent ? jqOpened : (function() { // jqOpened in jq
      var index = jq.index(jqOpened);
      return index > -1 ? jq.eq(index) : undefined;
    })();
    if (jqTarget) {
      opt = jqTarget.data(APP_NAME);
      // If duration is 0, callback is called now.
      opt.effect.close.call(jqTarget, opt.duration || 1, function() {
        jqBody.css({overflow: orgOverflow, marginRight: orgMarginR, marginBottom: orgMarginB});
        if (jqActive && jqActive.length) { jqActive.focus(); } // Restore activeElement
        jqWin.off('scroll', avoidScroll).scrollLeft(winLeft).scrollTop(winTop);
        jqTarget.trigger(EVENT_TYPE_CLOSE);
        jqOpened = null;
      });
      jqOverlay.fadeOut(opt.duration);
      jqOpened = 0;
    }
  }
  if (isEvent) { jq.preventDefault(); return false; }
  return jq;
}

function avoidScroll(e) {
  jqWin.scrollLeft(winLeft).scrollTop(winTop);
  e.preventDefault();
  return false;
}

$.fn[APP_NAME] = function(action, options) {
  return (
    action === 'open' ?   modalOpen(this, options) :
    action === 'close' ?  modalClose(this) :
                          init(this, action)); // options.
};

})(jQuery);
