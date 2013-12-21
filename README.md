# jQuery.plainModal

The simple jQuery Plugin for customizable modal windows. plainModal has basic functions only, and it does nothing for styles. It has no image files and no CSS files.  
Many great plugins already exist.

- The gorgeous plugins which has many functions and rich styles.
- The simple plugins which has small functions and customizable styles.

The many web sites use same functions almost. And these have different styles.  
plainModal has basic functions for showing modal windows. That's all. The styling it is your job. You can free style it to perfect match for your web site.

plainModal do:

- Showing specified element as modal window, and hiding it.
- Covering a page with a overlay.
- Avoiding focusing outer elements of modal window. (by pressing Tab key)
- Avoiding scrolling a page window.
- Hiding modal window when Escape key is pressed.

```js
$('#modal').plainModal('open'); // Show modal window. <div id="modal"> is styled via your CSS.
$('#modal').plainModal('close'); // Hide modal window.
```

## Methods

### <a name ="open">Open</a>

```js
element.plainModal('open'[, options])
```

Show specified element as modal window.  
If `options` (see [Options](#options)) is specified, element is initialized with specified `options` before it is shown. If element is not initialized yet, element is initialized even if `options` is not specified.  
A element can be initialized by new `options` any number of times.

### <a name ="close">Close</a>

```js
element.plainModal('close')
```

Hide modal window.

### <a name ="initialize">Initialize</a>

```js
element.plainModal([options])
```

Initialize specified element as modal window.  
The [Open](#open) method can initialize too. This is used to initialize without showing modal window at voluntary time.  
You can specify `options` to every [Open](#open) method. But, if `options` of a element isn't changed, re-initializing a element isn't needed. Then, you specify `options` to only first [Open](#open) method, or use this method for initializing only once.  
If you don't customize [Options](#options) (using default all), this method isn't needed because `options` isn't specified to [Open](#open) method, and element is initialized at only first time.

In this code, unneeded initializing is done again, again, and again.

```js
$('#open-button').click(function() {
  $('#modal').plainModal('open', {duration: 500}); // Same initializing per every showing
});
```

In this code, initializing is done at once.

```js
var modal = $('#modal').plainModal({duration: 500}); // Initialize only once
$('#open-button').click(function() {
  modal.plainModal('open'); // Show without initializing
});
```

In this code, initializing is done at once.

```js
$('#open-button').click(function() {
  modal.plainModal('open'); // Initializing is done at only first time
});
```

## <a name ="options">Options</a>

A `options` Object can be specified to [Open](#open) method or [Initialize](#initialize) method. This Object can have following properties.

### `offset`

Type: Object  
Default: Calculated center position

A Object that has `left` and `top`, relative to the view area.

```js
$('#modal').plainModal({offset: {left: 300, top: 100}});
```

### `overlay`

Type: Object  
Default: `{color: '#000', opacity: 0.3}`

A Object that has `color` and `opacity` of overlay.

### `closeClass`

Type: String  
Default: `'plainmodal-close'`

If the element that has this class name is found, the [Close](#close) method is attached to `click` event of it.

### `duration`

Type: Number  
Default: `200`

A number determining how long (milliseconds) the effect animation for showing and hiding modal window will run.

### `effect`

Type: Object  
Default: `{open: $.fn.fadeIn, close: $.fn.fadeOut}`

A Object that has `open` and `close` Functions for showing and hiding modal window.  
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
      this.css({display: 'block', marginTop: -100 - this.outerHeight()})
        .animate({marginTop: 0}, duration, complete);
    },
    close: function(duration, complete) {
      this.animate({marginTop: -100 - this.outerHeight()}, duration, function() {
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
      var self = this.css({display: 'block', color: '#fff', backgroundColor: '#fff'});
      setTimeout(function() {
        self.css({color: '', backgroundColor: ''});
        complete();
      }, 500);
    },
    close: function(duration, complete) {
      var self = this.css({color: '#fff', backgroundColor: '#fff'});
      setTimeout(function() {
        self.css({display: 'none'});
        complete();
      }, 500);
    }
  }
});
```

## Release History
 * 2013-12-21			v0.1.0			Initial release.
