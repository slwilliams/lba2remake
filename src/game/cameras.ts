import { get3DCamera } from '../cameras/3d';
import { getIsometricCamera } from '../cameras/iso';
import { getIso3DCamera } from '../cameras/iso3d';

import { getVrFirstPersonCamera } from '../cameras/vr/vrFirstPerson';
import { getVR3DCamera } from '../cameras/vr/vr3d';
import { getVRIsoCamera } from '../cameras/vr/vrIso';

export function loadCamera({ isIsland, vr, firstPerson, params }) {
    // Outdoors
    if (isIsland) {
        if (vr) {
            return firstPerson
                ? getVrFirstPersonCamera()
                : getVR3DCamera();
        }
        return get3DCamera();
    }

    // Indoors
    if (vr) {
        return firstPerson
            ? getVrFirstPersonCamera()
            : getVRIsoCamera();
    }
    if (params.iso3d || params.isoCam3d) {
        return params.isoCam3d
            ? get3DCamera()
            : getIso3DCamera();
    }
    return getIsometricCamera();
}
