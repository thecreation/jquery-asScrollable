# asScrollable

A jquery plugin that generate a styleable scrollbar for a block layout.

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/amazingsurge/jquery-asScrollable/master/dist/jquery.asScrollable.all.min.js
[max]: https://raw.github.com/amazingsurge/jquery-asScrollable/master/dist/jquery-asScrollable.all.js

In your web page:

```html
<div class="example">
	content here
</div>

<script src="jquery.js"></script>
<script src="dist/jquery-asScrollable.all.min.js"></script>
<script>
jQuery(function($) {
  $('.example').asScrollable({
    namespace: 'asScrollable',

    contentSelector: null,
    containerSelector: null,

    hoveringClass: 'is-hovering',

    direction: 'vertical', // vertical, horizontal, both, auto

    showOnHover: true,
    showOnBarHover: false,

    duration: '500',
    easing: 'swing',
    
    responsive: true,
    throttle: 20,

    scrollbar: {}
  }); 
});
</script>
```