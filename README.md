# asScrollable

A jquery plugin that make a block element scrollable.

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/amazingSurge/jquery-asScrollable/master/dist/jquery.asScrollable.all.min.js
[max]: https://raw.github.com/amazingSurge/jquery-asScrollable/master/dist/jquery.asScrollable.all.js

In your web page:

```html
<link rel="stylesheet" href="css/asScrollable.css">

<div class="box">
	content here
</div>

<script src="jquery.js"></script>
<script src="dist/jquery-asScrollable.all.min.js"></script>
<script>
jQuery(function($) {
  $('.box').asScrollable({
    namespace: 'asScrollable',

    contentSelector: null,
    containerSelector: null,

    draggingClass: 'is-dragging',
    hoveringClass: 'is-hovering',
    scrollingClass: 'is-scrolling',

    direction: 'vertical', // vertical, horizontal, both, auto

    showOnHover: true,
    showOnBarHover: false,

    duration: 500,
    easing: 'ease-in', // linear, ease, ease-in, ease-out, ease-in-out

    responsive: true,
    throttle: 20,

    scrollbar: {}
  }); 
});
</script>
```

## Better Usage
If we supply two wrap div for the content, the dom will not redraw which may causing issues sometimes.

```html
<div class="box">
    <div>
        <div>
            content here
        </div>
    </div>
</div>

<script>
jQuery(function($) {
  $('.box').asScrollable({
    namespace: 'asScrollable',

    contentSelector: '>',
    containerSelector: '>'
  });
});
</script>
```
