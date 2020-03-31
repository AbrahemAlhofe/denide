<template lang='pug'>
  div#index
    h1 Hello 🎉 … World 🌎
    span Denide,  Make your own big Story
</template>
<script>
export default {
  name : 'index',
  html : { head : { title : 'Welecome 🎉' } },
}
</script>
<style>
#index { text-align: center }
#index span {
  text-transform: uppercase;
}
</style>
