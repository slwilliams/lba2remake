import * as THREE from 'three';
import { times } from 'lodash';
import { WORLD_SIZE } from '../../../../utils/lba';
import { IslandSection } from '../IslandLayout';
import Scene from '../../../Scene';
import Actor from '../../../Actor';
import Extra from '../../../Extra';
import { scanGrid, intersect2DLines, pointInTriangle2D, interpolateY } from './math';
import HeightMapCell, { HeightMapTriangle } from './HeightMapCell';
import GroundInfo from './GroundInfo';
import { AnimType } from '../../../data/animType';
import { Time } from '../../../../datatypes';

const MAX_ITERATIONS = 4;

export default class HeightMap {
    private sections: IslandSection[] = [];

    /** Line segment from actor starting position to target position (for this frame) */
    private line = new THREE.Line3();
    private triangle_side = new THREE.Line3();
    private cell = new HeightMapCell();
    /** List of intersection points in the current cell */
    private intersect_points = times(6).map(() => new THREE.Vector3());
    /** List of projected target points in the current cell */
    private projection_points = times(6).map(() => new THREE.Vector3());

    private vec_tmp = new THREE.Vector3();
    private proj_offset = new THREE.Vector3();

    constructor(sections: IslandSection[]) {
        this.sections = sections;
    }

    /**
     * The goal of this function is to test if the actor
     * intersects with any of the "solid" triangles of the
     * heightmap (such as rocks).
     * It translates the target position (actor.physics.position)
     * so as to maintain smooth movements.
     */
    processCollisions(scene: Scene, obj: Actor | Extra, time: Time) {
        sceneSpaceToGridSpace(scene, obj.threeObject.position, this.line.start);
        sceneSpaceToGridSpace(scene, obj.physics.position, this.line.end);
        let done = false;
        let iteration = 0;
        let isSliding = false;
        let isStuck = false;
        while (!done && iteration < MAX_ITERATIONS) {
            done = true;
            scanGrid(this.line, (x, z) => {
                this.cell.setFrom(this.sections, x, z);
                if (!this.cell.valid) {
                    return true;
                }
                let idx = 0;
                for (const tri of this.cell.triangles) {
                    if (tri.collision) {
                        const { points } = tri;
                        let intersect = false;
                        for (let i = 0; i < 3; i += 1) {
                            const pt0 = i;
                            const pt1 = (i + 1) % 3;
                            this.triangle_side.set(points[pt0], points[pt1]);
                            const t = intersect2DLines(this.line, this.triangle_side);
                            if (t !== -1) {
                                // Found some intersection.
                                // Push the intersection point and projected point
                                // (closest point to the target on the interesected edge).
                                this.intersect_points[idx].copy(this.line.start);
                                this.vec_tmp.copy(this.line.end);
                                this.vec_tmp.sub(this.line.start);
                                this.vec_tmp.multiplyScalar(t);
                                this.intersect_points[idx].add(this.vec_tmp);
                                this.triangle_side.closestPointToPoint(
                                    this.line.end,
                                    true,
                                    this.projection_points[idx]
                                );
                                idx += 1;
                                intersect = true;
                            }
                        }
                        if (!intersect) {
                            if (obj instanceof Actor
                                && pointInTriangle2D(points, this.line.start)) {
                                // If we have no intersection and the start of the
                                // directional vector is within a solid triangle,
                                // we should be sliding down the slope.
                                isSliding = this.processSliding(scene, tri, obj, time);
                                if (!isSliding) {
                                    isStuck = true;
                                }
                                return true;
                            }
                        }
                    }
                }
                // Find the closest intersection
                let closestIdx = -1;
                let dist = Infinity;
                for (let i = 0; i < idx; i += 1) {
                    const nDist = this.intersect_points[i].distanceToSquared(this.line.start);
                    if (nDist < dist) {
                        closestIdx = i;
                        dist = nDist;
                    }
                }
                if (closestIdx !== -1) {
                    // Apply a little offset to the projected point
                    // to push it out of the intersected triangle's edge.
                    this.proj_offset.copy(this.projection_points[closestIdx]);
                    this.proj_offset.sub(this.line.end);
                    this.proj_offset.normalize();
                    this.proj_offset.multiplyScalar(0.01);
                    this.line.end.copy(this.projection_points[closestIdx]);
                    this.line.end.add(this.proj_offset);
                    gridSpaceToSceneSpace(scene, this.line.end, obj.physics.position);
                    this.cell.setFromPos(this.sections, this.line.end);
                    for (const tri of this.cell.triangles) {
                        if (tri.collision && pointInTriangle2D(tri.points, this.line.end)) {
                            // If the new target position is within another solid triangle
                            // we should keep iterating until we're out.
                            // (otherwise we would jump into the solid triangles in the corners)
                            done = false;
                        }
                    }
                    return true;
                }
                return false;
            });
            iteration += 1;
        }
        if (obj instanceof Actor) {
            obj.state.isSliding = isSliding && !obj.state.isJumping;
            obj.state.isStuck = isStuck && !obj.state.isJumping;
        }
    }

