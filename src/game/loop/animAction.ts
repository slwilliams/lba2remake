import { each } from 'lodash';

import { getRandom } from '../../utils/lba';
import { unimplemented } from '../scripting/utils';

export const NOP = unimplemented();

export const BODY = unimplemented();

export const BODP = unimplemented();

export const ANIM = unimplemented();

export const ANIP = unimplemented();

export const HIT = unimplemented();

export const SAMPLE = (action, { game }) => {
    const audio = game.getAudioManager();
    audio.playSample(action.sampleIndex, action.frequency);
};

export const SAMPLE_RND = (action, { game }) => {
    let frequency = (getRandom(0, action.frequency) + 0x1000) - (action.frequency >> 1);
    if (frequency < 0 || frequency > 24000) {
        frequency = 0;
    }
    const audio = game.getAudioManager();
    audio.playSample(action.sampleIndex, frequency);
};

export const THROW = unimplemented();

export const THROW_MAGIC = unimplemented();

export const SAMPLE_REPEAT = (action, { game }) => {
    const audio = game.getAudioManager();
    //console.log("in here");
    if (!audio.isPlayingSample(action.sampleIndex)) {
        audio.playSample(action.sampleIndex, 0x1000, action.repeat);
    }
};

export const THROW_SEARCH = unimplemented();

export const THROW_ALPHA = unimplemented();

export const SAMPLE_STOP = (action, { game }) => {
    const audio = game.getAudioManager();
    audio.stopSample(action.sampleIndex);
};

export const ZV = unimplemented();

export const LEFT_STEP = (_action, { game, animState }) => {
    let sampleIndex = animState.floorSound;
    if (sampleIndex !== undefined && sampleIndex !== -1) {
        sampleIndex += 30;
        // const frequency = getRandom(0, 0x1000) + 3596;
        const audio = game.getAudioManager();
        audio.playSample(sampleIndex); // frequency
    }
};

export const RIGHT_STEP = (_action, { game, animState }) => {
    let sampleIndex = animState.floorSound;
    if (sampleIndex !== undefined && sampleIndex !== -1) {
        sampleIndex += 30;
        // const frequency = getRandom(0, 0x1000) + 3596;
        const audio = game.getAudioManager();
        audio.playSample(sampleIndex); // frequency
    }
};

export const HIT_HERO = unimplemented();

export const THROW_3D = unimplemented();

export const THROW_3D_ALPHA = unimplemented();

export const THROW_3D_SEARCH = unimplemented();

export const THROW_3D_MAGIC = unimplemented();

export const SUPER_HIT = unimplemented();

export const THROW_OBJ_3D = unimplemented();

export const PATH = unimplemented();

export const FLOW = unimplemented();

export const FLOW_3D = unimplemented();

export const THROW_DART = unimplemented();

export const SHIELD = unimplemented();

export const SAMPLE_MAGIC = (_, { game }) => {
    const hero = game.getState();
    let index = 0;
    if (hero.magicball.level === 4) {
        index = 1;
    }
    const audio = game.getAudioManager();
    audio.playSample(index);
};

export const THROW_3D_CONQUE = unimplemented();

export const ZV_ANIMIT = unimplemented();

export const IMPACT = unimplemented();

export const RENVOIE = unimplemented();

export const RENVOYABLE = unimplemented();

export const TRANSPARENT = unimplemented();

export const SCALE = unimplemented();

export const LEFT_JUMP = unimplemented();

export const RIGHT_JUMP = unimplemented();

export const NEW_SAMPLE = (action, { game }) => {
    const audio = game.getAudioManager();
    audio.playSample(action.sampleIndex, action.frequency);
};

export const IMPACT_3D = unimplemented();

export const THROW_MAGIC_EXTRA = unimplemented();

export const THROW_FOUDRE = unimplemented();

