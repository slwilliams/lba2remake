import * as THREE from 'three';
import { map, each, assign, tail} from 'lodash';

import { prepareGeometries } from './geometries';
import { loadLayout } from './layout';
import { loadGround } from './ground';
import { loadSea } from './environment/sea';
import { loadObjects } from './objects';
import { loadModel } from './model';
import { loadIslandPhysics } from '../game/loop/physicsIsland';
import { createBoundingBox } from '../utils/rendering';
import { loadLUTTexture } from '../utils/lut';
import islandsInfo from './data/islands';
import environments from './data/environments';
import { createTextureAtlas } from './atlas';
import { WORLD_SCALE_B } from '../utils/lba';
import { loadRain } from './environment/rain';
import { loadClouds } from './environment/clouds';
import { loadLightning, applyLightningUniforms } from './environment/lightning';
import { loadStars } from './environment/stars';
import { loadResource, ResourceType } from '../resources';

const islandProps = {};
each(islandsInfo, (island) => {
    islandProps[island.name] = assign({
        envInfo: environments[island.env]
    }, island);
});

const islands = {};
const islandPreviews = {};

interface IslandGeometry {
    positions?: number[];
    uvs?: number[];
    uvGroups?: number[];
    colors?: number[];
    normals?: number[];
    intensities?: number[];
    material: THREE.Material;
}

export function getEnvInfo(name) {
    return islandProps[name].envInfo;
}

export async function loadIslandScenery(params, name, ambience) {
    if (params.preview) {
        if (name in islandPreviews) {
            return islandPreviews[name];
        }
    } else if (name in islands) {
        return islands[name];
    }

    const [ress, pal, ile, obl, lutTexture] = await Promise.all([
        loadResource(ResourceType.RESS),
        loadResource(ResourceType.PALETTE),
        loadResource(`${name}_ILE`),
        loadResource(`${name}_OBL`),
        loadLUTTexture()
    ]);
    const files = {ress, pal, ile, obl};
    const island = await loadIslandNode(params, islandProps[name], files, lutTexture, ambience);
    if (params.preview) {
        islandPreviews[name] = island;
    } else {
        islands[name] = island;
    }
    return island;
}

async function loadIslandNode(params, props, files, lutTexture, ambience) {
    const islandObject = new THREE.Object3D();
    islandObject.name = `scenery_${props.name}`;
    islandObject.matrixAutoUpdate = false;
    const layout = loadLayout(files.ile);
    const data = {
        files,
        palette: files.pal.getBufferUint8(),
        layout,
        lutTexture
    };

    const {geometries, usedTiles} = await loadGeometries(props, data, ambience);
    const matByName = {};
    each(geometries, (geom: IslandGeometry, name) => {
        const {positions, uvs, colors, intensities, normals, uvGroups, material} = geom;
        if (positions && positions.length > 0) {
            const bufferGeometry = new THREE.BufferGeometry();
            bufferGeometry.setAttribute(
                'position',
                new THREE.BufferAttribute(new Float32Array(positions), 3)
            );
            if (uvs) {
                bufferGeometry.setAttribute(
                    'uv',
                    new THREE.BufferAttribute(new Uint8Array(uvs), 2, false)
                );
            }
            if (colors) {
                bufferGeometry.setAttribute(
                    'color',
                    new THREE.BufferAttribute(new Uint8Array(colors), 1, false)
                );
            }
            if (intensities) {
                bufferGeometry.setAttribute(
                    'intensity',
                    new THREE.BufferAttribute(new Uint8Array(intensities), 1, false)
                );
            }
            if (normals) {
                bufferGeometry.setAttribute(
                    'normal',
                    new THREE.BufferAttribute(new Float32Array(normals), 3)
                );
            }
            if (uvGroups) {
                bufferGeometry.setAttribute(
                    'uvGroup',
                    new THREE.BufferAttribute(new Uint16Array(uvGroups), 4, false)
                );
            }
            const mesh = new THREE.Mesh(bufferGeometry, material);
            mesh.matrixAutoUpdate = false;
            mesh.name = name;
            mesh.onBeforeRender = applyLightningUniforms;
            matByName[name] = material;
            islandObject.add(mesh);
        }
    });

    const sections = {};
    let boundingBoxes = null;
    if (params.editor) {
        boundingBoxes = new THREE.Object3D();
        boundingBoxes.name = 'BoundingBoxes';
        boundingBoxes.visible = true;
        boundingBoxes.matrixAutoUpdate = false;
        islandObject.add(boundingBoxes);
    }
    if (params.preview) {
        loadSectionPlanes(islandObject, data);
    }
    each(data.layout.groundSections, (section) => {
        sections[`${section.x},${section.z}`] = section;
        if (params.editor) {
            each(section.boundingBoxes, (bb, idx) => {
                const box = createBoundingBox(bb, new THREE.Vector3(Math.random(), Math.random(), Math.random()));
                box.name = `[${section.x},${section.z}]:${idx}`;
                boundingBoxes.add(box);
            });
        }
    });

    const { envInfo } = props;

    const sea = envInfo.sea
        && loadSea(envInfo.sea, {
            layout,
            usedTiles,
            envInfo,
            ress: files.ress,
            palette: data.palette,
            ambience
        });
    const groundClouds = envInfo.groundClouds
        && await loadClouds(envInfo.groundClouds, {
            envInfo,
            ress: files.ress,
            palette: data.palette
        });
    sea && islandObject.add(sea.threeObject);
    groundClouds && islandObject.add(groundClouds.threeObject);

    let updateEnv = null;
    if (!params.preview) {
        const clouds = envInfo.clouds
            && await loadClouds(envInfo.clouds, {
                envInfo,
                ress: files.ress,
                palette: data.palette
            });

        const rain = envInfo.rain
            && loadRain(envInfo.rain);
        const lightning = envInfo.lightning
            && loadLightning(envInfo.lightning, sections);
        const stars = envInfo.stars
            && loadStars(envInfo.stars);

        clouds && islandObject.add(clouds.threeObject);
        rain && islandObject.add(rain.threeObject);
        lightning && islandObject.add(lightning.threeObject);
        stars && islandObject.add(stars.threeObject);

        updateEnv = (game, scene, time) => {
            clouds && clouds.update(time);
            rain && rain.update(scene, time);
            lightning && lightning.update(game, scene, time);
            stars && stars.update(time);
            sea && sea.update(time);
            groundClouds && groundClouds.update(time);
        };
    } else {
        updateEnv = (_game, _scene, time) => {
            sea && sea.update(time);
            groundClouds && groundClouds.update(time);
        };
    }

    return {
        props,
        sections: map(layout.groundSections,
            section => ({x: section.x, z: section.z, boundingBoxes: section.boundingBoxes })),
        threeObject: islandObject,
        physics: loadIslandPhysics(sections),

        update: (game, scene, time) => {
            if (scene) {
                updateShadows(scene, matByName);
            }
            updateEnv(game, scene, time);
        }
    };
}

