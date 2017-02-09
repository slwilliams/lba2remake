import * as ls from '../process/life';
import * as lo from '../process/operators';
import Indent from '../indent';

export const LifeOpcode = [
    { opcode: 0x00, command: "END", callback: lo.END, indent: Indent.KEEP },
    { opcode: 0x01, command: "NOP", callback: lo.NOP, indent: Indent.KEEP },
    { opcode: 0x02, command: "SNIF", callback: lo.SNIF, args: ['_Uint16:offset'], condition: true, operator: true, indent: Indent.ADD},
    { opcode: 0x03, command: "OFFSET", callback: lo.OFFSET, indent: Indent.KEEP},
    { opcode: 0x04, command: "NEVERIF", callback: lo.NEVERIF, args: ['_Uint16:offset'], condition: true, operator: true, indent: Indent.ADD},
    { opcode: 0x05, command: "UNKNOWN(0x05)", callback: lo.NOP, indent: Indent.KEEP},
    { opcode: 0x06, command: "UNKNOWN(0x06)", callback: lo.NOP, indent: Indent.KEEP},
    { opcode: 0x07, command: "UNKNOWN(0x07)", callback: lo.NOP, indent: Indent.KEEP},
    { opcode: 0x08, command: "UNKNOWN(0x08)", callback: lo.NOP, indent: Indent.KEEP},
    { opcode: 0x09, command: "UNKNOWN(0x09)", callback: lo.NOP, indent: Indent.KEEP},
    { opcode: 0x0A, command: "PALETTE", callback: ls.PALETTE, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x0B, command: "RETURN", callback: lo.RETURN, indent: Indent.KEEP},
    { opcode: 0x0C, command: "IF", callback: lo.IF, args: ['_Uint16:offset'], condition: true, operator: true, indent: Indent.ADD},
    { opcode: 0x0D, command: "SWIF", callback: lo.SWIF, args: ['_Uint16:offset'], condition: true, operator: true, indent: Indent.ADD},
    { opcode: 0x0E, command: "ONEIF", callback: lo.ONEIF, args: ['_Uint16:offset'], condition: true, operator: true, indent: Indent.ADD},
    { opcode: 0x0F, command: "ELSE", callback: lo.ELSE, args: ['_Uint16:offset'], indent: Indent.SUB_ADD},
    { opcode: 0x10, command: "ENDIF", callback: lo.ENDIF, indent: Indent.SUB},
    { opcode: 0x11, command: "BODY", callback: ls.BODY, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x12, command: "BODY_OBJ", callback: ls.BODY_OBJ, args: ['Uint8:actor', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x13, command: "ANIM", callback: ls.ANIM, args: ['Int16'], indent: Indent.KEEP},
    { opcode: 0x14, command: "ANIM_OBJ", callback: ls.ANIM_OBJ, args: ['Uint8:actor', 'Int16'], indent: Indent.KEEP},
    { opcode: 0x15, command: "SET_CAMERA", callback: ls.SET_CAMERA, args: ['Uint16'], indent: Indent.KEEP},
    { opcode: 0x16, command: "CAMERA_CENTER", callback: ls.CAMERA_CENTER, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x17, command: "SET_TRACK", callback: ls.SET_TRACK, args: ['Int16'], indent: Indent.KEEP},
    { opcode: 0x18, command: "SET_TRACK_OBJ", callback: ls.SET_TRACK_OBJ, args: ['Uint8:actor', 'Int16'], indent: Indent.KEEP},
    { opcode: 0x19, command: "MESSAGE", callback: ls.MESSAGE, args: ['Uint16'], indent: Indent.KEEP},
    { opcode: 0x1A, command: "CAN_FALL", callback: ls.CAN_FALL, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x1B, command: "SET_DIRMODE", callback: ls.SET_DIRMODE, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x1C, command: "SET_DIRMODE_OBJ", callback: ls.SET_DIRMODE_OBJ, args: ['Uint8:actor', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x1D, command: "CAM_FOLLOW", callback: ls.CAM_FOLLOW, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x1E, command: "SET_BEHAVIOUR", callback: ls.SET_BEHAVIOUR, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x1F, command: "SET_VAR_CUBE", callback: ls.SET_VAR_CUBE, args: ['Uint8', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x20, command: "COMPORTEMENT", callback: lo.COMPORTEMENT, args: ['Uint8'], indent: Indent.ADD},
    { opcode: 0x21, command: "SET_COMPORTEMENT", callback: lo.SET_COMPORTEMENT, args: ['Uint16:offset'], indent: Indent.KEEP},
    { opcode: 0x22, command: "SET_COMPORTEMENT_OBJ", callback: lo.SET_COMPORTEMENT_OBJ, args: ['Uint8:actor', 'Uint16'], indent: Indent.KEEP},
    { opcode: 0x23, command: "END_COMPORTEMENT", callback: lo.END_COMPORTEMENT, indent: Indent.SUB},
    { opcode: 0x24, command: "SET_VAR_GAME", callback: ls.SET_VAR_GAME, args: ['Uint8', 'Uint8', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x25, command: "KILL_OBJ", callback: ls.KILL_OBJ, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x26, command: "SUICIDE", callback: ls.SUICIDE, indent: Indent.KEEP},
    { opcode: 0x27, command: "USE_ONE_LITTLE_KEY", callback: ls.USE_ONE_LITTLE_KEY, indent: Indent.KEEP},
    { opcode: 0x28, command: "GIVE_GOLD_PIECES", callback: ls.GIVE_GOLD_PIECES, args: ['Int16'], indent: Indent.KEEP},
    { opcode: 0x29, command: "END_LIFE", callback: ls.END_LIFE, indent: Indent.KEEP},
    { opcode: 0x2A, command: "STOP_CURRENT_TRACK", callback: ls.STOP_CURRENT_TRACK, indent: Indent.KEEP},
    { opcode: 0x2B, command: "RESTORE_LAST_TRACK", callback: ls.RESTORE_LAST_TRACK, indent: Indent.KEEP},
    { opcode: 0x2C, command: "MESSAGE_OBJ", callback: ls.MESSAGE_OBJ, args: ['Uint8:actor', 'Uint16'], indent: Indent.KEEP},
    { opcode: 0x2D, command: "INC_CHAPTER", callback: ls.INC_CHAPTER, indent: Indent.KEEP},
    { opcode: 0x2E, command: "FOUND_OBJECT", callback: ls.FOUND_OBJECT, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x2F, command: "SET_DOOR_LEFT", callback: ls.SET_DOOR_LEFT, args: ['Int16'], indent: Indent.KEEP},
    { opcode: 0x30, command: "SET_DOOR_RIGHT", callback: ls.SET_DOOR_RIGHT, args: ['Int16'], indent: Indent.KEEP},
    { opcode: 0x31, command: "SET_DOOR_UP", callback: ls.SET_DOOR_UP, args: ['Int16'], indent: Indent.KEEP},
    { opcode: 0x32, command: "SET_DOOR_DOWN", callback: ls.SET_DOOR_DOWN, args: ['Int16'], indent: Indent.KEEP},
    { opcode: 0x33, command: "GIVE_BONUS", callback: ls.GIVE_BONUS, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x34, command: "CHANGE_CUBE", callback: ls.CHANGE_CUBE, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x35, command: "OBJ_COL", callback: ls.OBJ_COL, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x36, command: "BRICK_COL", callback: ls.BRICK_COL, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x37, command: "OR_IF", callback: lo.OR_IF, args: ['_Uint16:offset'], precond: true, condition: true, operator: true, indent: Indent.KEEP},
    { opcode: 0x38, command: "INVISIBLE", callback: ls.INVISIBLE, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x39, command: "SHADOW_OBJ", callback: ls.SHADOW_OBJ, args: ['Uint8:actor', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x3A, command: "POS_POINT", callback: ls.POS_POINT, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x3B, command: "SET_MAGIC_LEVEL", callback: ls.SET_MAGIC_LEVEL, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x3C, command: "SUB_MAGIC_POINT", callback: ls.SUB_MAGIC_POINT, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x3D, command: "SET_LIFE_POINT_OBJ", callback: ls.SET_LIFE_POINT_OBJ, args: ['Uint8:actor', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x3E, command: "SUB_LIFE_POINT_OBJ", callback: ls.SUB_LIFE_POINT_OBJ, args: ['Uint8:actor', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x3F, command: "HIT_OBJ", callback: ls.HIT_OBJ, args: ['Uint8:actor', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x40, command: "PLAY_SMK", callback: ls.PLAY_SMK, args: ['string'], indent: Indent.KEEP},
    { opcode: 0x41, command: "ECLAIR", callback: ls.ECLAIR, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x42, command: "INC_CLOVER_BOX", callback: ls.INC_CLOVER_BOX, indent: Indent.KEEP},
    { opcode: 0x43, command: "SET_USED_INVENTORY", callback: ls.SET_USED_INVENTORY, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x44, command: "ADD_CHOICE", callback: ls.ADD_CHOICE, args: ['Uint16'], indent: Indent.KEEP},
    { opcode: 0x45, command: "ASK_CHOICE", callback: ls.ASK_CHOICE, args: ['Uint16'], indent: Indent.KEEP},
    { opcode: 0x46, command: "INIT_BUGGY", callback: ls.INIT_BUGGY, args: ['Uint16'], indent: Indent.KEEP},
    { opcode: 0x47, command: "MEMO_SLATE", callback: ls.MEMO_SLATE, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x48, command: "SET_HOLO_POS", callback: ls.SET_HOLO_POS, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x49, command: "CLR_HOLO_POS", callback: ls.CLR_HOLO_POS, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x4A, command: "ADD_FUEL", callback: ls.ADD_FUEL, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x4B, command: "SUB_FUEL", callback: ls.SUB_FUEL, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x4C, command: "SET_GRM", callback: ls.SET_GRM, args: ['Uint8', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x4D, command: "SET_CHANGE_CUBE", callback: ls.SET_CHANGE_CUBE, args: ['Uint8', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x4E, command: "MESSAGE_ZOE", callback: ls.MESSAGE_ZOE, args: ['Uint16'], indent: Indent.KEEP},
    { opcode: 0x4F, command: "FULL_POINT", callback: ls.FULL_POINT, indent: Indent.KEEP},
    { opcode: 0x50, command: "BETA", callback: ls.BETA, args: ['Int16'], indent: Indent.KEEP},
    { opcode: 0x51, command: "FADE_TO_PAL", callback: ls.FADE_TO_PAL, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x52, command: "ACTION", callback: ls.ACTION, indent: Indent.KEEP},
    { opcode: 0x53, command: "SET_FRAME", callback: ls.SET_FRAME, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x54, command: "SET_SPRITE", callback: ls.SET_SPRITE, args: ['Uint8', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x55, command: "SET_FRAME_3DS", callback: ls.SET_FRAME_3DS, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x56, command: "IMPACT_OBJ", callback: ls.IMPACT_OBJ, args: ['Uint8:actor', 'Uint16', 'Uint16'], indent: Indent.KEEP},
    { opcode: 0x57, command: "IMPACT_POINT", callback: ls.IMPACT_POINT, args: ['Uint8', 'Uint16'], indent: Indent.KEEP},
    { opcode: 0x58, command: "ADD_MESSAGE", callback: ls.ADD_MESSAGE, args: ['Uint16'], indent: Indent.KEEP},
    { opcode: 0x59, command: "BALLOON", callback: ls.BALLOON, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x5A, command: "NO_SHOCK", callback: ls.NO_SHOCK, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x5B, command: "ASK_CHOICE_OBJ", callback: ls.ASK_CHOICE_OBJ, args: ['Uint8:actor', 'Uint16'], indent: Indent.KEEP},
    { opcode: 0x5C, command: "CINEMA_MODE", callback: ls.CINEMA_MODE, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x5D, command: "SAVE_HERO", callback: ls.SAVE_HERO, indent: Indent.KEEP},
    { opcode: 0x5E, command: "RESTORE_HERO", callback: ls.RESTORE_HERO, indent: Indent.KEEP},
    { opcode: 0x5F, command: "ANIM_SET", callback: ls.ANIM_SET, args: ['Uint16'], indent: Indent.KEEP},
    { opcode: 0x60, command: "RAIN", callback: ls.RAIN, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x61, command: "GAME_OVER", callback: ls.GAME_OVER, indent: Indent.KEEP},
    { opcode: 0x62, command: "THE_END", callback: ls.THE_END, indent: Indent.KEEP},
    { opcode: 0x63, command: "ESCALATOR", callback: ls.ESCALATOR, indent: Indent.KEEP},
    { opcode: 0x64, command: "PLAY_MUSIC", callback: ls.PLAY_MUSIC, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x65, command: "TRACK_TO_VAR_GAME", callback: ls.TRACK_TO_VAR_GAME, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x66, command: "VAR_GAME_TO_TRACK", callback: ls.VAR_GAME_TO_TRACK, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x67, command: "ANIM_TEXTURE", callback: ls.ANIM_TEXTURE, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x68, command: "ADD_MESSAGE_OBJ", callback: ls.ADD_MESSAGE_OBJ, args: ['Uint8:actor', 'Uint16'], indent: Indent.KEEP},
    { opcode: 0x69, command: "BRUTAL_EXIT", callback: ls.BRUTAL_EXIT, indent: Indent.KEEP},
    { opcode: 0x6A, command: "REPLACE", callback: ls.REPLACE, indent: Indent.KEEP},
    { opcode: 0x6B, command: "SCALE", callback: ls.SCALE, args: ['Uint8', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x6C, command: "SET_ARMOR", callback: ls.SET_ARMOR, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x6D, command: "SET_ARMOR_OBJ", callback: ls.SET_ARMOR_OBJ, args: ['Uint8:actor', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x6E, command: "ADD_LIFE_POINT_OBJ", callback: ls.ADD_LIFE_POINT_OBJ, args: ['Uint8:actor', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x6F, command: "STATE_INVENTORY", callback: ls.STATE_INVENTORY, args: ['Uint8', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x70, command: "AND_IF", callback: lo.AND_IF, args: ['_Uint16:offset'], precond: true, condition: true, operator: true, indent: Indent.KEEP},
    { opcode: 0x71, command: "SWITCH", callback: lo.SWITCH, condition: 'SWITCH', indent: Indent.ADD},
    { opcode: 0x72, command: "OR_CASE", callback: lo.OR_CASE, argsFirst: true, args: ['_Uint16:offset'], operator: true, indent: Indent.KEEP},
    { opcode: 0x73, command: "CASE", callback: lo.CASE, argsFirst: true, args: ['_Uint16:offset'], operator: true, indent: Indent.ADD},
    { opcode: 0x74, command: "DEFAULT", callback: lo.DEFAULT, indent: Indent.ADD},
    { opcode: 0x75, command: "BREAK", callback: lo.BREAK, args: ['_Uint16:offset'], indent: Indent.SUB},
    { opcode: 0x76, command: "END_SWITCH", callback: lo.END_SWITCH, indent: Indent.SUB},
    { opcode: 0x77, command: "SET_HIT_ZONE", callback: ls.SET_HIT_ZONE, args: ['Uint8', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x78, command: "SAVE_COMPORTEMENT", callback: ls.SAVE_COMPORTEMENT, indent: Indent.KEEP},
    { opcode: 0x79, command: "RESTORE_COMPORTEMENT", callback: ls.RESTORE_COMPORTEMENT, indent: Indent.KEEP},
    { opcode: 0x7A, command: "SAMPLE", callback: ls.SAMPLE, args: ['Uint16'], indent: Indent.KEEP},
    { opcode: 0x7B, command: "SAMPLE_RND", callback: ls.SAMPLE_RND, args: ['Uint16'], indent: Indent.KEEP},
    { opcode: 0x7C, command: "SAMPLE_ALWAYS", callback: ls.SAMPLE_ALWAYS, args: ['Uint16'], indent: Indent.KEEP},
    { opcode: 0x7D, command: "SAMPLE_STOP", callback: ls.SAMPLE_STOP, args: ['Uint16'], indent: Indent.KEEP},
    { opcode: 0x7E, command: "REPEAT_SAMPLE", callback: ls.REPEAT_SAMPLE, args: ['Uint16', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x7F, command: "BACKGROUND", callback: ls.BACKGROUND, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x80, command: "ADD_VAR_GAME", callback: ls.ADD_VAR_GAME, args: ['Uint8', 'Uint16'], indent: Indent.KEEP},
    { opcode: 0x81, command: "SUB_VAR_GAME", callback: ls.SUB_VAR_GAME, args: ['Uint8', 'Uint16'], indent: Indent.KEEP},
    { opcode: 0x82, command: "ADD_VAR_CUBE", callback: ls.ADD_VAR_CUBE, args: ['Uint8', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x83, command: "SUB_VAR_CUBE", callback: ls.SUB_VAR_CUBE, args: ['Uint8', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x84, command: "UNKNOWN(0x84)", callback: lo.NOP, indent: Indent.KEEP},
    { opcode: 0x85, command: "SET_RAIL", callback: ls.SET_RAIL, args: ['Uint8', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x86, command: "INVERSE_BETA", callback: ls.INVERSE_BETA, indent: Indent.KEEP},
    { opcode: 0x87, command: "NO_BODY", callback: ls.NO_BODY, indent: Indent.KEEP},
    { opcode: 0x88, command: "ADD_GOLD_PIECES", callback: ls.ADD_GOLD_PIECES, args: ['Uint16'], indent: Indent.KEEP},
    { opcode: 0x89, command: "STOP_CURRENT_TRACK_OBJ", callback: ls.STOP_CURRENT_TRACK_OBJ, args: ['Uint8:actor'], indent: Indent.KEEP},
    { opcode: 0x8A, command: "RESTORE_LAST_TRACK_OBJ", callback: ls.RESTORE_LAST_TRACK_OBJ, args: ['Uint8:actor'], indent: Indent.KEEP},
    { opcode: 0x8B, command: "SAVE_COMPORTEMENT_OBJ", callback: ls.SAVE_COMPORTEMENT_OBJ, args: ['Uint8:actor'], indent: Indent.KEEP},
    { opcode: 0x8C, command: "RESTORE_COMPORTEMENT_OBJ", callback: ls.RESTORE_COMPORTEMENT_OBJ, args: ['Uint8:actor'], indent: Indent.KEEP},
    { opcode: 0x8D, command: "SPY", callback: ls.SPY, args: ['Uint8'], indent: Indent.KEEP},
    { opcode: 0x8E, command: "DEBUG", callback: ls.DEBUG, indent: Indent.KEEP},
    { opcode: 0x8F, command: "DEBUG_OBJ", callback: ls.DEBUG_OBJ, args: ['Uint8:actor'], indent: Indent.KEEP},
    { opcode: 0x90, command: "POPCORN", callback: ls.POPCORN, indent: Indent.KEEP},
    { opcode: 0x91, command: "FLOW_POINT", callback: ls.FLOW_POINT, args: ['Uint8', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x92, command: "FLOW_OBJ", callback: ls.FLOW_OBJ, args: ['Uint8:actor', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x93, command: "SET_ANIM_DIAL", callback: ls.SET_ANIM_DIAL, args: ['Uint16'], indent: Indent.KEEP},
    { opcode: 0x94, command: "PCX", callback: ls.PCX, args: ['Uint16'], indent: Indent.KEEP},
    { opcode: 0x95, command: "END_MESSAGE", callback: ls.END_MESSAGE, indent: Indent.KEEP},
    { opcode: 0x96, command: "END_MESSAGE_OBJ", callback: ls.END_MESSAGE_OBJ, args: ['Uint8:actor'], indent: Indent.KEEP},
    { opcode: 0x97, command: "PARM_SAMPLE", callback: ls.PARM_SAMPLE, args: ['Uint16', 'Uint8', 'Uint16'], indent: Indent.KEEP}, // not sure about this one
    { opcode: 0x98, command: "NEW_SAMPLE", callback: ls.NEW_SAMPLE, args: ['Uint16', 'Uint16', 'Uint8', 'Uint16'], indent: Indent.KEEP},
    { opcode: 0x99, command: "POS_OBJ_AROUND", callback: ls.POS_OBJ_AROUND, args: ['Uint8:actor', 'Uint8'], indent: Indent.KEEP},
    { opcode: 0x9A, command: "PCX_MESS_OBJ", callback: ls.PCX_MESS_OBJ, args: ['Uint8:actor', 'Uint16', 'Uint16'], indent: Indent.KEEP}
];