    getGroundInfo(position: THREE.Vector3, result: GroundInfo) {
        this.vec_tmp.set(position.x * GRID_SCALE, position.y, position.z * GRID_SCALE);
        this.getGroundInfoInGridSpace(this.vec_tmp, result);
    }

    private getGroundInfoInGridSpace(position: THREE.Vector3, result: GroundInfo) {
        this.cell.setFromPos(this.sections, position);
        if (this.cell.valid) {
            for (const tri of this.cell.triangles) {
                if (pointInTriangle2D(tri.points, position)) {
                    result.valid = true;
                    result.collision = tri.collision;
                    result.sound = tri.sound;
                    result.liquid = tri.liquid;
                    result.height = interpolateY(tri.points, position);
                    result.section = this.cell.section;
                    for (let i = 0; i < 3; i += 1) {
                        const pt = tri.points[i];
                        result.points[i].set(
                            pt.x * INV_GRID_SCALE,
                            pt.y,
                            pt.z * INV_GRID_SCALE
                        );
                    }
                    return;
                }
            }
        }
        result.setDefault();
    }

    private slideIdx = [-1, -1, -1];
    private slideTgt = new THREE.Vector3();
    private groundTmp = new GroundInfo();

    private processSliding(scene: Scene, tri: HeightMapTriangle, actor: Actor, time: Time) {
        const { points } = tri;
        let count = 0;
        let lowest = Infinity;
        let highest = -Infinity;
        let highestIdx = -1;
        for (let i = 0; i < 3; i += 1) {
            const pt = points[i];
            if (pt.y < lowest) {
                this.slideIdx[0] = i;
                count = 1;
                lowest = pt.y;
            } else if (pt.y === lowest) {
                this.slideIdx[count] = i;
                count += 1;
            }
            if (pt.y > highest) {
                highestIdx = i;
                highest = pt.y;
            }
        }
        if (count < 3 && !actor.state.isStuck) {
            if (!actor.state.isSliding) {
                actor.state.slideStartTime = time.elapsed;
                actor.state.slideStartPos.copy(this.line.start);
            } else if (time.elapsed - actor.state.slideStartTime > 0.5) {
                if (this.line.start.distanceToSquared(actor.state.slideStartPos) < 1) {
                    return false;
                }
                actor.state.slideStartTime = time.elapsed;
                actor.state.slideStartPos.copy(this.line.start);
            }
            actor.setAnim(AnimType.SLIDE_FORWARD);
            this.slideTgt.set(0, 0, 0);
            for (let i = 0; i < count; i += 1) {
                this.slideTgt.add(points[this.slideIdx[i]]);
            }
            this.slideTgt.divideScalar(count);
            this.proj_offset.copy(this.slideTgt);
            this.proj_offset.sub(points[highestIdx]);
            this.proj_offset.normalize();
            this.proj_offset.multiplyScalar(time.delta * 3);
            this.line.end.copy(this.line.start);
            this.line.end.add(this.proj_offset);
            this.getGroundInfoInGridSpace(this.line.end, this.groundTmp);
            this.line.end.y = this.groundTmp.height;
            gridSpaceToSceneSpace(
                scene,
                this.line.end,
                actor.physics.position
            );
            return true;
        }
        actor.physics.position.copy(actor.threeObject.position);
        return false;
    }
}

const GRID_SCALE = 32 / WORLD_SIZE;
const INV_GRID_SCALE = WORLD_SIZE / 32;

/**
 * Turns an input vector in local scene space
 * into an output vector in heightmap grid space
 * @param src Input vector in scene space
 * @param tgt Output vector in heightmap grid space
 */
function sceneSpaceToGridSpace(
    scene: Scene,
    src: THREE.Vector3,
    tgt: THREE.Vector3
) {
    tgt.copy(src);
    tgt.add(scene.sceneNode.position);
    tgt.set(tgt.x * GRID_SCALE, src.y, tgt.z * GRID_SCALE);
}

/**
 * Turns an input vector in heightmap grid space
 * into an output vector in local scene space.
 * @param src Input vector in heightmap grid space
 * @param tgt Output vector in scene space
 */
function gridSpaceToSceneSpace(
    scene: Scene,
    src: THREE.Vector3,
    tgt: THREE.Vector3
) {
    tgt.set(src.x * INV_GRID_SCALE, src.y, src.z * INV_GRID_SCALE);
    tgt.sub(scene.sceneNode.position);
}
