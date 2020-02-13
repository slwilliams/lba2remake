import * as THREE from 'three';
import { loadCamera } from '../cameras';
import { loadIslandScenery } from '../../island';
import IslandAmbience from '../../ui/editor/areas/island/browser/ambience';
import { HeroV2 } from './actors_v2';
import { Actor } from '../actors';

interface SceneProps {
    index: number;
    renderer: any;
    game: any;
    params: any;
}

interface Scene {
    version: number;
    props: SceneProps;
    threeScene: THREE.Scene;
    actors: Actor[];
}

export class SceneV2 implements Scene {
    readonly version = 2;
    readonly props: SceneProps;
    readonly threeScene: THREE.Scene;
    readonly actors: Actor[];

    private camera: any;
    private scenery: any;
    private loaded: boolean;

    constructor(props) {
        this.props = props;
        this.threeScene = new THREE.Scene();
        this.actors = [];
        this.loaded = false;
    }

    async load() {
        if (this.loaded)
            return;

        const { renderer, game, params } = this.props;
        this.camera = loadCamera({
            isIsland: true,
            vr: renderer.vr,
            firstPerson: game.controlsState.firstPerson,
            params
        });
        if (this.camera.controlNode) {
            this.threeScene.add(this.camera.controlNode);
        }
        const name = 'CITADEL';
        this.scenery = await loadIslandScenery(params, name, IslandAmbience[name]);
        this.threeScene.add(this.scenery.threeObject);
        this.actors.push(new HeroV2({
            flags: {
                isSprite: false,
                isVisible: true,
                hasCollisions: true
            }
        }));
        renderer.applySceneryProps(this.scenery.props);
        this.loaded = true;
    }

    update(time) {
        if (!this.loaded)
            return;

        const { game } = this.props;
        this.camera.update(this, game.controlsState, time);
        this.scenery.update(game, this, time);
    }
}
