import * as THREE from 'three';

import { Actor} from '../actors';
import { getAnim } from '../../model/entity';
import { loadAnim } from '../../model/anim';
import {
    updateKeyframe,
    updateKeyframeInterpolation
} from '../../model/animState';
import { processAnimAction } from './animAction';
import { Time } from '../../datatypes';
import { AnimType } from '../data/animType';

const ACTOR_POS = new THREE.Vector3();
const HIDE_DISTANCE = 50;
const HIDE_DISTANCE2 = HIDE_DISTANCE * HIDE_DISTANCE;

export function updateActor(
    params: any,
    game: any,
    scene: any,
    actor: Actor,
    time: any
) {
    if ((params.mobile || params.clipActors)
        && scene.isIsland
        && !scene.firstFrame
        && actor.index > 0
        && actor.threeObject
        && false) {
        ACTOR_POS.copy(actor.physics.position);
        ACTOR_POS.add(scene.sceneNode.position);
        const camDist2 = ACTOR_POS.distanceToSquared(scene.camera.controlNode.position);
        // @ts-ignore
        actor.dist = Math.sqrt(camDist2);
        if (camDist2 > HIDE_DISTANCE2) {
            actor.threeObject.visible = false;
            actor.threeObject.matrixAutoUpdate = false;
            return;
        }
        actor.threeObject.matrixAutoUpdate = true;
        actor.threeObject.visible = actor.isVisible;
    }
    actor.runScripts(time);

    if (actor.model !== null
        && actor.threeObject
        && (actor.threeObject.visible || actor.index === 0)) {
        const model = actor.model;
        actor.animState.matrixRotation.makeRotationFromQuaternion(actor.physics.orientation);
        updateModel(
            game,
            scene.isActive,
            model,
            actor.animState,
            actor.props.entityIndex,
            actor.props.animIndex,
            time);
        if (actor.animState.isPlaying) {
            const firstPerson = game.controlsState.firstPerson
                && scene.isActive
                && actor.index === 0;
            const behaviour = game.getState().hero.behaviour;
            updateMovements(actor, firstPerson, behaviour, time);
        }
    }
}

const wEuler = new THREE.Euler();

const slowMove = {
    [AnimType.FORWARD]: {x: 0, z: 2.5},
    [AnimType.BACKWARD]: {x: 0, z: -1.5},
    [AnimType.DODGE_LEFT]: {x: 1.5, z: 0},
    [AnimType.DODGE_RIGHT]: {x: -1.5, z: 0},
};

const fastMove = {
    [AnimType.FORWARD]: {x: 0, z: 4},
    [AnimType.BACKWARD]: {x: 0, z: -3},
    [AnimType.DODGE_LEFT]: {x: 2, z: 0},
    [AnimType.DODGE_RIGHT]: {x: -2, z: 0},
};

const superSlowMove = {
    [AnimType.FORWARD]: {x: 0, z: 1.5},
    [AnimType.BACKWARD]: {x: 0, z: -0.75},
    [AnimType.DODGE_LEFT]: {x: 0.75, z: 0},
    [AnimType.DODGE_RIGHT]: {x: -0.75, z: 0},
};

const vrFPsteps = [
    slowMove,
    fastMove,
    slowMove,
    superSlowMove
];

function updateMovements(actor: Actor, firstPerson: boolean, behaviour: number, time: any) {
    const deltaMS = time.delta * 1000;
    if (actor.props.runtimeFlags.isTurning) {
        const baseAngle = ((actor.physics.temp.destAngle - actor.physics.temp.angle) * deltaMS);
        let angle = baseAngle / (actor.props.speed * 10);
        angle = Math.atan2(Math.sin(angle), Math.cos(angle));
        actor.physics.temp.angle += angle;
        wEuler.set(0, actor.physics.temp.angle, 0, 'XZY');
        actor.physics.orientation.setFromEuler(wEuler);
    }
    if (actor.props.runtimeFlags.isWalking) {
        actor.physics.temp.position.set(0, 0, 0);

        const animIndex = actor.props.animIndex;
        const useVrSteps = (firstPerson && behaviour < 4 && animIndex in vrFPsteps[behaviour]);

        const speedZ = useVrSteps
            ? vrFPsteps[behaviour][animIndex].z * time.delta
            : (actor.animState.step.z * deltaMS) / actor.animState.keyframeLength;
        const speedX = useVrSteps
            ? vrFPsteps[behaviour][animIndex].x * time.delta
            : (actor.animState.step.x * deltaMS) / actor.animState.keyframeLength;

        actor.physics.temp.position.x += Math.sin(actor.physics.temp.angle) * speedZ;
        actor.physics.temp.position.z += Math.cos(actor.physics.temp.angle) * speedZ;

        actor.physics.temp.position.x -= Math.cos(actor.physics.temp.angle) * speedX;
        actor.physics.temp.position.z += Math.sin(actor.physics.temp.angle) * speedX;

        actor.physics.temp.position.y +=
            (actor.animState.step.y * deltaMS) / (actor.animState.keyframeLength);
    } else {
        actor.physics.temp.position.set(0, 0, 0);
    }
}

function updateModel(game: any,
                        sceneIsActive: any,
                        model: any,
                        animState: any,
                        entityIdx: number,
                        animIdx: number,
                        time: Time) {
    const entity = model.entities[entityIdx];
    const entityAnim = getAnim(entity, animIdx);
    if (entityAnim !== null) {
        const realAnimIdx = entityAnim.animIndex;
        const anim = loadAnim(model, model.anims, realAnimIdx);
        animState.loopFrame = anim.loopFrame;
        if (animState.prevRealAnimIdx !== -1 && realAnimIdx !== animState.prevRealAnimIdx) {
           updateKeyframeInterpolation(anim, animState, time, realAnimIdx);
        }
        if (realAnimIdx === animState.realAnimIdx || animState.realAnimIdx === -1) {
            updateKeyframe(anim, animState, time, realAnimIdx);
        }
        if (sceneIsActive) {
            processAnimAction({
                game,
                model,
                entityAnim,
                animState
            });
        }
    }
}
