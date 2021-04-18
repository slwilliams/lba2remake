import * as THREE from 'three';
import Actor from '../Actor';
import Scene from '../Scene';
import IsoScenery from '../scenery/isometric/IsoScenery';
import IsoSceneryPhysics from '../scenery/isometric/IsoSceneryPhysics';
import { Time } from '../../datatypes';

/*
**                       ----
**    WEST [Z-]      ---/    \---      NORTH [X+]
**               ---/            \---
**           ---/                    \---
**        --/                            \--
**        --\                            /--
**           ---\                    /---
**               ---\            /---
**    SOUTH [X-]     ---\    /---      EAST [Z+]
**                       ----
*/
const RailLayout = {
    /** Temple of Bu rails **/
    // Straight
    NORTH_SOUTH:           54,
    WEST_EAST:             53,
    UP_NORTH:              63,
    UP_SOUTH:              65,
    UP_WEST:               66,
    UP_EAST:               64,
    // Turns
    TURN_NORTH_WEST:       51,
    TURN_NORTH_EAST:       50,
    TURN_SOUTH_WEST:       49,
    TURN_SOUTH_EAST:       52,
    // Turnouts
    TO_NORTH_NORTH_WEST:   56,
    TO_NORTH_NORTH_EAST:   55,
    TO_SOUTH_SOUTH_WEST:   57,
    TO_SOUTH_SOUTH_EAST:   58,
    TO_EAST_EAST_SOUTH:    59,
    TO_EAST_EAST_NORTH:    60,
    TO_WEST_WEST_SOUTH:    61,
    TO_WEST_WEST_NORTH:    62,
};

export interface WagonState {
    angle: number;
}

const wEuler = new THREE.Euler();
const lInfo = {
    index: -1,
    center: new THREE.Vector3(),
    key: 'none'
};

export function computeWagonMovement(scene: Scene, wagon: Actor, time: Time) {
    if (!(scene.scenery.physics instanceof IsoSceneryPhysics)) {
        return;
    }

    const state = wagon.wagonState;
    scene.scenery.physics.getLayoutInfo(wagon.physics.position, lInfo);
    const rail = mapUndergasToBuRails(scene, lInfo.index);
    wagon.debugData.rail = rail;
    wagon.debugData.railName = Object.keys(RailLayout).find(k => RailLayout[k] === rail);
    wagon.debugData.lInfo = lInfo;

    let straight = false;
    let turn = false;
    switch (rail) {
        case RailLayout.NORTH_SOUTH:
            wagon.physics.position.z = lInfo.center.z;
            straight = true;
            break;
        case RailLayout.WEST_EAST:
            wagon.physics.position.x = lInfo.center.x;
            straight = true;
            break;
        case RailLayout.TURN_SOUTH_WEST:
            turn = true;
            wagon.physics.position.z = lInfo.center.z;
            state.angle = Math.PI / 2;
            break;
        case RailLayout.TURN_SOUTH_EAST:
            turn = true;
            wagon.physics.position.z = lInfo.center.z;
            state.angle = Math.PI / 2;
            break;
        case RailLayout.TURN_NORTH_WEST:
            turn = true;
            wagon.physics.position.x = lInfo.center.x;
            state.angle = 0;
            break;
        case RailLayout.TURN_NORTH_EAST:
            turn = true;
            state.angle = Math.PI;
            break;
    }

    const dt = Math.min(time.delta, 0.025);
    if (straight || turn) {
        wagon.physics.temp.position.x += Math.sin(state.angle) * dt;
        wagon.physics.temp.position.z += Math.cos(state.angle) * dt;
    }
    if (turn) {
        wagon.physics.temp.angle = state.angle;
        wEuler.set(0, state.angle, 0, 'XZY');
        wagon.physics.orientation.setFromEuler(wEuler);
    }
}

const UndergasRailLayout = {
    /** Undergas mine rails **/
    // Straight
    NORTH_SOUTH:           14,
    WEST_EAST:             15,
    UP_NORTH:              58,
    UP_SOUTH:              59,
    UP_WEST:               52,
    UP_EAST:               57,
    // Turns
    TURN_NORTH_WEST:       16,
    TURN_NORTH_EAST:       18,
    TURN_SOUTH_WEST:       19,
    TURN_SOUTH_EAST:       17,
    // Turnouts
    TO_NORTH_NORTH_WEST:   66,
    TO_NORTH_NORTH_EAST:   67,
    TO_SOUTH_SOUTH_WEST:   50,
    TO_SOUTH_SOUTH_EAST:   60,
    TO_EAST_EAST_SOUTH:    21,
    TO_EAST_EAST_NORTH:    20,
    TO_WEST_WEST_SOUTH:    62,
    TO_WEST_WEST_NORTH:    64,
};

function mapUndergasToBuRails(scene: Scene, rail: number) {
    const scenery = scene.scenery as IsoScenery;
    if (scenery.grid.library.index === 11) { // Mine library
        switch (rail) {
            case UndergasRailLayout.NORTH_SOUTH:           return RailLayout.NORTH_SOUTH;
            case UndergasRailLayout.WEST_EAST:             return RailLayout.WEST_EAST;
            case UndergasRailLayout.UP_NORTH:              return RailLayout.UP_NORTH;
            case UndergasRailLayout.UP_SOUTH:              return RailLayout.UP_SOUTH;
            case UndergasRailLayout.UP_WEST:               return RailLayout.UP_WEST;
            case UndergasRailLayout.UP_EAST:               return RailLayout.UP_EAST;
            case UndergasRailLayout.TURN_NORTH_WEST:       return RailLayout.TURN_NORTH_WEST;
            case UndergasRailLayout.TURN_NORTH_EAST:       return RailLayout.TURN_NORTH_EAST;
            case UndergasRailLayout.TURN_SOUTH_WEST:       return RailLayout.TURN_SOUTH_WEST;
            case UndergasRailLayout.TURN_SOUTH_EAST:       return RailLayout.TURN_NORTH_EAST;
            case UndergasRailLayout.TO_NORTH_NORTH_WEST:   return RailLayout.TO_NORTH_NORTH_WEST;
            case UndergasRailLayout.TO_NORTH_NORTH_EAST:   return RailLayout.TO_NORTH_NORTH_EAST;
            case UndergasRailLayout.TO_SOUTH_SOUTH_WEST:   return RailLayout.TO_SOUTH_SOUTH_WEST;
            case UndergasRailLayout.TO_SOUTH_SOUTH_EAST:   return RailLayout.TO_SOUTH_SOUTH_EAST;
            case UndergasRailLayout.TO_EAST_EAST_SOUTH:    return RailLayout.TO_EAST_EAST_SOUTH;
            case UndergasRailLayout.TO_EAST_EAST_NORTH:    return RailLayout.TO_EAST_EAST_NORTH;
            case UndergasRailLayout.TO_WEST_WEST_SOUTH:    return RailLayout.TO_WEST_WEST_SOUTH;
            case UndergasRailLayout.TO_WEST_WEST_NORTH:    return RailLayout.TO_WEST_WEST_NORTH;
        }
    }
    return rail;
}
