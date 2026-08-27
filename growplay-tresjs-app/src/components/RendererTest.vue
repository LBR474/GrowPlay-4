<script setup lang="ts">
import { useTres } from "@tresjs/core";
import { onMounted } from "vue";

const { renderer } = useTres();

onMounted(() => {
  //console.log("Tres renderer:", renderer);

  if (renderer) {
    renderer.setClearAlpha(0);
  }
});
</script>

<template>
  <TresObject3D />
</template>
