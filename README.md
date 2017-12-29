# jQuery-plainModal

[![npm](https://img.shields.io/npm/v/jquery-plainmodal.svg)](https://www.npmjs.com/package/jquery-plainmodal) [![GitHub issues](https://img.shields.io/github/issues/anseki/jquery-plainmodal.svg)](https://github.com/anseki/jquery-plainmodal/issues) [![David](https://img.shields.io/david/anseki/jquery-plainmodal.svg)](package.json) [![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE-MIT)

***Recommend: [PlainModal](https://anseki.github.io/plain-modal/) instead of "jQuery-plainModal"***  
*No dependency, Modern browsers supported, Lightweight & Single file, and more features*

---

The simple jQuery Plugin for fully customizable modal windows. plainModal has basic functions only, and it does not style. It has no image files and no CSS files. Just one small file.

**See <a href="https://anseki.github.io/jquery-plainmodal/">DEMO</a>**

Many great plugins already exist.

* The gorgeous plugins which has many functions and rich styles.
* The simple plugins which has small functions and customizable styles.

plainModal has necessary functions for the modal windows. That's all. You can free style it to perfect match for your web site. Of course it can be responsive web design.

plainModal does:

* Showing the specified element as the modal window, and hiding it.
* Covering a page with an overlay.
* Avoiding focusing the outside elements of the modal window. (by pressing Tab key)
* Avoiding scrolling a page window.
* Hiding the modal window when Escape key is pressed.

```js
// Show modal window. <div id="modal"> is styled via your CSS.
$('#modal').plainModal('open');
// Hide modal window.
$('#modal').plainModal('close');
```

## Getting Started
Load after jQuery.

```html
<script src="jquery-1.11.0.min.js"></script>
<script src="jquery.plainmodal.min.js"></script>
```

## Methods

### `open`

```js
element = element.plainModal('open'[, options])
```

Show the specified element as the modal window.  
If `options` (see [Options](#options)) is specified, the element is initialized with specified `options` before it is shown. If the element is not initialized yet, it is initialized even if `options` is not specified (with the default options).  
The element can be initialized by new `options` any number of times.

### `close`

```js
element = element.plainModal('close')
```

Hide the shown modal window.

### Initialize

```js
element = element.plainModal([options])
```

Initialize the specified element as the modal window.  
The [`open`](#open) method too, can initialize. This is used to initialize without showing the modal window at voluntary time.  
You can specify `options` to every [`open`](#open) method. But, if `options` of an element isn't changed, re-initializing it isn't needed. Then, you specify `options` to only first [`open`](#open) method, or use this method for initializing it only once.  
If you don't customize any options (using default all), this method isn't needed because `options` isn't specified to [`open`](#open) method, and the element is initialized at only first time.

In this code, it is initialized meaninglessly again, again, and again:

```js
$('#open-button').click(function() {
  // Same initializing per every showing
  $('#modal').plainModal('open', {duration: 500});
});
```

In this code, it is initialized at once:

```js
// Initialize without showing
var modal = $('#modal').plainModal({duration: 500});
$('#open-button').click(function() {
  // Show without initializing
  modal.plainModal('open');
});
```

In this code, it is initialized at once:

```js
$('#open-button').click(function() {
  // Initialize at only first time
  modal.plainModal('open');
});
```

### `option`

```js
currentValue = element.plainModal('option', optionName)
```

```js
element = element.plainModal('option', optionName, newValue)
```

```js
element = element.plainModal('option', {
  optionName1: newValue1,
  optionName2: newValue2 ... 
})
```

Get the current option value (see [Options](#options)) of the modal window, or set the new value to the modal windows.

*NOTE:* If you want to change the event handlers (see [Events](#events)), use `on` or `off` method.

### `blur`

```js
element = element.plainModal('blur'[, on[, duration[, complete]]])
```

Let the modal window go under the overlay. If `false` is specified to `on` argument, restore the modal window. The default is `true`.  
This method is used to just effect. Note that it works without depending on the current status of the modal window and it doesn't change the status. Therefore, you must restore it after.  
For example, you want to show something to the user while the modal window is shown, you let it blur temporarily and show something, and then you restore it after something.

## Options

An `options` Object can be specified to [`open`](#open) or [Initialize](#initialize) method. It can have following properties.

### `offset`

Type: Object or Function  
Default: Calculated center position

An Object that has `left` and `top`, relative to the view area.

```js
$('#modal').plainModal({offset: {left: 100, top: 50}});
```

Or, a Function that returns the above Object. This Function is called when the modal window is opened and the browser window is resized. Therefore the position be able to change according to the situation.

```js
var button = $('#open-button').click(function() {
      modal.plainModal('open');
    }),
    modal = $('#modal').plainModal({
      offset: function() {
        // Fit the position to a button.
        var btnOffset = button.offset(), win = $(window);
        return {
          left:   btnOffset.left - win.scrollLeft()
                    + parseInt(this.css('borderLeftWidth'), 10),
          top:    btnOffset.top - win.scrollTop()
                    + parseInt(this.css('borderTopWidth'), 10)
        };
      }
    });
```

If the Function returns nothing, the position isn't changed. In this case, that Function will change the position. For example, positioning by `margin` instead of `left`/`top`.  
A `center` argument is given to the Function. It is a Function that moves the modal window to the center of the window. For example, your Function does something that changes a size of the modal window, and it calls a `center` to adjust a position.

```js
$('#modal').plainModal({
  offset: function(center) {
    // sizing by view port, step by 100px
    var jqHtml = $('html'),
      width = jqHtml.prop('clientWidth'),
      height = jqHtml.prop('clientHeight');
    width = width * 0.5;
    height = height * 0.5;
    width = Math.round(width / 100) * 100;
    height = Math.round(height / 100) * 100;
    if (width < 100) { width = 100; }
    if (height < 100) { height = 100; }
    this.width(width).height(height);
    center(); // position to center.
  }
});
```

### `overlay`

Type: Object  
Default: `{fillColor: '#888', opacity: 0.6, zIndex: 9000}`

An Object that can have `fillColor`, `opacity` and `zIndex` of the overlay.

```js
$('#modal').plainModal({overlay: {fillColor: '#fff', opacity: 0.5}});
```

`color` is an alias for `fillColor`.

If you want to style the overlay more, add style to `plainmodal-overlay` class.

```css
.plainmodal-overlay {
  background-image: url('bg.png');
}
```

### `closeClass`

Type: String  
Default: `'plainmodal-close'`

If the element that has this class name is found in the modal window, the [`close`](#close) method is attached to `click` event of it.  
You can know that the element was clicked, via [`event.from`](#from).

```html
<div>
  <p>Lorem ipsum dolor ...</p>
  <div class="plainmodal-close">Close</div>
</div>
```

### `duration`

Type: Number  
Default: `200`

A number determining how long (milliseconds) the effect animation for showing and hiding the modal window will run.

### `effect`

Type: Object  
Default: `{open: jQuery.fn.fadeIn, close: jQuery.fn.fadeOut}`

An Object that can have `open` and `close` Functions for showing and hiding the modal window.  
These Functions are called with [`options.duration`](#duration) Number (see above) and `complete` Function.  
It's same to standard effect methods of jQuery (`slideDown`, `slideUp`, `animate`, etc.). Therefore, those methods can be specified.

```js
$('#modal').plainModal({effect: {open: $.fn.slideDown, close: $.fn.slideUp}});
```

Custom animation:

```js
$('#modal').plainModal({
  offset: {left: 300, top: 100},
  duration: 500,
  effect: {
    open: function(duration, complete) {
      this.css({
        display:          'block',
        marginTop:        -100 - this.outerHeight()
      })
      .animate({marginTop: 0}, duration, complete);
    },
    close: function(duration, complete) {
      this.animate({
        marginTop:        -100 - this.outerHeight()
      }, duration, function() {
        $(this).css({display: 'none'});
        complete();
      });
    }
  }
});
```

These Functions can ignore `duration`, but it must call `complete`, when the effect was finished.

```js
$('#modal').plainModal({
  effect: {
    open: function(duration, complete) {
      var that = this.css({
        display:          'block',
        color:            '#fff',
        backgroundColor:  '#f1e470'
      });
      setTimeout(function() {
        that.css({color: '', backgroundColor: ''});
        complete();
      }, 500);
    },
    close: function(duration, complete) {
      var that = this.css({
        color:            '#fff',
        backgroundColor:  '#f1e470'
      });
      setTimeout(function() {
        that.css({display: 'none'});
        complete();
      }, 500);
    }
  }
});
```

### `zIndex`

Type: Number  
Default: `options.overlay.zIndex + 1`

A `z-index` CSS property of the modal window. This number have to be bigger than `zIndex` of [`options.overlay`](#overlay).

### `child`

Type: jQuery object  
Default: `undefined`

A child modal window or multiple child modal windows.  
A parent modal window is already opened, and then a child modal window is opened. Now, a child modal window is activated and a parent modal window is blurred (status is "closed" but it is not hidden). And when a child modal window is closed, a parent modal window is activated again (re-opened).  
You can trace or control those behavior via [`event.from`](#from).

```js
var child = $('#child').plainModal(),
  parent = $('#parent').plainModal({child: child});

$('#main-button').click(function() { parent.plainModal('open'); });
$('#button-in-parent').click(function() { child.plainModal('open'); });
```

### `force`

Type: Boolean  
Default: `false`

The only one modal window can open in the one window. Therefore the [`open`](#open) method is ignored when another modal window is already opened.  
If the [`open`](#open) method of the modal window that is set `true` to `force` is called when another modal window is already opened, another modal window is closed immediately, and the target modal window is opened.  
You can trace or control those behavior via [`event.from`](#from).
*If you want to let the modal windows behave like the parent and child, you should consider [`options.child`](#child).*

```js
var modal1 = $('#modal1').plainModal(),
  modal2 = $('#modal2').plainModal({force: true});
```

### `fixOverlay`

Type: Boolean  
Default: `false`

If `true` is specified, the effects for showing and hiding the overlay are avoided.  
For example, this is used to close a modal window and open another modal window, without a screen flickering. Note that the overlay stays when the modal window is closed before this option is reset to `false`.

### `open`, `close`, `beforeopen`, `beforeclose`

Type: Function  
Default: `undefined`

The [`plainmodalopen`](#plainmodalopen), [`plainmodalclose`](#plainmodalclose), [`plainmodalbeforeopen`](#plainmodalbeforeopen) and [`plainmodalbeforeclose`](#plainmodalbeforeclose) event handlers. This is convenient way to do `on(type, handler)` method. (see [Events](#events))

```js
$('#modal').plainModal({open: function(event) { console.log(event); } });
```

*NOTE:* If this option is specified in the [`open`](#open) method, declared Function or the variable the Function is assigned should be specified (Don't specify the function expression). Because the [`open`](#open) method may be called again, and the *function expression* generates the new Function every time.  
The *"function statement"* and the *"function operator"* are different.  
See [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions#Defining_functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions#Defining_functions)  
For example, this code is OK:

```js
function handler(event) { console.log(event); }
$('#open-button').click(function() {
  $('#modal').plainModal('open', {open: handler});
});
```

This code registers event handler repeatedly when the [`open`](#open) method is called:

```js
$('#open-button').click(function() {
  $('#modal').plainModal('open', {open: function(event) { console.log(event); } });
});
```

## Events

### `plainmodalopen`

Triggered when the modal window is opened. (after the `open` of [`options.effect`](#effect) took [`options.duration`](#duration) to complete.)  
An event handler can be attached when initializing via [`options.open`](#open-close-beforeopen-beforeclose) as well.  
The Event object that is passed to the event handler might have a [`from`](#from) property.

```js
$('#modal').on('plainmodalopen', function(event) {
  $('textarea', event.target).addClass('highlight');
});
```

### `plainmodalclose`

Triggered when the modal window is closeed. (after the `close` of [`options.effect`](#effect) took [`options.duration`](#duration) to complete.)  
An event handler can be attached when initializing via [`options.close`](#open-close-beforeopen-beforeclose) as well.  
The Event object that is passed to the event handler might have a [`from`](#from) property.

```js
$('#modal').on('plainmodalclose', function(event) {
  $('#screen').show();
});
```

### `plainmodalbeforeopen`

Triggered before the modal window is opened.  
An event handler can be attached when initializing via [`options.beforeopen`](#open-close-beforeopen-beforeclose) as well.  
The Event object that is passed to the event handler might have a [`from`](#from) property.

This event might be cancelable by calling `event.preventDefault()` in an event handler. The `plainmodalbeforeopen` event of the second modal window by [`options.child`](#child) or [`options.force`](#force) is not cancelable. Call `event.preventDefault()` in [`plainmodalbeforeclose`](#plainmodalbeforeclose) event of the first (i.e. parent) modal window to cancel that action.  
You can know whether or not it is cancelable, via whether or not `event.cancelable` is `true`.

```js
$('#modal').on('plainmodalbeforeopen', function(event) {
  if (!dataList.ready) {
    event.preventDefault(); // Don't open yet.
  }
});
```

### `plainmodalbeforeclose`

Triggered before the modal window is closeed.  
An event handler can be attached when initializing via [`options.beforeclose`](#open-close-beforeopen-beforeclose) as well.  
The Event object that is passed to the event handler might have a [`from`](#from) property.

This event is cancelable by calling `event.preventDefault()` in an event handler.

```js
$('#modal').on('plainmodalbeforeclose', function(event) {
  if (elmUserName.val() === '') {
    alert('"User Name" is required.');
    event.preventDefault(); // Stay opening.
  }
});
```

### Properties

The Event object that is passed to the event handler might have additional properties.

#### `from`

In some cases, the modal window is opened or closed without you calling [`open`](#open) method or [`close`](#close) method. For example, when the overlay or the button which is specified [`options.closeClass`](#closeclass) is clicked. Or the parent modal window is closed when the child modal window is closed. (See [`options.child`](#child))  
In those cases, the Event object that is passed to the event handler has the `from` property. It refers to:

* The Event object of another event, when the overlay or the button that is specified [`options.closeClass`](#closeclass) is clicked (`click` event), or Escape key is pressed (`keydown` event). In the [`plainmodalclose`](#plainmodalclose) or [`plainmodalbeforeclose`](#plainmodalbeforeclose) event handler.
* The child modal window, when it is opened. In the [`plainmodalclose`](#plainmodalclose) or [`plainmodalbeforeclose`](#plainmodalbeforeclose) event handler of the parent modal window.
* The child modal window, when it is closed. In the [`plainmodalopen`](#plainmodalopen) or [`plainmodalbeforeopen`](#plainmodalbeforeopen) event handler of the parent modal window.
* The another modal window that `true` is specified to [`options.force`](#force), when it is opened. In the [`plainmodalclose`](#plainmodalclose) or [`plainmodalbeforeclose`](#plainmodalbeforeclose) event handler of the modal window that is closed by that action.

```js
var
  modal1 = $('#modal1').plainModal({duration: 500})

  .on('plainmodalbeforeclose', function(event) {
    var from = event.from, orgDuration, offset;
    if (!from) { return; }

    if (from.type === 'keydown') {
      // If the user pushed the Escape key, (s)he is in a hurry.
      orgDuration = modal1.plainModal('option', 'duration');
      modal1.one('plainmodalclose', function() {
          modal1.plainModal('option', 'duration', orgDuration); // Restore
        })
        .plainModal('option', 'duration', 1); // Set to fast closing

    } else if (from.type === 'click' &&
        from.currentTarget.className === 'plainmodal-overlay') {
      // If the user clicked the overlay that is too short
      // distance from this small modal, (s)he might have mistaken.
      // And ignore clicking.
      offset = modal1.offset();
      if (from.clientX >= offset.left - 20 &&
          from.clientX <= offset.left + modal1.outerWidth() + 20 &&
          from.clientY >= offset.top -20 &&
          from.clientY <= offset.top + modal1.outerHeight() + 20) {
        event.preventDefault(); // Stay opening.
      }

    } else if (from.jquery) { // This is jQuery object. i.e. another modal.
      // The another modal takes over this message.
      from.find('.warning-message').text(modal1.find('.warning-message').text());
    }
  });
```

#### `isChild`

A `true` is set, when a current modal window is handled as the child modal window.

## Note

* As everyone knows, IE8- has many problems. CSS `position:fixed` in HTML without `<!DOCTYPE>` is ignored.  
If your web site supports IE8- and it use `position:fixed`, HTML must include `<!DOCTYPE>` even if plainModal is not used. And plainModal uses `position:fixed`.
* The [Initialize](#initialize) method set `display:none` to specified element. You can hide the element before Initialize method, by your stylesheet.

## See Also

- [PlainOverlay](https://anseki.github.io/plain-overlay/) : The simple library for customizable overlay which covers all or part of a web page.
- [PlainModal](https://anseki.github.io/plain-modal/) : The simple library for fully customizable modal window in a web page.
