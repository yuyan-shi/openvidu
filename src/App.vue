<template>
  <v-app>
    <router-view/>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  components: {
  },

  data(){
    return{
      devices: [
        {
          id: 1, 
          title:"Home Camera Series 1",
          session_id:"camera1",
          color:"indigo lighten-2"
        },
        {
          id: 2,
          title:"Home Camera XXUN",
          session_id:"/camera2",
          color:"teal ligthen-5"
        }
      ]
    }
  },
};
</script>
