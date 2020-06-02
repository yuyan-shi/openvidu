<template>
  <div class="home">
    <p>this is the home page</p>
        <v-layout row wrap class="ma-4">
      <v-flex xs12 sm6 md4 lg3 v-for="device in devices" :key="device.id">
        <v-card 
          class="text-center ma-6"
          color="grey lighten-5"
        >
          <v-responsive class="pt-4">
            <v-avatar :color="device.color" size="100">
            </v-avatar>
            <v-card-text>
              <div class="heading font-weight-bold">{{device.title}}</div>
            </v-card-text>
          </v-responsive>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'Home',
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
}
</script>
