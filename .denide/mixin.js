const mixin = {};

mixin.created = function() {
  // Head Management
  if (typeof this.$options.head !== "function") return;
  const head = this.$options.head.call(this) || {};

  if (typeof window !== "object") {
    this.$ssrContext.head = Object.assign(head, this.$ssrContext.head);
  } else document.title = head.title;
};

// Register Plugin
module.exports = mixin;
