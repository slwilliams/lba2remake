import {getHtmlColor} from '../../scene';
import {DirMode} from '../../game/actors';
import {loadSprite} from '../../iso/sprites';

export const ZoneOpcode = [
    { opcode: 0, command: 'CUBE', callback: CUBE },
    { opcode: 1, command: 'CAMERA', callback: NOP },
    { opcode: 2, command: 'SCENERIC', callback: NOP },
    { opcode: 3, command: 'FRAGMENT', callback: NOP },
    { opcode: 4, command: 'BONUS', callback: BONUS },
    { opcode: 5, command: 'TEXT', callback: TEXT },
    { opcode: 6, command: 'LADDER', callback: NOP },
    { opcode: 7, command: 'CONVEYOR', callback: NOP },
    { opcode: 8, command: 'SPIKE', callback: NOP },
    { opcode: 9, command: 'RAIL', callback: NOP }
];

export function processZones(game, scene) {
    const hero = scene.actors[0];
    const pos = hero.physics.position.clone();
    pos.y += 0.005;
    for (let i = 0; i < scene.zones.length; i += 1) {
        const zone = scene.zones[i];
        if (zone.props.type === 2)
            continue;

        const box = zone.props.box;
        if (pos.x > box.xMin && pos.x < box.xMax &&
            pos.y > box.yMin && pos.y < box.yMax &&
            pos.z > box.zMin && pos.z < box.zMax) {
            const zoneType = ZoneOpcode[zone.props.type];
            if (zoneType !== null && zoneType.callback !== null) {
                if (zoneType.callback(game, scene, zone, hero))
                    break;
            }
        }
    }
}

/**
 * @return {boolean}
 */
function CUBE(game, scene, zone, hero) {
    if (!(scene.sideScenes && zone.props.snap in scene.sideScenes)) {
        scene.goto(zone.props.snap, (newScene) => {
            const newHero = newScene.actors[0];
            newHero.physics.position.x = ((0x8000 - zone.props.info2) + 511) / 0x4000;
            newHero.physics.position.y = zone.props.info1 / 0x4000;
            newHero.physics.position.z = zone.props.info0 / 0x4000;
            newHero.physics.temp.angle = hero.physics.temp.angle;
            newHero.physics.orientation.copy(hero.physics.orientation);
            newHero.threeObject.quaternion.copy(newHero.physics.orientation);
            newHero.threeObject.position.copy(newHero.physics.position);
        });
        return true;
    }
    return false;
}

function TEXT(game, scene, zone, hero) {
    const voiceSource = game.getAudioManager().getVoiceSource();
    if (game.controlsState.action === 1) {
        if (!scene.zoneState.listener) {
            scene.actors[0].props.dirMode = DirMode.NO_MOVE;

            hero.props.prevEntityIndex = hero.props.entityIndex;
            hero.props.prevAnimIndex = hero.props.animIndex;
            hero.props.entityIndex = 0;
            hero.props.animIndex = 28; // talking / reading
            scene.zoneState.currentChar = 0;

            const text = scene.data.texts[zone.props.snap];
            game.setUiState({
                text: {
                    type: text.type === 3 ? 'big' : 'small',
                    value: text.value,
                    color: getHtmlColor(scene.data.palette, (zone.props.info0 * 16) + 12)
                }
            });

            scene.zoneState.listener = (event) => {
                const key = event.code || event.which || event.keyCode;
                if (key === 'Enter' || key === 13) {
                    scene.zoneState.ended = true;
                    game.setUiState({text: null});
                    scene.actors[0].props.dirMode = DirMode.MANUAL;
                }
            };

            window.addEventListener('keydown', scene.zoneState.listener);
            voiceSource.load(text.index, scene.data.textBankId, () => {
                voiceSource.play();
            });
        }
    }
    if (scene.zoneState.ended) {
        hero.props.entityIndex = hero.props.prevEntityIndex;
        hero.props.animIndex = hero.props.prevAnimIndex;
        voiceSource.stop();
        game.setUiState({text: null});
        window.removeEventListener('keydown', scene.zoneState.listener);
        delete scene.zoneState.listener;
        delete scene.zoneState.ended;
    }
}

function BONUS(game, scene, zone, hero) {
    if (game.controlsState.action === 1) {
        hero.props.prevEntityIndex = hero.props.entityIndex;
        hero.props.prevAnimIndex = hero.props.animIndex;
        hero.props.entityIndex = 0;

        // CHECK Possibly needs to use 'waitPosition' runtime flag
        hero.props.runtimeFlags.isDoingBonus = true;

        hero.props.animIndex = 11; // Action jump, equivalent to real-index 17

        const base2 = (zone.props.info0).toString(2);
        const binaryTypes = ('000000000').substr(base2.length) + base2;
        const typesArray = [];

        /* TODO
         * Consider an object type or class for bonus items, instead of just scene sprites
         * It probably needs to have a type of its own in order to be able to move/animate,
         * and be updated from main loop
         */

        // Populate array of possible spriteTypes based on the binary value of the info0 prop
        for (let i = binaryTypes.length; i > 0; i -= 1) {
            if (parseInt(binaryTypes[binaryTypes.length - i], 10) === 1)
                typesArray.push(i);
        }

        // Pick one of the available spriteTypes (multiple can be set) at random from the Array
        let spriteIndex = -2 + typesArray[Math.floor(Math.random() * typesArray.length)];

        /* TODO
         * Decide which planet you're on, in order to decide what type of money to spawn. (sprite)
         * Current sprite value for gold is "3", which is a pointer according to kazekr website.
         * Check GIVE_BONUS, GIVE_GOLD_PIECES or similar scripts.
        */

        switch (spriteIndex) {
            case 3:
                // In case of gold, pick Kashes for now
                spriteIndex += 15;
                break;
        }

        if (zone.props.snap === 0) {
            // If it is an Outside scene, use a bilboarded Three.Sprite.
            // Otherwise, use a Three.Mesh
            loadSprite(spriteIndex, (bonusSprite) => {
                bonusSprite.threeObject.position.copy(zone.physics.position);
                scene.addMesh(bonusSprite.threeObject);
            }, scene.data.isOutsideScene);

            zone.props.snap = 1;
        }
    }
}

function NOP() {
}
