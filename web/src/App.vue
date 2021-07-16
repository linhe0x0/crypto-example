<template>
  <div class="btn" @click="sendRequest">Send Request</div>
</template>

<script>
import request from './services/request'

export default {
  setup() {
    const sendRequest = () => {
      request
        .post('/signature/verify', {
          userID: 1,
        })
        .then((response) => {
          alert(response.data)
        })
        .catch((err) => {
          alert(err.response.data.message)
        })
    }

    return {
      sendRequest,
    }
  },
}
</script>

<style>
body {
  display: flex;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial,
    sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
  background-color: #1a1a1a;
}

.btn {
  display: inline-block;
  padding: 18px 72px;
  border: 2px solid #1a1a1a;
  margin-top: 100px;
  border-radius: 4px;
  font-size: 14px;
  color: #1a1a1a;
  background-color: #fff;
  cursor: pointer;
  transition: border 0.2s, background 0.2s, color 0.2s ease-out;
}
.btn:hover {
  color: #fff;
  border-color: #fff;
  background-color: #1a1a1a;
}
</style>
