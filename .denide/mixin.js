import { mergeAndConcat } from 'merge-anything';
import json2html from './json2html';

const mixin = {};

mixin.created = function() {
  // Head Management
  if (typeof this.$options.head !== "function") return;
  const head = this.$options.head.call(this) || {};
  
  if (typeof window !== "object") {
    this.$ssrContext.head = mergeAndConcat(head, this.$ssrContext.head)
  } else json2html({ head }, document)
};

export default mixin
