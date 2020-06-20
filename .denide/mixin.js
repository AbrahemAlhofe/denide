const mixin = {}

mixin.serverPrefetch = async function () {
  if ( typeof this.$options.asyncData === 'function' ) { await this.$options.asyncData.call(this) }
}

mixin.mounted = async function () {
  if ( typeof this.$options.asyncData === 'function' ) { await this.$options.asyncData.call(this) }
}

mixin.created = async function () {
  // Head Management
  if ( typeof this.$options.head !== 'function' ) return
  const head = this.$options.head.call(this) || {}

  if ( typeof window !== 'object' ) {
    this.$ssrContext.head = Object.assign(head, this.$ssrContext.head)
  } else {
    document.title = head.title
  }
}

// Register Plugin
module.exports = mixin