function loadSectionPlanes(islandObject, data) {
    const sectionsPlanes = new THREE.Object3D();
    const sectionsPlanesGeom = new THREE.PlaneBufferGeometry(
        64 * WORLD_SCALE_B,
        64 * WORLD_SCALE_B
    );
    const sectionsPlanesMat = new THREE.MeshBasicMaterial({color: 0xff0000});
    sectionsPlanes.name = 'sectionsPlanes';
    sectionsPlanes.visible = false;
    sectionsPlanes.renderOrder = 3;
    islandObject.add(sectionsPlanes);
    each(data.layout.groundSections, (section) => {
        const plane = new THREE.Mesh(sectionsPlanesGeom, sectionsPlanesMat);
        plane.position.set(
            ((section.x * 64) + 33) * WORLD_SCALE_B,
            0,
            ((section.z * 64) + 32) * WORLD_SCALE_B
        );
        plane.quaternion.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
        plane.userData = {
            x: section.x,
            y: section.y,
            info: section
        };
        sectionsPlanes.add(plane);
    });
}

async function loadGeometries(island, data, ambience) {
    const usedTiles = {};
    const models = [];
    const uvGroupsS : Set<string> = new Set();
    const obl = data.files.obl;
    for (let i = 0; i < obl.length; i += 1) {
        const model = loadModel(obl.getEntry(i));
        models.push(model);
        each(model.uvGroups, (group) => {
            uvGroupsS.add(group.join(','));
        });
    }
    const uvGroups = [...uvGroupsS]
        .map(g => g.split(',').map(v => Number(v)))
        .sort((g1, g2) => (g2[2] * g2[3]) - (g1[2] * g1[3]));
    const atlas = createTextureAtlas(data, uvGroups);

    const geometries = await prepareGeometries(island, {...data, atlas}, ambience);

    each(data.layout.groundSections, (section) => {
        const tilesKey = [section.x, section.z].join(',');
        usedTiles[tilesKey] = [];
        loadGround(section, geometries, usedTiles[tilesKey]);
        loadObjects(section, geometries, models, atlas, island);
    });

    return { geometries, usedTiles };
}

const DIFF = new THREE.Vector3();
const POSITION = new THREE.Vector3();
const HERO_POS = new THREE.Vector3();

const SHADOW_MAX_DIST = 15;
const SHADOW_MAX_DIST_SQ = SHADOW_MAX_DIST * SHADOW_MAX_DIST;

function updateShadows(baseScene, matByName) {
    const shadows = [];

    function computeShadow(scene, actor) {
        if (!actor.props.flags.isSprite
            && !actor.props.flags.noShadow
            && actor.model
            && actor.isVisible
            && actor.threeObject.visible) {
            const sz = actor.model.boundingBox.max.x - actor.model.boundingBox.min.x;
            POSITION.copy(actor.physics.position);
            POSITION.applyMatrix4(scene.sceneNode.matrixWorld);
            const distToHero = HERO_POS ? DIFF.subVectors(POSITION, HERO_POS).lengthSq() : 0;
            if (distToHero < SHADOW_MAX_DIST_SQ) {
                shadows.push({
                    data: [POSITION.x, POSITION.z, 2.8 / sz, 1],
                    distToHero
                });
            }
        }
    }

    computeShadow(baseScene, baseScene.actors[0]);
    HERO_POS.copy(POSITION);
    each(tail(baseScene.actors), computeShadow.bind(null, baseScene));
    each(baseScene.sideScenes, (sideScene) => {
        each(sideScene.actors, computeShadow.bind(null, sideScene));
    });
    shadows.sort((a, b) => a.distToHero - b.distToHero);
    for (let i = 0; i < 10; i += 1) {
        const shadow = shadows[i];
        const {ground_colored, ground_textured} = matByName;
        if (shadow) {
            if (ground_colored)
                ground_colored.uniforms.actorPos.value[i].fromArray(shadow.data);
            if (ground_textured)
                ground_textured.uniforms.actorPos.value[i].fromArray(shadow.data);
        } else {
            if (ground_colored)
                (ground_colored.uniforms.actorPos.value[i].w = 0);
            if (ground_textured)
                (ground_textured.uniforms.actorPos.value[i].w = 0);
        }
    }
}
