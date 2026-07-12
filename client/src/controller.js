import { Vector3, ArcRotateCamera, Scalar } from '@babylonjs/core';
import { GAME_CONFIG } from 'shared';
export class PlayerController {
    camera;
    canvas;
    scene;
    // Input states
    keys = {};
    isSprinting = false;
    isCrouching = false;
    // Camera settings
    targetAlpha = 0;
    targetBeta = Math.PI / 3;
    mouseSensitivity = 0.003;
    constructor(scene, canvas) {
        this.scene = scene;
        this.canvas = canvas;
        // Create a 3rd person ArcRotateCamera
        this.camera = new ArcRotateCamera("thirdPersonCamera", 0, Math.PI / 3, 8, Vector3.Zero(), this.scene);
        this.camera.lowerRadiusLimit = 2.5;
        this.camera.upperRadiusLimit = 15;
        this.camera.checkCollisions = true; // Avoid camera going through walls
        this.setupInputs();
    }
    getCamera() {
        return this.camera;
    }
    setupInputs() {
        // Keyboard listeners
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight')
                this.isSprinting = true;
            if (e.code === 'ControlLeft' || e.code === 'KeyC')
                this.isCrouching = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight')
                this.isSprinting = false;
            if (e.code === 'ControlLeft' || e.code === 'KeyC')
                this.isCrouching = false;
        });
        // Pointer Lock
        this.canvas.addEventListener('click', () => {
            this.canvas.requestPointerLock();
        });
        // Mouse movement
        window.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === this.canvas) {
                this.targetAlpha += e.movementX * this.mouseSensitivity;
                this.targetBeta += e.movementY * this.mouseSensitivity;
                // Clamp beta (vertical angle) to avoid flipping
                this.targetBeta = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, this.targetBeta));
            }
        });
    }
    /**
     * Updates local player position and returns movement details.
     */
    update(playerMesh, dt) {
        // 1. Position camera target at player position (slightly offset upwards to chest level)
        const targetPos = playerMesh.position.add(new Vector3(0, 1.2, 0));
        this.camera.target = targetPos;
        // 2. Interpolate camera angles
        this.camera.alpha = Scalar.Lerp(this.camera.alpha, this.targetAlpha, 0.2);
        this.camera.beta = Scalar.Lerp(this.camera.beta, this.targetBeta, 0.2);
        // 3. Compute movement speed
        let speedMode = 'walk';
        if (this.isSprinting && !this.isCrouching)
            speedMode = 'sprint';
        if (this.isCrouching)
            speedMode = 'crouch';
        const speed = GAME_CONFIG.speeds[speedMode];
        // 4. Calculate movement vectors based on camera direction
        const moveDirection = Vector3.Zero();
        // Directions relative to camera
        const forward = this.camera.getForwardRay().direction;
        forward.y = 0; // lock to horizontal plane
        forward.normalize();
        const right = Vector3.Cross(Vector3.Up(), forward);
        right.normalize();
        if (this.keys['KeyW'] || this.keys['ArrowUp'])
            moveDirection.addInPlace(forward);
        if (this.keys['KeyS'] || this.keys['ArrowDown'])
            moveDirection.addInPlace(forward.scale(-1));
        if (this.keys['KeyD'] || this.keys['ArrowRight'])
            moveDirection.addInPlace(right.scale(-1));
        if (this.keys['KeyA'] || this.keys['ArrowLeft'])
            moveDirection.addInPlace(right);
        let rotationY = playerMesh.rotation.y;
        if (moveDirection.length() > 0) {
            moveDirection.normalize();
            // Face movement direction
            const angle = Math.atan2(moveDirection.x, moveDirection.z);
            playerMesh.rotation.y = angle;
            rotationY = angle;
            const displacement = moveDirection.scale(speed * dt);
            // Apply gravity downwards so they stay on floor and slide down stairs
            displacement.y = -9.81 * dt;
            playerMesh.moveWithCollisions(displacement);
        }
        else {
            const gravity = new Vector3(0, -9.81 * dt, 0);
            playerMesh.moveWithCollisions(gravity);
        }
        return {
            position: { x: playerMesh.position.x, y: playerMesh.position.y, z: playerMesh.position.z },
            rotationY,
            speedMode
        };
    }
    getKeys() {
        return this.keys;
    }
}
