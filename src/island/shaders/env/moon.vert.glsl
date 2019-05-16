#version 300 es
#extension GL_OVR_multiview : require
layout(num_views = 2) in;
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 modelViewMatrix2;
uniform mat4 projectionMatrix;
uniform mat4 projectionMatrix2;
#define modelViewMatrix (gl_ViewID_OVR==0u?modelViewMatrix:modelViewMatrix2)
#define projectionMatrix (gl_ViewID_OVR==0u?projectionMatrix:projectionMatrix2)

in vec3 position;

out vec2 vUv;
out vec3 vMVPos;

void main() {
    vec3 pos = position;
    float s = sin(pos.x * pos.z * 0.002);
    pos.y = s * 2.0;
    vec4 mPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mPos;
    vUv = vec2(
        pos.x * 0.001302 + sin(1.9) * 0.0001,
        pos.z * 0.001302 + cos(1.7) * 0.0001
    );
    vMVPos = mPos.xyz;
}
