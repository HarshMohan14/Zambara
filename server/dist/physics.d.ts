import { Vector3Data, DoorState } from 'shared';
export declare function getDistance(p1: Vector3Data, p2: Vector3Data): number;
export declare function isPointInBox(pos: Vector3Data, min: Vector3Data, max: Vector3Data, margin?: number): boolean;
export declare function isInsideStaircase(pos: Vector3Data): boolean;
/**
 * Checks if a player collides with any solid wall or closed/locked door.
 */
export declare function checkCollision(pos: Vector3Data, doorStates: Record<string, DoorState>, playerRadius?: number): boolean;
/**
 * Validates a movement step from oldPos to proposed newPos.
 * Clamps coordinates, checks speed, verifies floor changes via stairs,
 * and handles collisions. Returns the validated/adjusted position.
 */
export declare function validateMove(oldPos: Vector3Data, newPos: Vector3Data, maxSpeed: number, deltaTime: number, doorStates: Record<string, DoorState>): Vector3Data;
