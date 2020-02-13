import * as THREE from 'three';

import { ActorProps, Actor } from '../actors';
import { Time } from '../../datatypes';

interface HeroV2Props extends ActorProps {}

export class HeroV2 implements Actor {
    props: HeroV2Props;
    threeObject: THREE.Object3D;

    constructor(props: HeroV2Props) {
        this.props = props;
        this.threeObject = new THREE.Object3D();
    }

    update(_time: Time) {

    }
}
