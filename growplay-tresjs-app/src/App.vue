<script setup lang="ts">
import { TresCanvas } from "@tresjs/core";

import Model from "./components/Model-original.vue";
import { Vector3 } from "three";

import { OrbitControls } from "@tresjs/cientos";

import RendererTest from "./components/RendererTest.vue";

var cameraPosition = new Vector3(0, 2, 10);
var lookAt = new Vector3(0, 0, 0);

</script>

<template>
  <!-- window-size -->
  <TresCanvas :antialias="true" :alpha="true">
    <TresOrthographicCamera
      :args="[-10, 10, 5, -5, 0.1, 1000]"
      :position="cameraPosition"
      :look-at="lookAt"
    />
    <OrbitControls />

    <TresAmbientLight :intensity="5.5" />

    <renderer-test />
    <Suspense>
      <Model />
      <template #fallback>
        <div class="loading">Loading GrowPlay model...</div>
      </template>
    </Suspense>
  </TresCanvas>
</template>
<style>
html,
body,
#GP-app {
  width: 100%;
  height: 100%;
  margin: 0;
}

.vue-app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
  background: transparent;
}
</style>
