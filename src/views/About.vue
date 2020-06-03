<template>
  <div class="home">
    <!-- <p>Team ID is {{ id }}</p> -->
    <HelloWorld :devices='id'/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue';
// import router from '../router';

export default {
  name: 'Home',
  components: {
    HelloWorld
  },
  created(){
    this.id = this.$route.params.id;
  }
}
</script>