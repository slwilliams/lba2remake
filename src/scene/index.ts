import * as THREE from 'three';

import { DirMode } from '../game/actors';
import { bits } from '../utils';
import { loadTextData } from '../text';
import  {WORLD_SCALE } from '../utils/lba';
import { loadResource, ResourceType } from '../resources';

export async function loadSceneData(language, index) {
    const [scene, text, ress, pal] = await Promise.all([
        loadResource(ResourceType.SCENE),
        loadResource(ResourceType.TEXT),
        loadResource(ResourceType.RESS),
        loadResource(ResourceType.PALETTE),
    ]);
    const files = {scene, text, ress, pal};
    return loadSceneDataSync(files, language, index);
}

const cachedSceneData = [];

function loadSceneDataSync(files, language, index) {
    if (cachedSceneData[index]) {
        return cachedSceneData[index];
    }
    const buffer = files.scene.getEntry(index + 1); // first entry is not a scene
    const data = new DataView(buffer);
    const textBankId = data.getInt8(0);
    const sceneData = {
        index,
        textBankId,
        textIndex: (textBankId * 2) + 6 + (language.index * 30),
        gameOverScene: data.getInt8(1),
        unknown1: data.getUint16(2, true),
        unknown2: data.getUint16(4, true),
        isOutsideScene: data.getInt8(6) === 1,
        buffer,
        palette: files.pal.getBufferUint8(),
        actors: [],
        texts: null
    };

    let offset = 7;
    offset = loadAmbience(sceneData, offset);
    offset = loadHero(sceneData, offset);
    offset = loadActors(sceneData, offset);
    offset = loadZones(sceneData, offset);
    offset = loadPoints(sceneData, offset);
    loadPatches(sceneData, offset);

    sceneData.texts = loadTextData(files.text, {data: language, index: sceneData.textIndex});

    cachedSceneData[index] = sceneData;
    return sceneData;
}

function loadAmbience(scene, offset) {
    const data = new DataView(scene.buffer, offset, offset + 49);
    let innerOffset = 0;

    scene.ambience = {
        lightingAlpha: data.getInt16(innerOffset, true),
        lightingBeta: data.getInt16(innerOffset + 2, true),
        samples: [],
        sampleMinDelay: data.getInt16(innerOffset + 44, true),
        sampleMinDelayRnd: data.getInt16(innerOffset + 46, true),
        sampleElapsedTime: 0,
        musicIndex: data.getInt8(innerOffset + 48),
    };

    innerOffset = 4;
    for (let i = 0; i < 4; i += 1) {
        scene.ambience.samples.push({
            ambience: data.getInt16(innerOffset, true),
            repeat: data.getInt16(innerOffset + 2, true),
            round: data.getInt16(innerOffset + 4, true),
            frequency: data.getInt16(innerOffset + 6, true),
            volume: data.getInt16(innerOffset + 8, true),
        });
        innerOffset += 10;
    }

    return offset + 49;
}

function loadHero(scene, offset) {
    const data = new DataView(scene.buffer);
    const hero = {
        sceneIndex: scene.index,
        entityIndex: 0,
        bodyIndex: 0,
        pos: [
            ((0x8000 - data.getInt16(offset + 4, true)) + 512) * WORLD_SCALE,
            data.getInt16(offset + 2, true) * WORLD_SCALE,
            data.getInt16(offset, true) * WORLD_SCALE
        ],
        index: 0,
        textColor: getHtmlColor(scene.palette, (12 * 16) + 12),
        angle: 0,
        speed: 5,
        dirMode: DirMode.MANUAL,
        runtimeFlags: createRuntimeFlags(),
        flags: {
            hasCollisions: true,
            hasCollisionBricks: true,
            hasCollisionZone: true,
            hasSpriteClipping: false,
            hasCollisionLow: false,
            hasCollisionFloor: true,
            hasMiniZV: false,
            hasInvalidPosition: false,
            hasSpriteAnim3D: false,
            hasZBuffer: false,
            hasZBufferInWater: false,

            canBePunched: true,
            canDrown: true,
            canFall: true,
            canCarrierActor: false,

            isVisible: true,
            isSprite: false,
            isBackgrounded: false,

            noShadow: false,
            noElectricShock: false,
            noPreClipping: false,
        },
        moveScriptSize: 0,
        moveScript: null,
        lifeScriptSize: 0,
        lifeScript: null
    };
    offset += 6;

    hero.moveScriptSize = data.getInt16(offset, true);
    offset += 2;
    if (hero.moveScriptSize > 0) {
        hero.moveScript = new DataView(scene.buffer, offset, hero.moveScriptSize);
    }
    offset += hero.moveScriptSize;

    hero.lifeScriptSize = data.getInt16(offset, true);
    offset += 2;
    if (hero.lifeScriptSize > 0) {
        hero.lifeScript = new DataView(scene.buffer, offset, hero.lifeScriptSize);
    }
    offset += hero.lifeScriptSize;

    scene.actors.push(hero);

    return offset;
}

