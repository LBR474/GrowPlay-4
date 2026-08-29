<script setup lang="ts">
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { watch, shallowRef } from "vue";
import * as THREE from "three";
import { Mesh, Group, Box3 } from "three";

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

    let crosstopAssembly: Group | null = null;
    let crossPieceAssembly: Group | null = null;
    let horizontalLength = 0;
    // ============================================================
    // MATERIAL
    // ============================================================

    const metalMaterialDark = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.8,
      roughness: 0.2,
    });

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

    letters.forEach((letterName) => {
      const object = gltf.scene.getObjectByName(letterName);

      if (object) {
        letterGroup.attach(object);
      }
    });

    letterGroup.rotation.y = Math.PI / 2;

    // ============================================================
    // PUT EVERYTHING ELSE INTO CLIMBING FRAME
    // ============================================================

    const frameMeshes: Mesh[] = [];

    gltf.scene.traverse((object: THREE.Object3D) => {
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
    // FIND MAIN PARTS
    // ============================================================

    const originalUpright = climbingFrameGroup.getObjectByName(
      "Long_upright_left_end_front",
    ) as Mesh;

    //let clonedUpright: Mesh | null = null;

    const crossPiece = climbingFrameGroup.getObjectByName(
      "cross_piece_1",
    ) as Mesh;

    const tPiece1 = climbingFrameGroup.getObjectByName("t-piece_1") as Mesh;

    const tPiece2 = climbingFrameGroup.getObjectByName("t-piece_2") as Mesh;

    const footCup = climbingFrameGroup.getObjectByName("Foot_cup007") as Mesh;

    const elbowPiece = climbingFrameGroup.getObjectByName(
      "Elbow_piece002",
    ) as Mesh;

    const joinerSleeve = climbingFrameGroup.getObjectByName(
      "Joiner_sleeve3",
    ) as Mesh;

    // ============================================================
    // DARK METAL UPRIGHTS
    // ============================================================

    if (originalUpright) {
      originalUpright.material = metalMaterialDark;
    }

    // ============================================================
    // CLONE UPRIGHT + SUPPORTING PARTS
    // ============================================================

    if (
      originalUpright &&
      crossPiece &&
      tPiece1 &&
      tPiece2 &&
      footCup &&
      elbowPiece &&
      joinerSleeve
    ) {
      const box = new Box3().setFromObject(crossPiece);

      const size = box.getSize(new THREE.Vector3());

      const tpBox = new Box3().setFromObject(tPiece1);

      const tpSize = tpBox.getSize(new THREE.Vector3());

      const zOffset = size.z + tpSize.z;

      const clonedUpright = originalUpright.clone();

      clonedUpright.name = "Long_upright_CLONE";
      clonedUpright.material = metalMaterialDark;
      clonedUpright.position.z -= zOffset;

      const clonedFootCup = footCup.clone();

      clonedFootCup.name = "Foot_cup_CLONE";
      clonedFootCup.position.z -= zOffset;

      const clonedElbowPiece = elbowPiece.clone();

      clonedElbowPiece.name = "Elbow_piece_CLONE";
      clonedElbowPiece.position.z -= zOffset;

      const clonedJoinerSleeve = joinerSleeve.clone();

      clonedJoinerSleeve.name = "Joiner_sleeve_CLONE";
      clonedJoinerSleeve.position.z -= zOffset;

      climbingFrameGroup.add(clonedUpright);
      climbingFrameGroup.add(clonedFootCup);
      climbingFrameGroup.add(clonedElbowPiece);
      climbingFrameGroup.add(clonedJoinerSleeve);
    }

    // ============================================================
    // CLONE HORIZONTAL PIECE
    // ============================================================

    const horizontalPiece = climbingFrameGroup.getObjectByName(
      "Long_horizontal_piece",
    ) as Mesh;

    horizontalPiece.material = metalMaterialDark;

    if (horizontalPiece) {
      const horizontalPieceClone = horizontalPiece.clone();

      horizontalPieceClone.material = metalMaterialDark;

      horizontalPieceClone.name = "long horizontal piece CLONE";

      horizontalPieceClone.position.set(
        horizontalPiece.position.x,
        horizontalPiece.position.y,
        horizontalPiece.position.z - 1,
      );

      climbingFrameGroup.add(horizontalPieceClone);

      console.log(
        "CLONED HORIZONTAL PIECE:",
        horizontalPieceClone.name,
        "Y position:",
        horizontalPieceClone.position.y,
      );
    }

    // ============================================================
    // CROSSTOP ASSEMBLY PIECES
    // ============================================================

    const horizontalPieceClone = climbingFrameGroup.getObjectByName(
      "long horizontal piece CLONE",
    ) as Mesh;

    const joinerSleeveClone = climbingFrameGroup.getObjectByName(
      "Joiner_sleeve_CLONE",
    ) as Mesh;

    // ============================================================
    // CREATE CROSSTOP ASSEMBLY
    // ============================================================

    if (
      horizontalPiece &&
      horizontalPieceClone &&
      joinerSleeve &&
      joinerSleeveClone
    ) {
      crosstopAssembly = new Group();

      crosstopAssembly.name = "Crosstop Assembly Pieces";

      // Add the four existing pieces

      crosstopAssembly.attach(horizontalPiece);

      crosstopAssembly.attach(horizontalPieceClone);

      crosstopAssembly.attach(joinerSleeve);

      crosstopAssembly.attach(joinerSleeveClone);

      // Add assembly to climbing frame

      climbingFrameGroup.add(crosstopAssembly);

      // ==========================================================
      // GET HORIZONTAL PIECE LENGTH
      // ==========================================================

      const box = new Box3().setFromObject(horizontalPiece);

      const size = box.getSize(new THREE.Vector3());

      horizontalLength = size.x;

      console.log("Horizontal piece length:", horizontalLength);

      // ==========================================================
      // CLONE ASSEMBLY — 1 PIECE LENGTH ALONG X
      // ==========================================================

      const assembly2 = crosstopAssembly.clone(true);

      assembly2.name = "Crosstop Assembly Pieces 2";

      assembly2.position.x += horizontalLength;

      climbingFrameGroup.add(assembly2);

      // ==========================================================
      // CLONE ASSEMBLY — 2 PIECE LENGTHS ALONG X
      // ==========================================================

      const assembly3 = crosstopAssembly.clone(true);

      assembly3.name = "Crosstop Assembly Pieces 3";

      assembly3.position.x += horizontalLength * 2;

      climbingFrameGroup.add(assembly3);

      const assembly4 = crosstopAssembly.clone(true);

      assembly4.name = "Crosstop Assembly Pieces 4";

      assembly4.position.x += horizontalLength * 3;

      climbingFrameGroup.add(assembly4);

      // ==========================================================
      // CLONE ASSEMBLY — 4 PIECE LENGTHS ALONG X
      // END ASSEMBLY
      // ==========================================================

      const assembly5 = crosstopAssembly.clone(true);

      assembly5.name = "Crosstop Assembly Pieces 5";

      assembly5.position.x += horizontalLength * 4;

      climbingFrameGroup.add(assembly5);

      // ==========================================================
      // REPLACE ASSEMBLY 5 JOINER SLEEVES WITH ELBOW PIECES
      // ==========================================================

      const assembly5Sleeve1 = assembly5.getObjectByName(
        "Joiner_sleeve3",
      ) as Mesh;

      const assembly5Sleeve2 = assembly5.getObjectByName(
        "Joiner_sleeve_CLONE",
      ) as Mesh;

      if (assembly5Sleeve1 && assembly5Sleeve2 && elbowPiece) {
        // ----------------------------------------------------------
        // Get sleeve positions
        // ----------------------------------------------------------

        const sleeve1Position = assembly5Sleeve1.position.clone();

        const sleeve1Rotation = assembly5Sleeve1.rotation.clone();

        const sleeve2Position = assembly5Sleeve2.position.clone();

        const sleeve2Rotation = assembly5Sleeve2.rotation.clone();

        // ----------------------------------------------------------
        // Remove sleeves
        // ----------------------------------------------------------

        assembly5.remove(assembly5Sleeve1);
        assembly5.remove(assembly5Sleeve2);

        // ----------------------------------------------------------
        // Create first elbow
        // ----------------------------------------------------------

        const elbow1 = elbowPiece.clone();

        elbow1.name = "Assembly5_Elbow_1";

        elbow1.position.copy(sleeve1Position);
        elbow1.rotation.copy(sleeve1Rotation);

        elbow1.rotation.y += Math.PI;

        // ----------------------------------------------------------
        // Create second elbow
        // ----------------------------------------------------------

        const elbow2 = elbowPiece.clone();

        elbow2.name = "Assembly5_Elbow_2";

        elbow2.position.copy(sleeve2Position);
        elbow2.rotation.copy(sleeve2Rotation);

        elbow2.rotation.y += Math.PI;

        // ----------------------------------------------------------
        // Add elbows to assembly 5
        // ----------------------------------------------------------

        assembly5.add(elbow1);
        assembly5.add(elbow2);

        console.log("Assembly 5 end elbows:", elbow1.name, elbow2.name);
      }
      console.log(
        "Crosstop assemblies created:",
        climbingFrameGroup.children
          .filter((child) => child.name.startsWith("Crosstop Assembly"))
          .map((child) => child.name),
      );
    }

    // ==========================================================
    // FAR-END UPRIGHTS
    // ==========================================================

    // Get horizontal piece length

    const horizontalBox = new Box3().setFromObject(horizontalPiece);

    const horizontalSize = horizontalBox.getSize(new THREE.Vector3());

    horizontalLength = horizontalSize.x;

    // Get upright Z separation

    const crossBox = new Box3().setFromObject(crossPiece);

    const crossSize = crossBox.getSize(new THREE.Vector3());

    const tpBox = new Box3().setFromObject(tPiece1);

    const tpSize = tpBox.getSize(new THREE.Vector3());

    const farZOffset = crossSize.z + tpSize.z;

    // ==========================================================
    // ELBOW PIECE X-LENGTH
    // ==========================================================

    const elbowBox = new Box3().setFromObject(elbowPiece);

    const elbowSize = elbowBox.getSize(new THREE.Vector3());

    const elbowLength = elbowSize.x;

    // ==========================================================
    // FAR-END X POSITION
    // ==========================================================

    const farEndX = horizontalLength * 5 + elbowLength;

    // ==========================================================
    // CREATE FAR-END UPRIGHTS
    // ==========================================================

    const farUpright1 = originalUpright.clone();

    farUpright1.name = "Long_upright_far_end_1";

    farUpright1.position.x += farEndX;

    farUpright1.material = metalMaterialDark;

    const farUpright2 = originalUpright.clone();

    farUpright2.name = "Long_upright_far_end_2";

    farUpright2.position.x += farEndX;

    farUpright2.position.z -= farZOffset;

    farUpright2.material = metalMaterialDark;

    // ==========================================================
    // FAR-END FOOT CUPS
    // ==========================================================

    const farFootCup1 = footCup.clone();

    farFootCup1.name = "Foot_cup_far_end_1";

    farFootCup1.position.x += farEndX;

    const farFootCup2 = footCup.clone();

    farFootCup2.name = "Foot_cup_far_end_2";

    farFootCup2.position.x += farEndX;

    farFootCup2.position.z -= farZOffset;

    // ==========================================================
    // ADD TWO CROSS-PIECE ASSEMBLIES TO FAR UPRIGHTS
    // ==========================================================

   if (crossPieceAssembly) {

  //const farAssembly1 = crossPieceAssembly.clone(true);

  // farAssembly1.name = "Cross-piece Assembly Far End 1";
  // farAssembly1.position.x += farEndX;

  // climbingFrameGroup.add(farAssembly1);


  // const farAssembly2 = crossPieceAssembly.clone(true);

  // farAssembly2.name = "Cross-piece Assembly Far End 2";
  // farAssembly2.position.x += farEndX;
  // farAssembly2.position.z -= farZOffset;

  // climbingFrameGroup.add(farAssembly2);

}
    // ==========================================================
    // ADD TO CLIMBING FRAME
    // ==========================================================

    climbingFrameGroup.add(farUpright1);
    climbingFrameGroup.add(farUpright2);

    climbingFrameGroup.add(farFootCup1);
    climbingFrameGroup.add(farFootCup2);

    // ============================================================
    // CROSS-PIECE ASSEMBLY
    // ============================================================

    if (tPiece1 && crossPiece && tPiece2) {
      crossPieceAssembly = new Group();

      crossPieceAssembly.name = "Cross-piece Assembly";

      // Put the three pieces into the assembly

      crossPieceAssembly.attach(tPiece1);

      crossPieceAssembly.attach(crossPiece);

      crossPieceAssembly.attach(tPiece2);

      // Add assembly to climbing frame

      climbingFrameGroup.add(crossPieceAssembly);

      // ==========================================================
      // CLONE ASSEMBLY
      // ==========================================================

      const clonedAssembly = crossPieceAssembly.clone(true);

      clonedAssembly.name = "Cross-piece Assembly CLONE";

      // Move clone one unit upward

      clonedAssembly.position.y += 1;

      climbingFrameGroup.add(clonedAssembly);

      console.log(
        "Cross-piece assembly created:",
        crossPieceAssembly.children.map((child) => child.name),
      );

      console.log("Cloned assembly position:", clonedAssembly.position);
    }
  },

  { immediate: true },
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
