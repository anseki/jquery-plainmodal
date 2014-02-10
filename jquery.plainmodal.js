/*
 * jQuery.plainModal
 * https://github.com/anseki/jquery-plainmodal
 *
 * Copyright (c) 2013 anseki
 * Licensed under the MIT license.
 */

;(function($) {

var jqOpened = null, // jqOpened === null : Not opened / jqOpened === 0 : Fading now
    jqBody, jqOverlay, jqActive, jq1st,
    orgOverflow, orgMarginR, orgMarginB,
    jqWin, winLeft, winTop;

function init(jq, options) {
  // The options object is shared by all elements in jq.
  // Therefore, don't change properties later. (Replace options object for new object.)
  var opt = $.extend({
        duration:       200,
        effect:         {open: $.fn.fadeIn, close: $.fn.fadeOut},
        overlay:        {color: '#000', opacity: 0.3},
        closeClass:     'plainmodal-close'
        //offset
      }, options);

  jqBody = jqBody || $('body');
  jqOverlay = jqOverlay || $('<div />').css({
    position:       'fixed',
    left:           0,
    top:            0,
    width:          '100%',
    height:         '100%',
    display:        'none',
    zIndex:         9000
  }).appendTo(jqBody).click(modalClose);
  jqWin = jqWin || $(window);

  return jq.each(function() {
    var that = $(this),
        cssProp = {
          position:       'fixed',
          display:        'none',
          zIndex:         9001
        };
    if (opt.offset) {
      cssProp.left = opt.offset.left;
      cssProp.top = opt.offset.top;
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
  var target, opt, inlineStyles, calMarginR, calMarginB;
  if (jqOpened === null && jq.length) {
    target = jq.eq(0);
    if (options || !(opt = target.data('plainModal'))) {
      opt = init(target, options).data('plainModal');
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
    $(document).focusin(forceFocus).keydown(keyEscape);
    winLeft = jqWin.scrollLeft();
    winTop = jqWin.scrollTop();
    jqWin.scroll(avoidScroll);

    opt.effect.open.call(target, opt.duration, function() {
      target.find('a,input,select,textarea,button,object,area,img,map').each(function() {
        var that = $(this);
        if (that.focus().get(0) === document.activeElement) { // Can focus
          jq1st = that;
          return false;
        }
      });
      jqOpened = target;
    });
    jqOverlay.css('backgroundColor', opt.overlay.color)
      .fadeTo(opt.duration, opt.overlay.opacity);
    jqOpened = 0;
  }
  return jq;
}

function modalClose(jq) {
  var opt;
  if (jqOpened) {
    opt = jqOpened.data('plainModal');
    opt.effect.close.call(jqOpened, opt.duration, function() {
      jqBody.css('overflow', orgOverflow);
      jqBody.css('marginRight', orgMarginR);
      jqBody.css('marginBottom', orgMarginB);
      $(document).off('focusin', forceFocus).off('keydown', keyEscape);
      if (jqActive && jqActive.length) { jqActive.focus(); } // Restore activeElement
      jqWin.off('scroll', avoidScroll);
      jqWin.scrollLeft(winLeft).scrollTop(winTop);
      jqOpened = null;
    });
    jqOverlay.fadeOut(opt.duration);
    jqOpened = 0;
  }
  if (jq instanceof jQuery.Event) { jq.preventDefault(); return false; }
  return jq;
}

function forceFocus(e) {
  if (jqOpened && !jqOpened.has(e.target).length) {
    if (jq1st) { jq1st.focus(); }
    else { $(document.activeElement).blur(); }
  }
}

function keyEscape(e) {
  if (e.keyCode === 27) { // Escape
    modalClose();
    e.preventDefault();
    return false;
  }
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
