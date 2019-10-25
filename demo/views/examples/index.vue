<template>
  <div class="example-content">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
}
</script>

<style lang='scss' scope>
.example-content {
  height: calc(100vh - 70px);
  padding-top: 10px;
  padding-left: 10px;
  section {
    height: 100%;
    .block-demo {
      margin-top: 0;
      height: calc(100vh - 150px);
    }
  }
}
</style>