function loadActors(scene, offset) {
    const data = new DataView(scene.buffer);

    const numActors = data.getInt16(offset, true);
    offset += 2;

    for (let i = 1; i < numActors; i += 1) {
        const actor = {
            sceneIndex: scene.index,
            index: i,
            dirMode: DirMode.NO_MOVE,
            runtimeFlags: createRuntimeFlags(),
            flags: null,
            entityIndex: -1,
            bodyIndex: -1,
            animIndex: -1,
            spriteIndex: -1,
            pos: null,
            hitStrength: 0,
            extraType: -1,
            angle: 0,
            speed: 0,
            controlMode: 0,
            info0: -1,
            info1: -1,
            info2: -1,
            info3: -1,
            extraAmount: -1,
            textColor: null,
            spriteAnim3DNumber: -1,
            spriteSizeHit: -1,
            armour: -1,
            life: -1,
            moveScriptSize: 0,
            moveScript: null,
            lifeScriptSize: 0,
            lifeScript: null
        };

        const staticFlags = data.getUint32(offset, true);
        actor.flags = parseStaticFlags(staticFlags);
        offset += 4;

        actor.entityIndex = data.getInt16(offset, true);
        offset += 2;
        actor.bodyIndex = data.getUint8(offset);
        offset += 1;
        actor.animIndex = data.getInt16(offset, true);
        offset += 2;
        actor.spriteIndex = data.getInt16(offset, true);
        offset += 2;

        actor.pos = [
            ((0x8000 - data.getInt16(offset + 4, true)) + 512) * WORLD_SCALE,
            data.getInt16(offset + 2, true) * WORLD_SCALE,
            data.getInt16(offset, true) * WORLD_SCALE
        ];
        offset += 6;

        actor.hitStrength = data.getInt8(offset);
        offset += 1;
        actor.extraType = data.getInt16(offset, true);
        offset += 2;
        actor.angle = data.getInt16(offset, true);
        offset += 2;
        actor.speed = data.getInt16(offset, true);
        offset += 2;
        actor.controlMode = data.getInt8(offset);
        offset += 1;

        actor.info0 = data.getInt16(offset, true);
        offset += 2;
        actor.info1 = data.getInt16(offset, true);
        offset += 2;
        actor.info2 = data.getInt16(offset, true);
        offset += 2;
        actor.info3 = data.getInt16(offset, true);
        offset += 2;

        actor.extraAmount = data.getInt16(offset, true);
        offset += 2;
        const textColor = data.getInt8(offset);
        offset += 1;
        actor.textColor = getHtmlColor(scene.palette, (textColor * 16) + 12);

        if (actor.flags.hasSpriteAnim3D) {
            actor.spriteAnim3DNumber = data.getUint32(offset, true);
            offset += 4;
            actor.spriteSizeHit = data.getInt16(offset, true);
            actor.info3 = actor.spriteSizeHit;
            offset += 2;
        }
        actor.armour = data.getUint8(offset);
        offset += 1;
        actor.life = data.getUint8(offset);
        offset += 1;

        actor.moveScriptSize = data.getInt16(offset, true);
        offset += 2;
        if (actor.moveScriptSize > 0) {
            actor.moveScript = new DataView(scene.buffer, offset, actor.moveScriptSize);
        }
        offset += actor.moveScriptSize;

        actor.lifeScriptSize = data.getInt16(offset, true);
        offset += 2;
        if (actor.lifeScriptSize > 0) {
            actor.lifeScript = new DataView(scene.buffer, offset, actor.lifeScriptSize);
        }
        offset += actor.lifeScriptSize;

        scene.actors.push(actor);
    }

    return offset;
}

function loadZones(scene, offset) {
    const data = new DataView(scene.buffer);
    scene.zones = [];

    offset += 4; // skip unknown bytes

    const numZones = data.getInt16(offset, true);
    offset += 2;

    for (let i = 0; i < numZones; i += 1) {
        const zone = {
            sceneIndex: scene.index,
            index: i,
            type: 0,
            box: {xMin: 0, xMax: 0, yMin: 0, yMax: 0, zMin: 0, zMax: 0},
            info0: -1,
            info1: -1,
            info2: -1,
            info3: -1,
            info4: -1,
            info5: -1,
            info6: -1,
            info7: -1,
            snap: -1,
            pos: null
        };

        // xMin and xMax are inverted because x axis is inverted
        zone.box.xMax = ((0x8000 - data.getInt32(offset + 8, true)) + 512) * WORLD_SCALE;
        zone.box.yMin = data.getInt32(offset + 4, true) * WORLD_SCALE;
        zone.box.zMin = data.getInt32(offset, true) * WORLD_SCALE;
        zone.box.xMin = ((0x8000 - data.getInt32(offset + 20, true)) + 512) * WORLD_SCALE;
        zone.box.yMax = data.getInt32(offset + 16, true) * WORLD_SCALE;
        zone.box.zMax = data.getInt32(offset + 12, true) * WORLD_SCALE;
        offset += 24;

        zone.info0 = data.getInt32(offset, true);
        zone.info1 = data.getInt32(offset + 4, true);
        zone.info2 = data.getInt32(offset + 8, true);
        zone.info3 = data.getInt32(offset + 12, true);
        zone.info4 = data.getInt32(offset + 16, true);
        zone.info5 = data.getInt32(offset + 20, true);
        zone.info6 = data.getInt32(offset + 24, true);
        zone.info7 = data.getInt32(offset + 28, true);
        zone.type = data.getInt16(offset + 32, true);
        zone.snap = data.getInt16(offset + 34, true);
        offset += 36;

        // normalising position
        zone.pos = [
            zone.box.xMin + ((zone.box.xMax - zone.box.xMin) / 2),
            zone.box.yMin + ((zone.box.yMax - zone.box.yMin) / 2),
            zone.box.zMin + ((zone.box.zMax - zone.box.zMin) / 2)
        ];

        scene.zones.push(zone);
    }

    return offset;
}

