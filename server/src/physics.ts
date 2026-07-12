import { GAME_CONFIG, Vector3Data, DoorState } from 'shared';

// Helper to calculate 3D distance
export function getDistance(p1: Vector3Data, p2: Vector3Data): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Helper to check if a point is inside an AABB box
export function isPointInBox(pos: Vector3Data, min: Vector3Data, max: Vector3Data, margin = 0): boolean {
  return (
    pos.x >= min.x - margin &&
    pos.x <= max.x + margin &&
    pos.y >= min.y - margin &&
    pos.y <= max.y + margin &&
    pos.z >= min.z - margin &&
    pos.z <= max.z + margin
  );
}

// Helper to check if player is inside any staircase zone
export function isInsideStaircase(pos: Vector3Data): boolean {
  for (const stair of GAME_CONFIG.map.staircases) {
    // Add a horizontal margin of 2.5m for stairs to feel smooth and avoid false desync snaps
    if (isPointInBox(pos, stair.min, stair.max, 2.5)) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if a player collides with any solid wall or closed/locked door.
 */
export function checkCollision(
  pos: Vector3Data,
  doorStates: Record<string, DoorState>,
  playerRadius = 0.2
): boolean {
  // 1. Check map boundaries
  const halfW = GAME_CONFIG.map.width / 2;
  const halfD = GAME_CONFIG.map.depth / 2;
  
  if (pos.x < -halfW || pos.x > halfW || pos.z < -halfD || pos.z > halfD) {
    return true; // Out of bounds
  }

  // 2. Check collision with walls
  for (const wall of GAME_CONFIG.map.walls) {
    // Skip checking middle floor slabs on the server.
    // The server already validates vertical floor changes in validateMove.
    if (wall.id.startsWith("mid_floor")) {
      continue;
    }

    // Check if player position is inside the wall box (inflated by player radius)
    if (isPointInBox(pos, wall.min, wall.max, playerRadius)) {
      return true; // Collides with wall
    }
  }

  // 3. Check collision with closed/locked doors
  for (const doorConfig of GAME_CONFIG.map.doors) {
    const currentState = doorStates[doorConfig.id] || DoorState.Closed;
    
    // If open or broken, player can walk through
    if (currentState === DoorState.Open || currentState === DoorState.Broken) {
      continue;
    }

    // Treat closed/locked doors as bounding boxes
    // Rotated around Y-axis
    const halfWidth = doorConfig.width / 2;
    const halfThickness = 0.2; // thin box for door
    
    let minX, maxX, minZ, maxZ;
    
    // For simplicity, we approximate door orientation by rotationY (0 or PI/2)
    if (Math.abs(doorConfig.rotationY - Math.PI / 2) < 0.1 || Math.abs(doorConfig.rotationY + Math.PI / 2) < 0.1) {
      // Oriented along Z-axis (thickness along X)
      minX = doorConfig.position.x - halfThickness;
      maxX = doorConfig.position.x + halfThickness;
      minZ = doorConfig.position.z - halfWidth;
      maxZ = doorConfig.position.z + halfWidth;
    } else {
      // Oriented along X-axis (thickness along Z)
      minX = doorConfig.position.x - halfWidth;
      maxX = doorConfig.position.x + halfWidth;
      minZ = doorConfig.position.z - halfThickness;
      maxZ = doorConfig.position.z + halfThickness;
    }

    const minY = doorConfig.position.y - 2.0;
    const maxY = doorConfig.position.y + 2.0;

    const doorMin = { x: minX, y: minY, z: minZ };
    const doorMax = { x: maxX, y: maxY, z: maxZ };

    if (isPointInBox(pos, doorMin, doorMax, playerRadius)) {
      return true; // Collides with closed/locked door
    }
  }

  return false;
}

/**
 * Validates a movement step from oldPos to proposed newPos.
 * Clamps coordinates, checks speed, verifies floor changes via stairs,
 * and handles collisions. Returns the validated/adjusted position.
 */
export function validateMove(
  oldPos: Vector3Data,
  newPos: Vector3Data,
  maxSpeed: number,
  deltaTime: number,
  doorStates: Record<string, DoorState>
): Vector3Data {
  // 1. Boundary check: if proposed position is out of bounds, keep player in bounds
  const halfW = GAME_CONFIG.map.width / 2;
  const halfD = GAME_CONFIG.map.depth / 2;
  
  const inBoundsPos = {
    x: Math.max(-halfW, Math.min(halfW, newPos.x)),
    y: Math.max(0, Math.min(GAME_CONFIG.map.height, newPos.y)),
    z: Math.max(-halfD, Math.min(halfD, newPos.z)),
  };

  // 2. Speed check (with a small buffer of 1.0m to account for server tick rates)
  const elapsed = Math.max(0.001, deltaTime);
  const maxAllowedDist = maxSpeed * elapsed + 1.0;
  const rawDist = getDistance(oldPos, inBoundsPos);
  
  const targetPos = { ...inBoundsPos };
  if (rawDist > maxAllowedDist) {
    // Clamp movement vector to maximum speed allowance
    const ratio = maxAllowedDist / rawDist;
    targetPos.x = oldPos.x + (inBoundsPos.x - oldPos.x) * ratio;
    targetPos.y = oldPos.y + (inBoundsPos.y - oldPos.y) * ratio;
    targetPos.z = oldPos.z + (inBoundsPos.z - oldPos.z) * ratio;
  }

  // 3. Floor change validation
  // If moving between Ground Floor (Y < 2) and First Floor (Y >= 2), they must be in a staircase zone
  const wasOnGround = oldPos.y < 2.0;
  const isOnFirst = targetPos.y >= 2.0;
  
  if (wasOnGround !== isOnFirst) {
    if (!isInsideStaircase(oldPos) && !isInsideStaircase(targetPos)) {
      // Teleporting through floors is forbidden. Restrict Y to the previous floor
      targetPos.y = oldPos.y;
    }
  }

  // 4. Collision check
  // If the target position collides with a wall or door, try to slide or revert
  if (checkCollision(targetPos, doorStates)) {
    // Simplification for prototype: if colliding, return old position (stop movement)
    // In a production engine we would resolve sliding, but for 6 players, reverting works fine
    return oldPos;
  }

  return targetPos;
}
