<template>
  <div id='app'>
    <div id='layout' :data-page='$route.name'>
      <navbar></navbar>
      <div id='boxView'>
        <router-view />
      </div>
      <div id='sentence'> open console 👩‍💻 </div>
      <footer>made with ❤ and ☕ by <a href='https://twitter.com/AbrahemAlhofe'>@AbrahemAlhofe</a> </footer>
    </div>
  </div>
</template>
<script>
import navbar from '@/components/navbar.vue';
export default {
  components : { navbar }
}
</script>
<style lang='scss'>
* {
  font-family: 'Cairo', sans-serif;
}

body {
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #42B883;
}

#boxView {
  background-color: white;
  padding: 10px;
  width: 30em;
  height: 13em;
  border-radius: 0px 0px 15px 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
}

footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  right: 0px;
  text-align: center;
  a {
    color: white;
    text-decoration: none;
  }
}

#layout {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#sentence {
  font-family: monospace;
  padding: 10px;
  font-size: 20px;
}
</style>
