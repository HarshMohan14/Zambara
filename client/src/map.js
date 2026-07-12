import { Mesh, MeshBuilder, Vector3, StandardMaterial, Color3 } from '@babylonjs/core';
import { GAME_CONFIG, DoorState } from 'shared';
export class GameMap {
    scene;
    wallMeshes = [];
    doorMeshes = new Map();
    hidingSpotMeshes = new Map();
    extractionDisc = null;
    extractionGate = null;
    constructor(scene) {
        this.scene = scene;
    }
    build() {
        // Materials
        const wallGfMat = new StandardMaterial("wallGfMat", this.scene);
        wallGfMat.diffuseColor = new Color3(0.12, 0.15, 0.22); // Premium slate blue
        wallGfMat.specularColor = new Color3(0.1, 0.1, 0.1);
        const wallFfMat = new StandardMaterial("wallFfMat", this.scene);
        wallFfMat.diffuseColor = new Color3(0.18, 0.12, 0.28); // Premium indigo
        wallFfMat.specularColor = new Color3(0.1, 0.1, 0.1);
        const floorGfMat = new StandardMaterial("floorGfMat", this.scene);
        floorGfMat.diffuseColor = new Color3(0.06, 0.07, 0.1);
        floorGfMat.specularColor = new Color3(0, 0, 0);
        const floorFfMat = new StandardMaterial("floorFfMat", this.scene);
        floorFfMat.diffuseColor = new Color3(0.09, 0.07, 0.14);
        floorFfMat.specularColor = new Color3(0, 0, 0);
        // 1. Build Ground Floor and Middle Floor (Ceiling of GF / Floor of FF)
        const gfFloor = MeshBuilder.CreateBox("gf_floor_visual", {
            width: GAME_CONFIG.map.width,
            height: 0.2,
            depth: GAME_CONFIG.map.depth
        }, this.scene);
        gfFloor.position = new Vector3(0, -0.1, 0);
        gfFloor.material = floorGfMat;
        // 2. Build Walls
        GAME_CONFIG.map.walls.forEach(wall => {
            const w = wall.max.x - wall.min.x;
            const h = wall.max.y - wall.min.y;
            const d = wall.max.z - wall.min.z;
            const x = wall.min.x + w / 2;
            const y = wall.min.y + h / 2;
            const z = wall.min.z + d / 2;
            const wallMesh = MeshBuilder.CreateBox(wall.id, {
                width: w,
                height: h,
                depth: d
            }, this.scene);
            wallMesh.position = new Vector3(x, y, z);
            // Assign material based on floor level
            if (wall.min.y >= 3.8) {
                wallMesh.material = wallFfMat;
            }
            else {
                wallMesh.material = wallGfMat;
            }
            // Add tag for collision checks on client
            wallMesh.metadata = { isWall: true };
            this.wallMeshes.push(wallMesh);
        });
        // 3. Build Staircases (Visual Ramps)
        const stairMat = new StandardMaterial("stairMat", this.scene);
        stairMat.diffuseColor = new Color3(0.25, 0.22, 0.35);
        GAME_CONFIG.map.staircases.forEach(stair => {
            const w = stair.max.x - stair.min.x;
            const h = stair.max.y - stair.min.y;
            const d = stair.max.z - stair.min.z;
            const ramp = MeshBuilder.CreateBox(stair.id, {
                width: w,
                height: 0.2,
                depth: d
            }, this.scene);
            // Rotate and position ramp
            ramp.position = new Vector3(stair.min.x + w / 2, stair.min.y + h / 2, stair.min.z + d / 2);
            ramp.rotation.x = Math.atan2(h, d);
            ramp.material = stairMat;
            ramp.metadata = { isStair: true };
        });
        // 4. Build Interactive Doors
        const doorFrameMat = new StandardMaterial("doorFrameMat", this.scene);
        doorFrameMat.diffuseColor = new Color3(0.3, 0.2, 0.15);
        GAME_CONFIG.map.doors.forEach(doorConfig => {
            // Create a pivot parent node so door rotates around its edge
            const doorPivot = new Mesh(`door_pivot_${doorConfig.id}`, this.scene);
            doorPivot.position = new Vector3(doorConfig.position.x, doorConfig.position.y, doorConfig.position.z);
            doorPivot.rotation.y = doorConfig.rotationY;
            // The visual slab is offset so its edge is at the pivot node
            const slab = MeshBuilder.CreateBox(`door_slab_${doorConfig.id}`, {
                width: doorConfig.width,
                height: doorConfig.height,
                depth: 0.15
            }, this.scene);
            // Shift mesh by half-width so pivot is at the hinge
            slab.position = new Vector3(doorConfig.width / 2, 0, 0);
            slab.parent = doorPivot;
            slab.material = doorFrameMat;
            slab.metadata = { isDoor: true, doorId: doorConfig.id };
            this.doorMeshes.set(doorConfig.id, doorPivot);
        });
        // 5. Build Hiding Spots
        const spotMat = new StandardMaterial("spotMat", this.scene);
        spotMat.diffuseColor = new Color3(0.4, 0.25, 0.1); // Wood cupboard color
        spotMat.specularColor = new Color3(0, 0, 0);
        const metalBoxMat = new StandardMaterial("metalBoxMat", this.scene);
        metalBoxMat.diffuseColor = new Color3(0.35, 0.4, 0.45); // Metal crate blue-grey
        GAME_CONFIG.map.hidingSpots.forEach(spotConfig => {
            const isCrate = spotConfig.id.includes('box') || spotConfig.id.includes('crate');
            const spot = MeshBuilder.CreateBox(spotConfig.id, {
                width: isCrate ? 1.5 : 1.2,
                height: isCrate ? 1.2 : 2.2,
                depth: isCrate ? 1.5 : 0.8
            }, this.scene);
            spot.position = new Vector3(spotConfig.position.x, spotConfig.position.y, spotConfig.position.z);
            spot.material = isCrate ? metalBoxMat : spotMat;
            spot.metadata = { isHidingSpot: true, spotId: spotConfig.id };
            this.hidingSpotMeshes.set(spotConfig.id, spot);
        });
        // 6. Build Extraction Zone (Green circle disc on GF)
        const extractionCenter = GAME_CONFIG.extraction.zoneCenter;
        const extractionRadius = GAME_CONFIG.extraction.zoneRadius;
        this.extractionDisc = MeshBuilder.CreateDisc("extraction_disc", {
            radius: extractionRadius,
            tessellation: 32
        }, this.scene);
        this.extractionDisc.position = new Vector3(extractionCenter.x, 0.02, extractionCenter.z);
        this.extractionDisc.rotation.x = Math.PI / 2;
        const extractMat = new StandardMaterial("extractMat", this.scene);
        extractMat.diffuseColor = new Color3(0.1, 0.8, 0.2);
        extractMat.alpha = 0.35; // Semitransparent
        extractMat.emissiveColor = new Color3(0.05, 0.4, 0.1);
        this.extractionDisc.material = extractMat;
        // Glowing border cylinder
        this.extractionGate = MeshBuilder.CreateCylinder("extraction_gate", {
            diameterTop: extractionRadius * 2,
            diameterBottom: extractionRadius * 2,
            height: 2.0,
            sideOrientation: Mesh.DOUBLESIDE
        }, this.scene);
        this.extractionGate.position = new Vector3(extractionCenter.x, 1.02, extractionCenter.z);
        const gateMat = new StandardMaterial("gateMat", this.scene);
        gateMat.diffuseColor = new Color3(0.1, 0.8, 0.2);
        gateMat.alpha = 0.08;
        gateMat.emissiveColor = new Color3(0.02, 0.2, 0.05);
        this.extractionGate.material = gateMat;
        // Add floor divider signs or guides
        this.createLabels();
    }
    createLabels() {
        const labels = [
            { text: "Lobby", pos: { x: -5, y: 0.1, z: -5 } },
            { text: "Kitchen", pos: { x: 5, y: 0.1, z: -5 } },
            { text: "Storage", pos: { x: 15, y: 0.1, z: -5 } },
            { text: "Security", pos: { x: -15, y: 0.1, z: -5 } },
            { text: "Civilian Spawn", pos: { x: 5, y: 4.1, z: 6 } },
            { text: "Rescue Spawn", pos: { x: 18, y: 4.1, z: 8 } },
            { text: "Attacker Spawn", pos: { x: -18, y: 0.1, z: 8 } }
        ];
        labels.forEach(label => {
            // Create a small flat disk on the floor marking the room
            const disc = MeshBuilder.CreateDisc(`label_disc_${label.text}`, {
                radius: 0.8,
                tessellation: 8
            }, this.scene);
            disc.position = new Vector3(label.pos.x, label.pos.y + 0.01, label.pos.z);
            disc.rotation.x = Math.PI / 2;
            const mat = new StandardMaterial(`label_mat_${label.text}`, this.scene);
            mat.diffuseColor = new Color3(0.3, 0.3, 0.35);
            disc.material = mat;
        });
    }
    updateDoors(doorStates) {
        GAME_CONFIG.map.doors.forEach(doorConfig => {
            const state = doorStates[doorConfig.id] || DoorState.Closed;
            const doorPivot = this.doorMeshes.get(doorConfig.id);
            if (doorPivot) {
                if (state === DoorState.Open) {
                    doorPivot.rotation.y = doorConfig.rotationY + Math.PI / 2;
                    doorPivot.setEnabled(true);
                }
                else if (state === DoorState.Closed) {
                    doorPivot.rotation.y = doorConfig.rotationY;
                    doorPivot.setEnabled(true);
                }
                else if (state === DoorState.Locked) {
                    doorPivot.rotation.y = doorConfig.rotationY;
                    doorPivot.setEnabled(true);
                }
                else if (state === DoorState.Broken) {
                    doorPivot.setEnabled(false);
                }
            }
        });
    }
    getCollidables() {
        const collidables = [...this.wallMeshes];
        this.doorMeshes.forEach((pivot, id) => {
            if (pivot.isEnabled()) {
                const slab = pivot.getChildren()[0];
                if (slab)
                    collidables.push(slab);
            }
        });
        return collidables;
    }
}
