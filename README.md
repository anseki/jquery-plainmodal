# plainModal

The simple jQuery Plugin for customizable modal windows. plainModal has basic functions only, and it does nothing for styles. It has no image files and no CSS files. Just one small file (2KB minified).  
**See <a href="http://anseki.github.io/jquery-plainmodal">DEMO</a>**

Many great plugins already exist.

- The gorgeous plugins which has many functions and rich styles.
- The simple plugins which has small functions and customizable styles.

The many web sites use same functions almost. And these have different styles.  
plainModal has basic functions for showing modal windows. That's all. The styling it is your job. You can free style it to perfect match for your web site.

plainModal do:

- Showing specified element as modal window, and hiding it.
- Covering a page with a overlay.
- Avoiding focusing outside elements of the modal window. (by pressing Tab key)
- Avoiding scrolling a page window.
- Hiding the modal window when Escape key is pressed.

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

### <a name ="open">Open</a>

```js
element.plainModal('open'[, options])
```

Show specified element as modal window.  
If `options` (see [Options](#options)) is specified, element is initialized with specified `options` before it is shown. If element is not initialized yet, element is initialized even if `options` is not specified.  
An element can be initialized by new `options` any number of times.

### <a name ="close">Close</a>

```js
element.plainModal('close')
```

Hide the modal window.

### <a name ="initialize">Initialize</a>

```js
element.plainModal([options])
```

Initialize specified element as modal window.  
The [Open](#open) method can initialize too. This is used to initialize without showing the modal window at voluntary time.  
You can specify `options` to every [Open](#open) method. But, if `options` of an element isn't changed, re-initializing it isn't needed. Then, you specify `options` to only first [Open](#open) method, or use this method for initializing it only once.  
If you don't customize [Options](#options) (using default all), this method isn't needed because `options` isn't specified to [Open](#open) method, and element is initialized at only first time.

In this code, unneeded initializing is done again, again, and again.

```js
$('#open-button').click(function() {
  // Same initializing per every showing
  $('#modal').plainModal('open', {duration: 500});
});
```

In this code, initializing is done at once.

```js
// Initialize without showing
var modal = $('#modal').plainModal({duration: 500});
$('#open-button').click(function() {
  // Show without initializing
  modal.plainModal('open');
});
```

In this code, initializing is done at once.

```js
$('#open-button').click(function() {
  // Initializing is done at only first time
  modal.plainModal('open');
});
```

## <a name ="options">Options</a>

A `options` Object can be specified to [Open](#open) method or [Initialize](#initialize) method. This Object can have following properties.

### `offset`

Type: Object or Function  
Default: Calculated center position

A Object that has `left` and `top`, relative to the view area.

```js
$('#modal').plainModal({offset: {left: 100, top: 50}});
```

Or, a Function that returns above Object. This Function is called by [Open](#open) method, not [Initialize](#initialize) method. Therefore position be able to change according to the situation.

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

### `overlay`

Type: Object  
Default: `{color: '#888', opacity: 0.6, zIndex: 9000}`

A Object that can have `color` (fill-color), `opacity` and `zIndex` CSS properties of overlay.

```js
$('#modal').plainModal({overlay: {color: '#fff', opacity: 0.5}});
```

If you want to style the overlay more, add style to `plainmodal-overlay` class.

```css
.plainmodal-overlay {
  background-image: url('bg.png');
}
```

### `closeClass`

Type: String  
Default: `'plainmodal-close'`

If the element that has this class name is found, the [Close](#close) method is attached to `click` event of it.

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

A Object that can have `open` and `close` Functions for showing and hiding the modal window.  
These Functions are called with `duration` Number (see above) and `complete` Function.  
It's same to standard effect methods of jQuery (slideDown(), slideUp(), animate(), etc.). Therefore, those methods can be specified.

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

A `z-index` CSS property of the modal window. This number have to be bigger than `options.overlay.zIndex`.

### `open`

Type: Function  
Default: `undefined`

A `plainmodalopen` event handler. (see [Events](#events))

```js
$('#modal').plainModal({open: function(event) { console.log(event); } });
```

### `close`

Type: Function  
Default: `undefined`

A `plainmodalclose` event handler. (see [Events](#events))

```js
$('#modal').plainModal({close: function(event) { console.log(event); } });
```

## <a name ="events">Events</a>

### `plainmodalopen`

Triggered when the modal window is opened. (after the `effect.open` took `duration` to complete.)  
An event handler can be attached when initializing too via `options.open`. (see [Options](#options))

```js
$('#modal').on('plainmodalopen', function(event) {
  $('textarea', event.target).addClass('highlight');
});
```

### `plainmodalclose`

Triggered when the modal window is closeed. (after the `effect.close` took `duration` to complete.)  
An event handler can be attached when initializing too via `options.close`. (see [Options](#options))

```js
$('#modal').on('plainmodalclose', function(event) {
  $('#screen').show();
});
```

## Note

- As everyone knows, IE8- has many problems. CSS `position:fixed` in HTML without `<!DOCTYPE>` is ignored.  
If your web site supports IE8- and it use `position:fixed`, HTML must include `<!DOCTYPE>` even if plainModal is not used. And plainModal uses `position:fixed`.
- The [Initialize](#initialize) method set `display:'none'` to specified element. You can hide the element before Initialize method, by your stylesheet.

## See Also

[plainOverlay](http://anseki.github.io/jquery-plainoverlay) may be better, if you want the overlay that covers a page, elements or iframe-windows.

## Release History
 * 2014-06-30			v0.5.0			Add `plainmodal-overlay` class.
 * 2014-05-06			v0.4.1			Fix: If `options.duration` is 0, the status become invalid.
 * 2014-04-23			v0.4.0			Add custom events `plainmodalopen` and `plainmodalclose`
 * 2014-04-08			v0.3.2			Thicken overlay as default. (color, opacity)
 * 2014-03-10			v0.3.0			Add `options.zIndex` and `options.overlay.zIndex`
 * 2014-02-14			v0.2.0			`options.offset` accept Function
 * 2013-12-22			v0.1.1			Fix: scroll control
 * 2013-12-21			v0.1.0			Initial release.
