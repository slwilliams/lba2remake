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
in vec3 normal;
in float color;

out vec3 vPosition;
out vec3 vNormal;
out vec3 vMVPos;
out float vColor;

void main() {
    vec4 mPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mPos;
    vPosition = position;
    vNormal = normal;
    vColor = color;
    vMVPos = mPos.xyz;
}
