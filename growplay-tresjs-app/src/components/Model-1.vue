<script setup lang="ts">
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

import { watch, shallowRef } from "vue";
import { Mesh, Group } from "three";
import * as THREE from "three";
import gsap from "gsap";


// ============================================================
// MODEL PATH
// ============================================================

const modelPath = import.meta.env.DEV
  ? "/models/GrowPlay-5.glb"
  : "./ts/models/GrowPlay-5.glb";


// ============================================================
// GLTF LOADER
// ============================================================

const loader = new GLTFLoader();


// ============================================================
// MESHOPT DECODER
// ============================================================

loader.setMeshoptDecoder(MeshoptDecoder);


// ============================================================
// DRACO DECODER
// ============================================================

const dracoLoader = new DRACOLoader();

dracoLoader.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
);

loader.setDRACOLoader(dracoLoader);


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

    console.log("MODEL LOADED");

    state.value = gltf;

  },

  undefined,

  (error) => {

    console.error("ERROR LOADING GLB:", error);

  },
);


// ============================================================
// WATCH LOADED MODEL
// ============================================================

watch(
  state,

  (gltf) => {

    if (!gltf) return;


    // ============================================================
    // CREATE GROUPS
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
      "logo_yellow",
      "logo_dark_green",
      "logo_light_green",
    ];


    const letterGroup = new Group();

    letterGroup.name =
      "GrowPlayLetters";


    const climbingFrameGroup =
      new Group();

    climbingFrameGroup.name =
      "ClimbingFrame";


    // Temporary scale adjustment

    climbingFrameGroup.scale.y += 0.2;


    gltf.scene.add(letterGroup);

    
    gltf.scene.add(climbingFrameGroup);


    // ============================================================
    // ADD LETTERS + LOGO
    // ============================================================

    letters.forEach((letterName) => {

      const letter =
        gltf.scene.getObjectByName(letterName);


      if (letter) {

        letterGroup.attach(letter);

      } else {

        console.log(
          "Could not find:",
          letterName
        );

      }

    });


    // ============================================================
    // ADD EVERYTHING ELSE TO CLIMBING FRAME
    // ============================================================

    const frameMeshes: Mesh[] = [];


    gltf.scene.traverse(
      (object: THREE.Object3D) => {

        if ((object as Mesh).isMesh) {

          const mesh =
            object as Mesh;


          if (!letters.includes(mesh.name)) {

            frameMeshes.push(mesh);

          }

        }

      }
    );


    frameMeshes.forEach((mesh) => {

      climbingFrameGroup.attach(mesh);

    });


    // ============================================================
    // GIVE FOOT MESHES THEIR OWN MATERIAL
    // ============================================================

    climbingFrameGroup.traverse((object) => {

      if ((object as Mesh).isMesh) {

        const mesh =
          object as Mesh;


        if (
          mesh.name
            .toLowerCase()
            .includes("foot")
        ) {

          if (Array.isArray(mesh.material)) {

            mesh.material =
              mesh.material.map(
                (material) =>
                  material.clone()
              );

          } else {

            mesh.material =
              mesh.material.clone();

          }

        }

      }

    });


    // ============================================================
    // GIVE SLEEVE MESHES THEIR OWN MATERIAL
    // ============================================================

    climbingFrameGroup.traverse((object) => {

      climbingFrameGroup.rotation.y = Math.PI / 4;


      if ((object as Mesh).isMesh) {

        const mesh =
          object as Mesh;


        if (
          mesh.name
            .toLowerCase()
            .includes("sleeve")
        ) {

          if (Array.isArray(mesh.material)) {

            mesh.material =
              mesh.material.map(
                (material) =>
                  material.clone()
              );

          } else {

            mesh.material =
              mesh.material.clone();

          }

        }

      }

    });


    // ============================================================
    // GIVE LONG UPRIGHTS THEIR OWN MATERIALS
    // ============================================================

    climbingFrameGroup.traverse((object) => {

      if ((object as Mesh).isMesh) {

        const mesh =
          object as Mesh;


        if (
          mesh.name
            .toLowerCase()
            .includes("long_upright")
        ) {

          if (Array.isArray(mesh.material)) {

            mesh.material =
              mesh.material.map(
                (material) =>
                  material.clone()
              );

          } else {

            mesh.material =
              mesh.material.clone();

          }

        }

      }

    });


    // ============================================================
    // GIVE T-PIECES THEIR OWN MATERIALS
    // ============================================================

    climbingFrameGroup.traverse((object) => {

      if ((object as Mesh).isMesh) {

        const mesh =
          object as Mesh;


        if (
          mesh.name
            .toLowerCase()
            .includes("piece")
        ) {

          if (Array.isArray(mesh.material)) {

            mesh.material =
              mesh.material.map(
                (material) =>
                  material.clone()
              );

          } else {

            mesh.material =
              mesh.material.clone();

          }

        }

      }

    });


    // ============================================================
    // MAKE ENTIRE CLIMBING FRAME INVISIBLE
    // ============================================================

    climbingFrameGroup.traverse((object) => {

      if ((object as Mesh).isMesh) {

        const mesh =
          object as Mesh;


        const materials =
          Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];


        materials.forEach((material) => {

          material.transparent = true;

          material.opacity = 0;

        });

      }

    });


    // ============================================================
    // REVEAL FOOT CUPS SEQUENTIALLY
    // ============================================================

    const footCups: Mesh[] = [];


    climbingFrameGroup.traverse((object) => {

      if ((object as Mesh).isMesh) {

        const mesh =
          object as Mesh;


        if (
          mesh.name
            .toLowerCase()
            .includes("foot")
        ) {

          footCups.push(mesh);

        }

      }

    });


    footCups.forEach((mesh, index) => {

      const materials =
        Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];


      materials.forEach((material) => {

        gsap.to(material, {

          opacity: 1,

          duration: 0.5,

          delay:
            1 + index * 0.1,

        });

      });

    });


    // ============================================================
    // REVEAL SLEEVE PIECES
    // ============================================================

    const sleevePieces: Mesh[] = [];


    climbingFrameGroup.traverse((object) => {

      if ((object as Mesh).isMesh) {

        const mesh =
          object as Mesh;


        if (
          mesh.name
            .toLowerCase()
            .includes("sleeve")
        ) {

          sleevePieces.push(mesh);

        }

      }

    });


    sleevePieces.forEach((mesh, index) => {

      const materials =
        Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];


      materials.forEach((material) => {

        gsap.to(material, {

          opacity: 1,

          duration: 0.5,

          delay:
            1 + index * 0.1,

        });

      });

    });


    // ============================================================
    // REVEAL LONG UPRIGHTS
    // ============================================================

    const longUprights: Mesh[] = [];


    climbingFrameGroup.traverse((object) => {

      if ((object as Mesh).isMesh) {

        const mesh =
          object as Mesh;


        if (
          mesh.name
            .toLowerCase()
            .includes("long_upright")
        ) {

          longUprights.push(mesh);

        }

      }

    });


    longUprights.sort((a, b) =>
      a.name.localeCompare(
        b.name,
        undefined,
        { numeric: true }
      )
    );


    longUprights.forEach((mesh, index) => {

      const delay =
        2 + index * 0.1;


      const materials =
        Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];


      materials.forEach((material) => {

        gsap.to(material, {

          opacity: 1,

          duration: 0.5,

          delay,

        });

      });

    });


    // ============================================================
    // REVEAL PIECES SEQUENTIALLY
    // ============================================================

    const pieces: Mesh[] = [];


    climbingFrameGroup.traverse((object) => {

      if ((object as Mesh).isMesh) {

        const mesh =
          object as Mesh;


        if (
          mesh.name
            .toLowerCase()
            .includes("piece")
        ) {

          pieces.push(mesh);

        }

      }

    });


    pieces.sort((a, b) =>
      a.name.localeCompare(
        b.name,
        undefined,
        { numeric: true }
      )
    );


    pieces.forEach((mesh, index) => {

      const delay =
        3 + index * 0.1;


      const materials =
        Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];


      materials.forEach((material) => {

        gsap.to(material, {

          opacity: 1,

          duration: 0.5,

          delay,

          onComplete: () => {

            // ==================================================
            // FINAL FLOURISH
            // ==================================================

            gsap.to(
              climbingFrameGroup.rotation,
              {

                y:
                  climbingFrameGroup.rotation.y +
                  Math.PI * 3 / 4,

                duration: 4,

                ease:
                  "power2.inOut",

              }
            );

          },

        });

      });

    });


    // ============================================================
    // ANIMATE LETTERS
    // ============================================================

    gsap.to(
      letterGroup.rotation,
      {

        onStart: () => {

          letterGroup.scale.x = 0.8;

        },

        y:
          letterGroup.rotation.y +
          Math.PI / -2,

        duration: 3,

        ease:
          "power2.inOut",

      }
    );


    // ============================================================
    // TEMPORARY CLIMBING FRAME SCALE TEST
    // ============================================================

    gsap.to(
      climbingFrameGroup.scale,
      {

        y:
          climbingFrameGroup.scale.y +
          0.2,

        x:
          climbingFrameGroup.scale.x +
          0.2,

        duration: 1,

        ease:
          "power2.inOut",

      }
    );

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