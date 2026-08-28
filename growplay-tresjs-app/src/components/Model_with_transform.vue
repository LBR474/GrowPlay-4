```vue
<script setup lang="ts">

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

import { watch, 
  //ref, 
  shallowRef } from "vue";

  import * as THREE from 'three';

import { Mesh, Group, BufferGeometry, Material, type BufferGeometryEventMap, type MaterialEventMap, type NormalBufferAttributes, type Object3DEventMap, Box3 } from "three";


// ============================================================
// MODEL PATH
// ============================================================

const modelPath = import.meta.env.DEV
  ? "/models/GrowPlay-minimized-1.glb"
  : "./ts/models/GrowPlay-minimized-1.glb";


// ============================================================
// GLTF LOADER + MESHOPT DECODER
// ============================================================

const loader = new GLTFLoader();

loader.setMeshoptDecoder(MeshoptDecoder);


// ============================================================
// REACTIVE GLTF STATE
// ============================================================

const state = shallowRef<any>(null);


// ============================================================
// LOAD MODEL
// ============================================================

loader.load(
  modelPath,

  (gltf) => {

    console.log("========================================");
    console.log("MODEL LOADED");
    console.log("========================================");

    state.value = gltf;

  },

  undefined,

  (error) => {

    console.error("ERROR LOADING GLB:", error);

  }
);


// ============================================================
// WATCH LOADED MODEL
// ============================================================

watch(
  state,
  (gltf) => {

    if (!gltf) return;


    // ============================================================
    // EVERYTHING BELOW HERE CAN STAY AS BEFORE
    // ============================================================



    console.log("========================================");
    console.log("GROWPLAY TRANSFORM EXPERIMENT");
    console.log("========================================");


    // ============================================================
    // NAMES WE EXPECT TO FIND
    // ============================================================

    const letters = [

      "g",
      "r",
      "o",
      "w",
      "p",
      "l-L",
      "a",
      "y",
      "text007",

      "logo_yellow",
      "logo_dark_green",
      "logo_light_green",

    ];


    // ============================================================
    // CREATE GROUPS
    // ============================================================

    const letterGroup = new Group();

    letterGroup.name = "GrowPlayLetters";


    const climbingFrameGroup = new Group();

    climbingFrameGroup.name = "ClimbingFrame";


    gltf.scene.add(letterGroup);

    gltf.scene.add(climbingFrameGroup);


    // ============================================================
    // FIND LETTERS + LOGO
    // ============================================================

    console.log("----------------------------------------");
    console.log("LOOKING FOR LETTERS + LOGO");
    console.log("----------------------------------------");


    letters.forEach((letterName) => {

      const object = gltf.scene.getObjectByName(letterName);


      if (object) {

        console.log("FOUND:", letterName);

        letterGroup.attach(object);

      } else {

        console.log("NOT FOUND:", letterName);

      }

    });


    // ============================================================
    // PUT EVERYTHING ELSE INTO CLIMBING FRAME
    // ============================================================

    const frameMeshes: Mesh[] = [];


    gltf.scene.traverse((object: Mesh<BufferGeometry<NormalBufferAttributes, BufferGeometryEventMap>, Material<MaterialEventMap> | Material<MaterialEventMap>[], Object3DEventMap>) => {

      if ((object as Mesh).isMesh) {

        const mesh = object as Mesh;


        if (!letters.includes(mesh.name)) {

          frameMeshes.push(mesh);

        }

      }

    });


   frameMeshes.forEach((mesh) => {

  climbingFrameGroup.attach(mesh);

});


// ============================================================
// EXPERIMENT — CLONE ONE LONG UPRIGHT
// ============================================================
// ============================================================
// EXPERIMENT — CLONE ONE LONG UPRIGHT
// POSITION IT ONE CROSS-PIECE LENGTH AWAY
// ============================================================

const originalUpright = climbingFrameGroup.getObjectByName(
  "Long_upright_left_end_front"
) as Mesh;

const crossPiece = climbingFrameGroup.getObjectByName(
  "cross_piece_1"
) as Mesh;
const tpiece = climbingFrameGroup.getObjectByName(
  "t-piece_1"
) as Mesh;

const foot_cup = climbingFrameGroup.getObjectByName(
  "Foot_cup007"
) as Mesh;

const elbow_piece = climbingFrameGroup.getObjectByName(
  "Elbow_piece002"
) as Mesh;

const joiner_sleeve = climbingFrameGroup.getObjectByName(
  "Joiner_sleeve3"
) as Mesh;
if (originalUpright && crossPiece && tpiece && foot_cup && elbow_piece && joiner_sleeve) {

  // ------------------------------------------------------------
  // Get cross-piece dimensions
  // ------------------------------------------------------------

  const box = new Box3().setFromObject(crossPiece);

  const size = box.getSize(new THREE.Vector3());

  const tpbox = new Box3().setFromObject(tpiece);

  const tpSize = tpbox.getSize(new THREE.Vector3());

  console.log("Cross-piece dimensions:", size);
  console.log("T-piece dimensions:", tpSize);


  // ------------------------------------------------------------
  // Clone alll parts and position them one cross-piece length away
  // ------------------------------------------------------------

  const clonedUpright = originalUpright.clone();

  clonedUpright.name = "Long_upright_CLONE";

  clonedUpright.position.z -= (size.z + tpSize.z);

  const clonedFootCup = foot_cup.clone();
  clonedFootCup.name = "foot_cup_CLONE";
  clonedFootCup.position.z -= (size.z + tpSize.z);

  const clonedElbowPiece = elbow_piece.clone();
  clonedElbowPiece.name = "elbow_piece_CLONE";
  clonedElbowPiece.position.z -= (size.z + tpSize.z);

  const clonedJoinerSleeve = joiner_sleeve.clone();
  clonedJoinerSleeve.name = "joiner_sleeve_CLONE";
  clonedJoinerSleeve.position.z -= (size.z + tpSize.z);

  climbingFrameGroup.add(clonedUpright);
  climbingFrameGroup.add(clonedFootCup);
  climbingFrameGroup.add(clonedElbowPiece);
  climbingFrameGroup.add(clonedJoinerSleeve);

  console.log(
    "CLONED UPRIGHT:",
    clonedUpright.name,
    "Z position:",
    clonedUpright.position.z
  );

}

    console.log("----------------------------------------");
console.log("ENTIRE SCENE HIERARCHY");
console.log("----------------------------------------");

gltf.scene.traverse((object: { type: any; name: any; children: string | any[]; }) => {

  console.log(
    "TYPE:",
    object.type,
    "| NAME:",
    object.name,
    "| CHILDREN:",
    object.children.length
  );

});


    // ============================================================
    // LOG GROUP CONTENTS
    // ============================================================

    console.log("----------------------------------------");
    console.log("LETTER GROUP");
    console.log("----------------------------------------");


    letterGroup.traverse((object) => {

      if ((object as Mesh).isMesh) {

        console.log("LETTER GROUP:", object.name);

      }

    });


    console.log("----------------------------------------");
    console.log("CLIMBING FRAME GROUP");
    console.log("----------------------------------------");


    climbingFrameGroup.traverse((object) => {

      if ((object as Mesh).isMesh) {

        console.log("CLIMBING FRAME:", object.name);

      }

    });


    // ============================================================
    // SUMMARY
    // ============================================================

    console.log("----------------------------------------");
    console.log("SUMMARY");
    console.log("----------------------------------------");

    console.log(
      "Letter group children:",
      letterGroup.children.length
    );

    console.log(
      "Climbing frame children:",
      climbingFrameGroup.children.length
    );


    console.log("========================================");
    console.log("END TRANSFORM EXPERIMENT");
    console.log("========================================");

  },

  { immediate: true }
);

</script>


<template>

  <primitive
    v-if="state"
    :object="state.scene"
    :position="[-0.6, -3.5, 1.0]"
    :scale="[1.0, 2.8, 1.0]"
  />

</template>
```