function loadPoints(scene, offset) {
    const data = new DataView(scene.buffer);
    scene.points = [];

    const numPoints = data.getInt16(offset, true);
    offset += 2;

    for (let i = 0; i < numPoints; i += 1) {
        const point = {
            sceneIndex: scene.index,
            index: i,
            pos: [
                ((0x8000 - data.getInt32(offset + 8, true)) + 512) * WORLD_SCALE,
                data.getInt32(offset + 4, true) * WORLD_SCALE,
                data.getInt32(offset, true) * WORLD_SCALE
            ]
        };
        offset += 12;
        scene.points.push(point);
    }

    return offset;
}

function loadPatches(scene, offset) {
    const data = new DataView(scene.buffer);
    scene.patches = [];

    const numData = data.getInt16(offset, true);
    offset += 2;

    for (let i = 0; i < numData; i += 1) {
        const unk = {
            sceneIndex: scene.index,
            size: data.getInt16(offset, true),
            offset: data.getInt16(offset + 2, true)
        };
        offset += 4;
        scene.patches.push(unk);
    }

    return offset;
}

function parseStaticFlags(staticFlags) {
    return {
        hasCollisions: bits(staticFlags, 0, 1) === 1,
        hasCollisionBricks: bits(staticFlags, 1, 1) === 1,
        hasCollisionZone: bits(staticFlags, 2, 1) === 1,
        hasSpriteClipping: bits(staticFlags, 3, 1) === 1,
        hasCollisionLow: bits(staticFlags, 5, 1) === 1,
        hasCollisionFloor: bits(staticFlags, 7, 1) === 1,
        hasMiniZV: bits(staticFlags, 15, 1) === 1,
        hasInvalidPosition: bits(staticFlags, 16, 1) === 1,
        hasSpriteAnim3D: bits(staticFlags, 18, 1) === 1,
        hasZBuffer: bits(staticFlags, 20, 1) === 1,
        hasZBufferInWater: bits(staticFlags, 21, 1) === 1,

        canBePunched: bits(staticFlags, 4, 1) === 1,
        canDrown: bits(staticFlags, 6, 1) === 1,
        canFall: bits(staticFlags, 11, 1) === 1,
        canCarrierActor: bits(staticFlags, 14, 1) === 1,

        isVisible: bits(staticFlags, 9, 1) === 0,
        isSprite: bits(staticFlags, 10, 1) === 1,
        isBackgrounded: bits(staticFlags, 13, 1) === 1,

        noShadow: bits(staticFlags, 12, 1) === 1,
        noElectricShock: bits(staticFlags, 17, 1) === 1,
        noPreClipping: bits(staticFlags, 19, 1) === 1,
    };
}

function createRuntimeFlags() {
    return {
        waitHitFrame: false,
        isHitting: false,
        hasAnimEnded: false,
        hasNewFrame: false,
        wasDrawn: false,
        isDead: false,
        isSpriteMoving: false,
        hasRotationByAnim: false,
        isFalling: false,
        isSuperHitting: false,
        hasFrameShield: false,
        canDrawShadow: false,
        hasGravityByAnim: false,
        isSkating: false,
        canThrowProjectile: false,
        canLeftJump: false,
        canRightJump: false,
        waitSuperHit: false,
        hasRotationByTrack: false,
        canFlyJetPack: false,
        unknown20: false,
        hasManualFrame: false,
        waitPosition: false,
        forceFalling: false,
        // not from original from this point
        isJumping: false,
        isWalking: false,
        isTurning: false,
        isFighting: false,
        repeatHit: 0,
        isSwitchingHit: false,
        isCrouching: false,
        isClimbing: false,
        isColliding: false,
        isDrowning: false,
        isTouchingGround: false,
        isTouchingFloor: false,
    };
}

export function getHtmlColor(palette, index) {
    return `#${new THREE.Color(
        palette[index * 3] / 255,
        palette[(index * 3) + 1] / 255,
        palette[(index * 3) + 2] / 255
    ).getHexString()}`;
}
