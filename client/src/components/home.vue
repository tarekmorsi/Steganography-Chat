<template>
  <div>
    <h1>Steganography Chat</h1>
    <p style="width: 36%; margin: auto;">
      Steganography is simply the art of hiding data within data. For example, you could hide
      some text within the pixels of an image, within the pixels of a given frame of a video.
      In this project, we implement a decentralized P2P chat application which applies steganographic
      techniques to relay secret messages back and forth between multiple users.
    </p>
    <br>
    <div class="blue-square-container">
      <div class="blue-square">
        <img src="https://media.giphy.com/media/26FPJGjhefSJuaRhu/giphy.gif" style="max-width: 100%"/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'home',

  data () {
    return {
    }
  }
}
</script>

<style scoped>
h1,
h3 {
  text-align: center;
  margin-top: 5%;
}
.blue-square-container {
  text-align: center;
}
.blue-square {
  /* background-color: #0074D9; */
  width: 100px;
  height: 100px;
  display: inline-block;
}
</style>
