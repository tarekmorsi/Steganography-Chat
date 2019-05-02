<template>
  <div>
    <h1>Steganography Chat</h1>
    <div>

      <img src="/static/desert.png" ref="preview">
      <canvas ref='canvas' style="display:none;"></canvas>
      <img ref='output'/>


      <!-- <canvas src="/static/desert.png" height="42" width="42" ref="output">
      <canvas src="" height="42" width="42" ref="canvas"> -->

      <a v-on:click="encryptTest">Encrypt</a>
      <a v-on:click="decryptText">Decrypt</a>

    </div>
    <br>

  </div>
</template>

<script>

export default {
  name: 'test',

  data () {
    return {
      text: 'lala'
    }
  },

  methods: {
    encryptTest: function (msg) {
      var mask =  new ImageMask({
          debug :  false,
          charSize :  16,
          mixCount :  2,
          lengthSize :  24
       });

       var canvas = this.$refs.canvas

       var message = msg;
    	 var preview = this.$refs.preview;
    	 var ctx = canvas.getContext('2d');
    	 ctx.drawImage(preview, 0, 0, preview.width, preview.height);
    	 mask.hideText(canvas, message);

       return canvas.toDataURL();
    },


    decryptText: function() {
      var mask =  new ImageMask({
          debug :  false,
          charSize :  16,
          mixCount :  2,
          lengthSize :  24
       });

      var canvas = this.$refs.canvas
      var message = mask.revealText(canvas);
      console.log(message)
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
