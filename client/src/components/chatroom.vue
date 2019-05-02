<template>
  <div>
      <v-card v-if="!user.authenticated" class="pl-3 pr-3 pt-5 pb-5 mt-5">
        <h3 class="text-xs-center mb-3">Must sign in to access this chatroom.</h3>
        <button large><router-link to="/login">Sign In</router-link></button>
      </v-card>

      <div v-else>
      <div class="chat_window">
        <div class="top_menu">
          <div class="buttons">
            <div class="button close"></div>
            <div class="button minimize"></div>
            <div class="button maximize"></div>
          </div>
          <div class="title">Chat</div>
        </div>

        <ul class="messages" ref="chatContainer">
          <div v-for="chat in this.chatsAll">

            <li v-if="isMyHandle(chat.handle)" class="message right appeared">
              <div class="avatar" style="padding-top: 22px;">{{chat.handle}}</div>
              <div class="text_wrapper">
                <div class="text"><div style="font-size: 9px; font-weight: 900;" v-if="chat.receiver != 'all'">Private to {{chat.receiver}}: </div> {{chat.message}}</div>
              </div>
            </li>

            <li v-else class="message left appeared">
              <div class="avatar" style="padding-top: 22px;">{{chat.handle}}</div>
              <div class="text_wrapper">
                <div class="text"><div style="font-size: 9px; font-weight: 900;" v-if="chat.receiver != 'all'"> Private to {{chat.receiver}}: </div>{{chat.message}}</div>
              </div>
            </li>

        </div>
        </ul>

        <div class="bottom_wrapper clearfix">
          <form style="width:100%" @submit.prevent="sendMessage">
            <div class="message_input_wrapper">
              <input class="message_input" v-model="message" placeholder="Type your message here..." required/>
            </div>
            <button type="submit">
              <div class="send_message">
                <div class="icon"></div>
                <div class="text">Send</div>
              </div>
            </button>
          </form>
        </div>

      </div>

      <div class="message_template">
        <li class="message">
          <div class="avatar">
          </div>
          <div class="text_wrapper">
            <div class="text">
            </div>
          </div>
        </li>
      </div>

  </div>


  <img src="/static/desert.png" ref="preview">
  <canvas style="display:none;" ref='canvas'></canvas>

</div>
</template>

<script>
import {mapGetters} from 'vuex'
import auth from '@/auth/'
// import steganography from '@/steganography/'
import Swal from 'sweetalert2'

export default {

  data () {
    return {
      user: auth.user,
      handle: '',
      message: '',
      chatsAll: []
    }
  },

  components: {
  },

  watch: {
    CHATS(){
      this.decryptAll(this.$store.getters.CHATS)
    }
  },

  computed: {

    async CHATS() {
        return this.$store.getters.CHATS
    },

    HANDLE() {
        return this.$store.getters.HANDLE;
    }

  },

  created () {
    auth.checkAuth()
    this.handle = auth.getUser().username
  },

  mounted () {
    if (this.user.authenticated) {
      this.$store.dispatch('SET_CHAT', auth.getUser().username)
      this.$socket.emit('join', {username: auth.getUser().username})
    }
  },

  updated () {
    var container = this.$refs.chatContainer
    container.scrollTop = container.scrollHeight
  },

  sockets: {
    connect: function () {
      this.$socket.emit('join', {username: auth.getUser().username})
      // console.log('socket connected')
    },
    chat: function (val) {
      this.$store.dispatch('ADD_CHAT', val)
    }
  },

  methods: {
    async sendMessage () {
      await auth.checkAuth()
      if (this.user.authenticated) {
        let handle2 = this.$store.getters.HANDLE
        if (handle2 === '') {
          handle2 = auth.getUser().username
        }

        if (this.message) {
          if (this.message.charAt(0) === '@') {
            var receiver = this.message.replace(/ .*/, '').slice(1)
            let userExists = await auth.checkIfUserExists(receiver)
            if (userExists) {
              this.message = this.message.substr(this.message.indexOf(' ') + 1)
              if (this.message.charAt(0) !== '@') {
                let message = {
                  handle: handle2,
                  receiver: receiver,
                  message: this.encryptText(this.message)
                }
                await this.$socket.emit('chatprivate', message)
                this.message = ''
              } else {
                Swal.fire({
                  title: 'Error!',
                  text: 'Please type your message',
                  type: 'error',
                  confirmButtonText: 'Close'
                })
              }
            } else {
              Swal.fire({
                title: 'Error!',
                text: 'User doesn\'t exist',
                type: 'error',
                confirmButtonText: 'Close'
              })
              this.message = ''
            }
          } else {
            let message = {
              handle: handle2,
              message: this.encryptText(this.message)
            }
            await this.$socket.emit('chat', message)
            this.message = ''
          }
        }
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Must Sign In To Chat',
          type: 'error',
          confirmButtonText: 'Close'
        })
        this.message = ''
      }
    },

    encryptText: function (msg) {
      var mask =  new ImageMask({
          debug :  false,
          charSize :  16,
          mixCount :  2,
          lengthSize :  24
       });

       var canvas = this.$refs.canvas

       var message = msg;
    	 var preview = this.$refs.preview;
       preview.src = '/static/desert.png'
    	 var ctx = canvas.getContext('2d');
       ctx.clearRect(0, 0, canvas.width, canvas.height);
    	 ctx.drawImage(preview, 0, 0, preview.width, preview.height);
    	 mask.hideText(canvas, message);

       return canvas.toDataURL();
    },


    decryptText: function(chat, callback) {
      var mask =  new ImageMask({
          debug :  false,
          charSize :  16,
          mixCount :  2,
          lengthSize :  24
       });

       var canvas = this.$refs.canvas;
       var preview = this.$refs.preview;

      this.passImageToCanvas(mask, canvas, chat, function(msg){
        preview.src = '/static/desert.png'
        callback(msg)
      })
    },


    passImageToCanvas(mask, canvas, chat, cb){
        var ctx = canvas.getContext('2d');
        var img = new Image;
        img.onload = async function(message) {
            ctx.drawImage(img,0,0);
            var message = await mask.revealText(canvas);
            cb(message)
        };
        img.src = chat
    },

    decryptAll(array){
      this.chatsAll = []
      var a;
      for (a in array) {
        var self = this;

        this.decryptText(array[a].message, function(msg){
          let message = {
            handle: array[a].handle,
            receiver: array[a].receiver,
            message: msg
          }

          self.chatsAll.push(message)
          // console.log(self.CHATS);

        })

      }
    },

    isMyHandle (handle) {
      if (handle === auth.getUser().username) {
        return true
      } else {
        return false
      }
    },

    saveHandle () {
      this.$store.dispatch('SET_HANDLE', this.handle)
    }

  }

}

