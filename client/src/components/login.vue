<template>
  <div>
    <div v-if="!user.authenticated">
      <form v-if="type == 'signin'" @submit.prevent="login">
        <div class="box">

          <!-- if type == 'login' display the login box -->
          <div>
            <h1>Sign In</h1>

            <input placeholder="email" type="text" name="email" value="email" v-model="username" class="email" required/>
            <input placeholder="password" type="password" name="password" value="password" v-model="password" class="email" required/>

            <button style="display:contents" type="submit"><div class="btn">Sign In</div></button>
            <a v-on:click="type = 'signup'"><div id="btn2">Sign Up</div></a>
          </div>
        </div>
      </form>
        <!-- if type == 'signup' display the signup box -->

        <form v-if="type == 'signup'" @submit.prevent="signup">
          <div class="box">

            <!-- if type == 'login' display the login box -->
            <div>
              <h1>Sign Up</h1>

              <input placeholder="username" type="username" name="username" value="username" class="email" v-model="username" required/>
              <input placeholder="email" type="email" name="email" value="email" class="email" v-model="email" required/>
              <input placeholder="password" type="password" name="password" value="password" class="email" v-model="password" required/>

              <button style="display:contents" type="submit"><div class="btn">Sign Up</div></button>
              <a v-on:click="type = 'signin'"><div id="btn2">Sign In</div></a>
            </div>
          </div>
        </form>
  </div>

  <div div v-else>
    <div style="padding-top: 3%;">
      <div class="row">
          <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12" style="border-radius: 16px;">
              <div class="well profile col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 text-center">
                      <figure>
                           <img src="https://static.thenounproject.com/png/363633-200.png" alt="" class="img-circle" style="width:75px;" id="user-img">
                      </figure>
                      <h5 style="text-align:center;"><strong id="user-name">{{profile.username}}</strong></h5>
                      <p style="text-align:center;font-size: smaller;overflow-wrap: break-word;" id="user-email">{{profile.email}} </p>
                      <p style="text-align:center;font-size: smaller;"><strong>Status: </strong><span class="tags" id="user-status">Active</span></p>
                      <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 divider text-center"></div>
                    </div>
                  </div>
              </div>
          </div>
    </div>
    <a v-on:click="logout()"><div style="float: inherit; margin-right: 16px;" class="btn">Sign Out</div></a>
  </div>

  </div>
</template>

<script>

import env from '@/env/'
import auth from '@/auth/'
import Swal from 'sweetalert2'

export default {
  name: 'login',

  data () {
    return {
      email: '',
      username: '',
      password: '',
      user: auth.user,
      profile: '',
      type: 'signin'
    }
  },

  beforeCreated () {
  },

  created () {
    auth.checkAuth()
    this.profile = auth.getUser()
  },

  methods: {
    signup: function () {
      this.$http.post(env.URL + '/user/', {
        email: this.email,
        username: this.username,
        password: this.password
      }).then((response) => {
        this.type = 'signin'
      }).catch((error) => {
        Swal.fire({
          title: 'Error!',
          text: error.data.error,
          type: 'error',
          confirmButtonText: 'Close'
        })
      })
    },

    login: function () {
      this.$http.post(env.URL + '/user/authenticate', {
        username: this.username,
        password: this.password
      }).then((response) => {
        let data = {
          token: response.body.data.token,
          user: JSON.stringify(response.body.data.user)
        }
        auth.login(data)
        this.profile = auth.getUser()
        this.$store.dispatch('SET_HANDLE', this.username)
      }).catch((error) => {
        Swal.fire({
          title: 'Error!',
          text: error.data.error,
          type: 'error',
          confirmButtonText: 'Close'
        })
      })
    },

    logout: function () {
      auth.logout()
    }

  }
}

</script>

<style scoped>

.box{
  background:white;
  width:300px;
  border-radius:6px;
  margin: 0 auto 0 auto;
  padding:0px 0px 70px 0px;
  border: #2980b9 4px solid;
  margin-top: 5%;

}

.email{
  background:#ecf0f1;
  border: #ccc 1px solid;
  border-bottom: #ccc 2px solid;
  padding: 8px;
  width:250px;
  color:#AAAAAA;
  margin-top:10px;
  font-size:1em;
  border-radius:4px;
}

.password{
  border-radius:4px;
  background:#ecf0f1;
  border: #ccc 1px solid;
  padding: 8px;
  width:250px;
  font-size:1em;
}

.btn{
  background:#2ecc71;
  width:125px;
  padding-top:5px;
  padding-bottom:5px;
  color:white;
  border-radius:4px;
  border: #27ae60 1px solid;

  margin-top:20px;
  margin-bottom:20px;
  float:left;
  margin-left:16px;
  font-weight:800;
  font-size:0.8em;
}

.btn:hover{
  background:#2CC06B;
}

#btn2{
  float:left;
  background:#3498db;
  width:125px;  padding-top:5px;
  padding-bottom:5px;
  color:white;
  border-radius:4px;
  border: #2980b9 1px solid;

  margin-top:20px;
  margin-bottom:20px;
  margin-left:10px;
  font-weight:800;
  font-size:0.8em;
}

</style>