const AnimActionOpcode = [
    { opcode: 0, command: 'NOP', handler: NOP },
    { opcode: 1, command: 'BODY', handler: BODY },
    { opcode: 2, command: 'BODP', handler: BODP },
    { opcode: 3, command: 'ANIM', handler: ANIM },
    { opcode: 4, command: 'ANIP', handler: ANIP },
    { opcode: 5, command: 'HIT', handler: HIT },
    { opcode: 6, command: 'SAMPLE', handler: SAMPLE },
    { opcode: 7, command: 'SAMPLE_RND', handler: SAMPLE_RND },
    { opcode: 8, command: 'THROW', handler: THROW },
    { opcode: 9, command: 'THROW_MAGIC', handler: THROW_MAGIC },
    { opcode: 10, command: 'SAMPLE_REPEAT', handler: SAMPLE_REPEAT },
    { opcode: 11, command: 'THROW_SEARCH', handler: THROW_SEARCH },
    { opcode: 12, command: 'THROW_ALPHA', handler: THROW_ALPHA },
    { opcode: 13, command: 'SAMPLE_STOP', handler: SAMPLE_STOP },
    { opcode: 14, command: 'ZV', handler: ZV },
    { opcode: 15, command: 'LEFT_STEP', handler: LEFT_STEP },
    { opcode: 16, command: 'RIGHT_STEP', handler: RIGHT_STEP },
    { opcode: 17, command: 'HIT_HERO', handler: HIT_HERO },
    { opcode: 18, command: 'THROW_3D', handler: THROW_3D },
    { opcode: 19, command: 'THROW_3D_ALPHA', handler: THROW_3D_ALPHA },
    { opcode: 20, command: 'THROW_3D_SEARCH', handler: THROW_3D_SEARCH },
    { opcode: 21, command: 'THROW_3D_MAGIC', handler: THROW_3D_MAGIC },
    { opcode: 22, command: 'SUPER_HIT', handler: SUPER_HIT },
    { opcode: 23, command: 'THROW_OBJ_3D', handler: THROW_OBJ_3D },
    { opcode: 24, command: 'PATH', handler: PATH },
    { opcode: 25, command: 'FLOW', handler: FLOW },
    { opcode: 26, command: 'FLOW_3D', handler: FLOW_3D },
    { opcode: 27, command: 'THROW_DART', handler: THROW_DART },
    { opcode: 28, command: 'SHIELD', handler: SHIELD },
    { opcode: 29, command: 'SAMPLE_MAGIC', handler: SAMPLE_MAGIC },
    { opcode: 30, command: 'THROW_3D_CONQUE', handler: THROW_3D_CONQUE },
    { opcode: 31, command: 'ZV_ANIMIT', handler: ZV_ANIMIT },
    { opcode: 32, command: 'IMPACT', handler: IMPACT },
    { opcode: 33, command: 'RENVOIE', handler: RENVOIE },
    { opcode: 34, command: 'RENVOYABLE', handler: RENVOYABLE },
    { opcode: 35, command: 'TRANSPARENT', handler: TRANSPARENT },
    { opcode: 36, command: 'SCALE', handler: SCALE },
    { opcode: 37, command: 'LEFT_JUMP', handler: LEFT_JUMP },
    { opcode: 38, command: 'RIGHT_JUMP', handler: RIGHT_JUMP },
    { opcode: 39, command: 'NEW_SAMPLE', handler: NEW_SAMPLE },
    { opcode: 40, command: 'IMPACT_3D', handler: IMPACT_3D },
    { opcode: 41, command: 'THROW_MAGIC_EXTRA', handler: THROW_MAGIC_EXTRA },
    { opcode: 42, command: 'THROW_FOUDRE', handler: THROW_FOUDRE },
];

export const processAnimAction = (ctx) => {
    const {entityAnim, animState} = ctx;
    const actions = entityAnim.actions;
    const animFrame = animState.currentFrame;
    each(actions, (action) => {
        if (action.animFrame === animFrame && animState.keyframeChanged) {
            const actionType = AnimActionOpcode[action.type];
            if (actionType !== undefined && actionType.handler !== undefined) {
                actionType.handler(action, ctx);
            }
        }
    });
};
