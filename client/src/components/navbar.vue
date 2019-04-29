<template>
  <div>
    <div class="topnav" id="myTopnav">
      <a><router-link to="/">Home</router-link></a>
      <a><router-link to="/chatroom">Chatroom</router-link></a>
      <a v-if="!user.authenticated" ><router-link to="/login">Login</router-link></a>
      <a v-else><router-link to="/login">Profile</router-link></a>
    </div>
  </div>
</template>

<script>
import auth from '@/auth/'

export default {
  name: 'navbar',

  data () {
    return {
      user: auth.user
    }
  }
}
</script>

<style scoped>

</style>
