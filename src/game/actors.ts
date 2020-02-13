import * as THREE from 'three';

export interface ActorFlags {
    hasCollisions: boolean;
    isVisible: boolean;
    isSprite: boolean;
}

export interface ActorProps {
    flags: ActorFlags;
}

export interface Actor {
    props: ActorProps;
    threeObject: THREE.Object3D;
}
