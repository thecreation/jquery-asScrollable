export default {
  namespace: 'asScrollable',

  skin: null,

  contentSelector: null,
  containerSelector: null,

  enabledClass: 'is-enabled',
  disabledClass: 'is-disabled',

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
};
