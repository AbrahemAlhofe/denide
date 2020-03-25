<template>
  <div id='navbar'>
    <router-link to="/">Greet</router-link>
    <router-link to="/about">About</router-link>
  </div>
</template>
<script>
export default {
  name : 'navbar'
}
</script>
<style lang='scss'>
#navbar {
  width: 100%;
  height: 3em;
  display: inline-block;
  a {
    color: black;
    text-decoration: none;
    padding: 10px;
    width: 4em;
    display: inline-block;
    text-align: center;
    &.router-link-exact-active {
      background: white;
    }
    &:first-child {
      border-radius: 10px 0px 0px 0px;
    }
  }
}
</style>