</script>

<style>

.chat_window {
  position: absolute;
  width: calc(100% - 20px);
  max-width: 800px;
  height: 500px;
  border-radius: 10px;
  background-color: #fff;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  background-color: #f8f8f8;
  overflow: hidden;
}

.top_menu {
  background-color: #fff;
  width: 100%;
  padding: 20px 0 15px;
  box-shadow: 0 1px 30px rgba(0, 0, 0, 0.1);
}
.top_menu .buttons {
  margin: 3px 0 0 20px;
  position: absolute;
}
.top_menu .buttons .button {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 10px;
  position: relative;
}
.top_menu .buttons .button.close {
  background-color: #f5886e;
  pointer-events: none;

}
.top_menu .buttons .button.minimize {
  background-color: #fdbf68;
}
.top_menu .buttons .button.maximize {
  background-color: #a3d063;
}
.top_menu .title {
  text-align: center;
  color: #bcbdc0;
  font-size: 20px;
}

.messages {
  position: relative;
  list-style: none;
  padding: 20px 10px 0 10px;
  margin: 0;
  height: 347px;
  overflow: scroll;
}
.messages .message {
  clear: both;
  overflow: hidden;
  margin-bottom: 20px;
  transition: all 0.5s linear;
  opacity: 0;
}
.messages .message.left .avatar {
  background-color: #f5886e;
  float: left;
}
.messages .message.left .text_wrapper {
  background-color: #ffe6cb;
  margin-left: 20px;
}
.messages .message.left .text_wrapper::after, .messages .message.left .text_wrapper::before {
  right: 100%;
  border-right-color: #ffe6cb;
}
.messages .message.left .text {
  color: #c48843;
}
.messages .message.right .avatar {
  background-color: #fdbf68;
  float: right;
}
.messages .message.right .text_wrapper {
  background-color: #c7eafc;
  margin-right: 20px;
  float: right;
}
.messages .message.right .text_wrapper::after, .messages .message.right .text_wrapper::before {
  left: 100%;
  border-left-color: #c7eafc;
}
.messages .message.right .text {
  color: #45829b;
}
.messages .message.appeared {
  opacity: 1;
}
.messages .message .avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: inline-block;
}
.messages .message .text_wrapper {
  display: inline-block;
  padding: 20px;
  border-radius: 6px;
  width: calc(100% - 85px);
  min-width: 100px;
  position: relative;
}
.messages .message .text_wrapper::after, .messages .message .text_wrapper:before {
  top: 18px;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.messages .message .text_wrapper::after {
  border-width: 13px;
  margin-top: 0px;
}
.messages .message .text_wrapper::before {
  border-width: 15px;
  margin-top: -2px;
}
.messages .message .text_wrapper .text {
  font-size: 18px;
  font-weight: 300;
}

.bottom_wrapper {
  position: relative;
  width: 100%;
  background-color: #fff;
  padding: 20px 20px;
  position: absolute;
  bottom: 0;
}
.bottom_wrapper .message_input_wrapper {
  display: inline-block;
  height: 50px;
  border-radius: 25px;
  border: 1px solid #bcbdc0;
  width: calc(100% - 160px);
  position: relative;
  padding: 0 20px;
}
.bottom_wrapper .message_input_wrapper .message_input {
  border: none;
  height: 100%;
  box-sizing: border-box;
  width: calc(100% - 40px);
  /* position: absolute; */
  outline-width: 0;
  color: gray;
}
.bottom_wrapper .send_message {
  width: 140px;
  height: 50px;
  display: inline-block;
  border-radius: 50px;
  background-color: #a3d063;
  border: 2px solid #a3d063;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s linear;
  text-align: center;
  /* float: right; */
}
.bottom_wrapper .send_message:hover {
  color: #a3d063;
  background-color: #fff;
}
.bottom_wrapper .send_message .text {
  font-size: 18px;
  font-weight: 300;
  display: inline-block;
  line-height: 48px;
}

.message_template {
  display: none;
}

</style>
