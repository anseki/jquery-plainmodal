/*
 * jQuery.plainModal
 * https://github.com/anseki/jquery-plainmodal
 *
 * Copyright (c) 2014 anseki
 * Licensed under the MIT license.
 */

;(function($, undefined) {
'use strict';

var jqOpened = null, // jqOpened === null : Not opened / jqOpened === 0 : Fading now
    jqWin, jqBody, jqOverlay, jqActive, jq1st,
    orgOverflow, orgMarginR, orgMarginB,
    winLeft, winTop;

function init(jq, options) {
  // The options object is shared by all elements in jq.
  // Therefore, don't change properties later. (Replace options object for new object.)
  var opt = $.extend(true, {
        duration:       200,
        effect:         {open: $.fn.fadeIn, close: $.fn.fadeOut},
        overlay:        {color: '#888', opacity: 0.6, zIndex: 9000},
        onClose:        function() {},
        closeClass:     'plainmodal-close'
        //offset
      }, options);
  opt.zIndex = opt.zIndex || opt.overlay.zIndex + 1;

  if (!jqWin) { // page init
    jqWin = $(window);
    jqOverlay = $('<div />').css({
      position:       'fixed',
      left:           0,
      top:            0,
      width:          '100%',
      height:         '100%',
      display:        'none'
    }).appendTo(jqBody = $('body')).click(modalClose);
    $(document).focusin(function(e) {
      if (jqOpened && !jqOpened.has(e.target).length) {
        if (jq1st) { jq1st.focus(); }
        else { $(document.activeElement).blur(); }
      }
    })
    .keydown(function(e) {
      if (e.keyCode === 27) { // Escape
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
    that.css(cssProp).data('plainModal', opt).appendTo(jqBody);
  });
}

function modalOpen(jq, options) {
  var jqTarget, opt, inlineStyles, calMarginR, calMarginB, offset;
  if (jqOpened === null && jq.length) {
    jqTarget = jq.eq(0); // only 1st
    if (options || !(opt = jqTarget.data('plainModal'))) {
      opt = init(jqTarget, options).data('plainModal');
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
    opt.effect.open.call(jqTarget, opt.duration, function() {
      jqTarget.find('a,input,select,textarea,button,object,area,img,map').each(function() {
        var that = $(this);
        if (that.focus().get(0) === document.activeElement) { // Can focus
          jq1st = that;
          return false;
        }
      });
      jqOpened = jqTarget;
    });
    // Re-Style the overlay that is shared by all 'opt'.
    jqOverlay.css({backgroundColor: opt.overlay.color, zIndex: opt.overlay.zIndex})
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
      opt = jqTarget.data('plainModal');
      opt.effect.close.call(jqTarget, opt.duration, function() {
        jqBody.css({overflow: orgOverflow, marginRight: orgMarginR, marginBottom: orgMarginB});
        if (jqActive && jqActive.length) { jqActive.focus(); } // Restore activeElement
        jqWin.off('scroll', avoidScroll).scrollLeft(winLeft).scrollTop(winTop);
        jqOpened = null;
      });
      jqOverlay.fadeOut(opt.duration);
      jqOpened = 0;
    }
  }
  if (isEvent) { jq.preventDefault(); return false; }
  if(typeof opt.onClose == 'function'){
      opt.onClose.call(this);
  }
  return jq;
}

function avoidScroll(e) {
  jqWin.scrollLeft(winLeft).scrollTop(winTop);
  e.preventDefault();
  return false;
}

$.fn.plainModal = function(action, options) {
  return (
    action === 'open' ?   modalOpen(this, options) :
    action === 'close' ?  modalClose(this) :
    init(this, action)); // options.
};

})(jQuery);
