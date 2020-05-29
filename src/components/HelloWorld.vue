<template>
  <div class="hello">

  <div id="join" v-show="!joined">
		<h1>Join a video session</h1>
		<form @submit="joinSession">
			<p>
				<label>Session:</label>
				<input type="text" v-model="sessionId" required>
			</p>
			<p>
				<input type="submit" value="JOIN">
			</p>
		</form>
	</div>

  <div id="session" v-show="joined">
		<h1 v-text="sessionId"></h1>
		<input type="button" onclick="leaveSession()" value="LEAVE">
		<div>
			<div id="publisher"><h3>YOU</h3></div>
			<div id="subscriber"><h3>OTHERS</h3></div>
		</div>
	</div>

  </div>
</template>

<script>
// import { OpenVidu, Publisher, Session, StreamEvent, StreamManager, Subscriber } from 'openvidu-browser';
import { OpenVidu, Session} from 'openvidu-browser';
import JQuery from 'jquery';
let $ = JQuery;

export default {
  name: 'HelloWorld',
  data(){
    return{
      joined: false,
      OV: OpenVidu,
      session: Session,
      sessionId: "sessionA",
      // subscribers: StreamManager[] = [], // Remotes
      // mainStreamManager: StreamManager
      OPENVIDU_SERVER_URL: "https://" + location.hostname + ":4443",
      OPENVIDU_SERVER_SECRET: "MY_SECRET",

    };
  },
  props: {
    msg: String
  },
  methods:{
    joinSession: function(){
      console.log("in joinSession")
      this.OV = new OpenVidu();
      this.session = this.OV.initSession();

      this.session.on("streamCreated", function (event) {
        this.session.subscribe(event.stream, "subscriber");
      });

      this.getToken(this.sessionId).then(token => {
        
        this.session.connect(token)
          .then(() => {
            this.joined = true;
            var publisher = this.OV.initPublisher("publisher");
            this.session.publish(publisher);
          })
          .catch(error => {
            console.log("There was an error connecting to the session:", error.code, error.message);
          });
      });
    },


    /**
     * --------------------------
     * SERVER-SIDE RESPONSIBILITY
     * --------------------------
     * These methods retrieve the mandatory user token from OpenVidu Server.
     * This behavior MUST BE IN YOUR SERVER-SIDE IN PRODUCTION (by using
     * the API REST, openvidu-java-client or openvidu-node-client):
     *   1) Initialize a session in OpenVidu Server	(POST /api/sessions)
     *   2) Generate a token in OpenVidu Server		(POST /api/tokens)
     *   3) The token must be consumed in Session.connect() method
     */

    getToken: function(mySessionId){
      return this.createSession(mySessionId).then(sessionId => this.createToken(sessionId));
    },

    createSession(sessionId){
      return new Promise((resolve) => {
        $.ajax({
          type: "POST",
          url: this.OPENVIDU_SERVER_URL + "/api/sessions",
          data: JSON.stringify({ customSessionId: sessionId }),
          headers: {
            "Authorization": "Basic " + btoa("OPENVIDUAPP:" + this.OPENVIDU_SERVER_SECRET),
            "Content-Type": "application/json"
          },
          success: response => resolve(response.id),
          error: (error) => {
            if (error.status === 409) {
              resolve(sessionId);
            } else {
              console.log("sessionId is " + sessionId);
              console.log(error);
              console.warn('No connection to OpenVidu Server. This may be a certificate error at ' + this.OPENVIDU_SERVER_URL);
              if (window.confirm('No connection to OpenVidu Server. This may be a certificate error at ' + this.OPENVIDU_SERVER_URL + '\n\nClick OK to navigate and accept it. ' +
                'If no certificate warning is shown, then check that your OpenVidu Server is up and running at "' + this.OPENVIDU_SERVER_URL + '"')) {
                location.assign(this.OPENVIDU_SERVER_URL + '/accept-certificate');
                }
              }
          }
        });
      });
    },

    createToken: function(sessionId){
      console.log("create token function" + sessionId)
      return new Promise((resolve, reject) => {
        $.ajax({
        type: "POST",
        url: this.OPENVIDU_SERVER_URL + "/api/tokens",
        data: JSON.stringify({ session: sessionId }),
        headers: {
          "Authorization": "Basic " + btoa("OPENVIDUAPP:" + this.OPENVIDU_SERVER_SECRET),
          "Content-Type": "application/json"
        },
        success: response => resolve(response.token),
        error: error => reject(error)
        });
      });
    }
    
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
