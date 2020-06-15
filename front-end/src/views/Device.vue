<template>
  <div class="home">
    <HelloWorld ref="HelloWorld"/>
  </div>
</template>

<script>
// @ is an alias to /src
import {mapState} from 'vuex';
import HelloWorld from '@/components/HelloWorld.vue';
// import router from '../router';

export default {
  name: 'Home',
  components: {
    HelloWorld
  },
  data(){
    return{
      deviceName:this.$route.params.name
    }
  },
  computed:{
    device(){
      return this.devices.find(
        device => device.device_name === this.deviceName
    )
    }
  },
  methods:{
    ...mapState(['devices']),
  },

  beforeRouteLeave (to, from, next) {
    this.$refs.HelloWorld.before_unload();
    next()
  },

  beforeRouteUpdate (to, from, next) {
    this.$refs.HelloWorld.before_unload();
    next()
  }
}
</script>