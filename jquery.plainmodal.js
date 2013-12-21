/*
 * jQuery.plainModal
 * https://github.com/anseki/jquery-plainmodal
 *
 * Copyright (c) 2013 anseki
 * Licensed under the MIT license.
 */

(function($) {

var jqOpened = null, // jqOpened === null : Not opened / jqOpened === 0 : Fading now
    jqBody, jqOverlay, jqTrigger, jq1st,
    orgOverflow, addMarginR, addMarginB,
    jqWin, winLeft, winTop;

function init(jq, options) {
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
    var self = $(this),
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
      cssProp.marginLeft = '-' + (self.outerWidth() / 2) + 'px';
      cssProp.marginTop = '-' + (self.outerHeight() / 2) + 'px';
    }
    if (opt.closeClass) {
      self.find('.' + opt.closeClass).off('click', modalClose).click(modalClose);
    }
    self.css(cssProp).data('plainModal', opt).appendTo(jqBody);
  });
}

function modalOpen(jq, options) {
  var target, opt, calMarginR, calMarginB;
  if (jqOpened === null && jq.length) {
    target = jq.eq(0);
    if (options || !(opt = target.data('plainModal'))) {
      opt = init(target, options).data('plainModal');
    }

    orgOverflow = jqBody.css('overflow');
    calMarginR = jqBody.width();
    calMarginB = jqBody.height();
    jqBody.css('overflow', 'hidden');
    calMarginR -= jqBody.width();
    calMarginB -= jqBody.height();
    addMarginR = addMarginB = 0;
    if (calMarginR < 0) { jqBody.css('marginRight', '+=' + (addMarginR = -calMarginR)); }
    if (calMarginB < 0) { jqBody.css('marginBottom', '+=' + (addMarginB = -calMarginB)); }

    winLeft = jqWin.scrollLeft();
    winTop = jqWin.scrollTop();

    jqTrigger = $(document.activeElement); // Save activeElement
    opt.effect.open.call(target, opt.duration, function() {
      jq1st = null;
      target.find('a,input,select,textarea,button,object,area,img,map').each(function() {
        var self = $(this);
        if (self.focus().get(0) === document.activeElement) { // Can focus
          jq1st = self;
          return false;
        }
      });
      $(document.activeElement).blur();
      $(document).focusin(forceFocus).keydown(keyEscape);
      jqWin.scroll(winScroll);
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
      $(document).off('focusin', forceFocus).off('keydown', keyEscape);
      jqWin.off('scroll', winScroll);
      jqBody.css('overflow', orgOverflow);
      if (addMarginR) { jqBody.css('marginRight', '-=' + addMarginR); }
      if (addMarginB) { jqBody.css('marginBottom', '-=' + addMarginB); }
      if (jqTrigger && jqTrigger.length) { jqTrigger.focus(); } // Restore activeElement
      jqWin.scrollLeft(winLeft);
      jqWin.scrollTop(winTop);
      jqOpened = null;
    });
    jqOverlay.fadeOut(opt.duration);
    jqOpened = 0;
  }
  if (jq instanceof jQuery.Event){ jq.preventDefault(); return false; }
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

function winScroll(e) {
  jqWin.scrollLeft(winLeft);
  jqWin.scrollTop(winTop);
  e.preventDefault();
  return false;
}

$.fn.plainModal = function(action, options) {
  return (
    action === 'open' ?   modalOpen(this, options) :
    action === 'close' ?  modalClose(this) :
                          init(this, action)); // options.
};

}(jQuery)); 
