#version 150

out vec4 outputColor;

uniform float musicMaster;
uniform float musicA;
uniform float musicB;
uniform int scene;
uniform int masterClock;
uniform float windowWidth;
uniform float windowHeight;

uniform float time;
float lightness;

uniform vec3 xAxis, yAxis, zAxis;
mat3 orientation, fullObjectRotation;
float red, green, blue, alpha;
float platformHeight, cubeSizeX, cubeSizeY, cubeSizeZ, borderRadius;
int iterationCount;
int iterationModulo;

float s1, t1, s2, t2, s3, t3, m, foldAngle;

/*float distanceEstimator(vec3 point) {
    return length(point) - 1;
}*/

float distanceEstimator(vec3 point) {
    
    float scale = 1;
    vec3 p = fullObjectRotation * point;
    for (int i = 0; i < iterationCount; i++) {
        
        vec3 normal = vec3(sin(foldAngle), cos(foldAngle), 0);
        p -= 2.0 * min(0.0, dot(p, normal)) * normal; // a fold in a general plane with normal n
        
        float s;
        float t = 0;
        if (i % iterationModulo == 0) {
            s = s1;
            t = t1;
            p = vec3(p.y, p.z, p.x);
        } else if (i % iterationModulo == 1) {
            s = s2;
            t = t2;
            p = vec3(p.y, p.z, p.x);
            vec3 normal = vec3(0.3827, 0.9239, 0);
            p -= 2.0 * min(0.0, dot(p, normal)) * normal; // a fold in a general plane with normal
        } else {
            s = s3;
            t = t3;
            p = vec3(p.z, p.x, p.y);
        }
        p += vec3(0, s, t);
        scale *= m;
        p *= m;
        /*if (i == 3) {
            p = orientation * p;
        }*/
    }
    
    // distance estimator to the cube
    float dx = max(0, abs(p.x) - cubeSizeX / 2 + borderRadius);
    float dy = max(0, abs(p.y) - cubeSizeY / 2 + borderRadius);
    float dz = max(0, abs(p.z) - cubeSizeZ / 2 + borderRadius);
    float d = length(vec3(dx, dy, dz)) - borderRadius;
    if (length(point.xz) < 10) {
        return min(d / scale, point.y - platformHeight);
    } else {
        return d/scale;
    }
}



// *** Change these to suit your range of random numbers..

// *** Use this for integer stepped ranges, ie Value-Noise/Perlin noise functions.
#define HASHSCALE1 .1031
#define HASHSCALE3 vec3(.1031, .1030, .0973)
#define HASHSCALE4 vec4(1031, .1030, .0973, .1099)

float hash13(vec3 p3)
{
    p3  = fract(p3 * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

float hash11(float p)
{
    vec3 p3  = fract(vec3(p) * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

mat3 rotateXZ(float angle) {
    return mat3(vec3(cos(angle), 0, sin(angle)),
                vec3(0, 1, 0),
                vec3(-sin(angle), 0, cos(angle)));
}

mat3 rotateXY(float angle) {
    return mat3(vec3(cos(angle), sin(angle), 0),
                vec3(-sin(angle), cos(angle), 0),
                vec3(0, 0, 1));
}

mat3 rotateYZ(float angle) {
    return mat3(vec3(1, 0, 0),
                vec3(0, cos(angle), -sin(angle)),
                vec3(0, sin(angle), cos(angle)));
}

float smoothstep(float x)
{
    return min(1, max(0, x*x*(3 - 2*x)));
}

void main()
{
    // some parameters, unorganized
    orientation = mat3(xAxis, yAxis, zAxis);
 
    float x = (gl_FragCoord.x / windowWidth * 2 - 1) * windowWidth / windowHeight;
    float y = (gl_FragCoord.y / windowHeight * 2 - 1.0);

    // camera parameters
    vec3 cameraPosition = vec3(0.0, 0, -5.0);
    float zoom = 1.3;
    float cameraPan = 0.0;
    float cameraTilt = 0.0;
    float cameraRoll = 0.0;

    // raymarch parameters
    float travelDistance = 0.0;
    float distanceToSurface = 1.0;
    float touchDistance = 0.01;
    float maxSteps = 100;
    
    // light parameters
    vec3 ambientColor = vec3(55, 89, 136) * (1.0/255);
    vec3 directColor = vec3(253, 188, 79) * (1.0/255);
    float directLightAddBrightness = 1.5;
    vec3 lightDirection = normalize(vec3(1, 1, -1));
    
    float directLightStrength = 2.0; // 0 = no effect, 1 = some effect, 2 = strong effect
    platformHeight = -3.0;
    
    // some shape parameters
    cubeSizeX = 5;
    cubeSizeY = 5;
    cubeSizeZ = 5;
    borderRadius = 0;
    iterationCount = 8;
    
    // translation. meaningful values probably between -1 and 0 (some -2 or +1 might be ok, too)
    s1 = -0.8;
    t1 = -0.4;
    s2 = -0.3;
    t2 = -0.5;
    s3 = -0.5;
    t3 = -0.5;
    m = 1.3; // meaningful values between 1.1 and 1.3
    iterationModulo = 3;
    float angle = time * 0.02;
    fullObjectRotation = rotateXZ(0);
    foldAngle = 3.14159265 / 4;
    
    if (scene == 6) {
        
        // scene 5
        ambientColor = vec3(100 + 55 , 189, 236) * (1.0/255);
        directColor = vec3(250, 250, 250) * (1.0/255);
        directLightAddBrightness = 0.5;
        zoom = 1.6;

        cubeSizeX = 1.5;
        cubeSizeY = 0.2;
        cubeSizeZ = 4.2;
        iterationCount = 6;
        iterationModulo = 6;
        t1 = -0.5;
        
        borderRadius = 0;
        fullObjectRotation = rotateXZ(angle) * rotateXY(angle*1.5);
        cameraTilt = -0.00;
        x += 0.9;
        foldAngle = 3.14159265 / 4;
        platformHeight = -2.3;

        
    } else if ((scene == 2 && (masterClock % 64 > 64 - 8)) ||
        //(scene == 4 && (masterClock % 64 > 32-8) && (masterClock % 64 < 32)) ||
        scene == 4) {
        cameraPosition = vec3(0.0, 0, -3.0);
        angle =  3 + (musicA * 40);
        ambientColor = vec3(255, 89, 136) * (0.5/255);
        directColor = vec3(253, 220, 79) * (1.0/255);
        directLightAddBrightness = 1.9;
        maxSteps = masterClock % 16 == 0 ? 20 : 100;
        iterationCount = 4 + min(int(10 * smoothstep(100 * musicA)), 20);
        //m = 1.3 + 0.1 * sin(time);
        lightDirection = rotateXZ(1+hash11(masterClock)) * normalize(vec3(-1, 1, -1));
        //directLightAddBrightness = 0.5*sin(time)+1.5;
        fullObjectRotation = rotateXZ(angle) * rotateXY(angle*1);
        iterationModulo = 7;
        cameraTilt = -0.1;
        foldAngle = 3.14159265 / 4;
    } else {
        
        if (scene == 0 || scene == 1) {
            
            
            
            // scene 5
            ambientColor = vec3(100 + 55 , 189, 236) * (1.0/255);
            //ambientColor = vec3(155 + 5500 * musicA, 189 - 13000 * musicA, 236 - 13000 * musicA) * (1.0/255);
            directColor = vec3(250, 250, 250) * (1.0/255);
            directLightAddBrightness = 0.5;// + 0.2 * pow(musicA * 100,4);
            /*zoom = 1.4 +  0.1 * pow(musicA * 50,5);
             cubeSizeX = 0.2 -0.18*((masterClock / 4) % 2) * ((masterClock / 4) % 3);
             cubeSizeY = 5 + (6 * musicA);
             cubeSizeZ = 5 * abs((sin(time*0.2)+2)) + int(6 * musicA);
             */
            borderRadius = 0;
            iterationCount = 6 + min(int(8 * smoothstep(100 * musicA)), 20);
            fullObjectRotation = rotateXZ(angle) * rotateXY(angle*1.5);
            iterationModulo = 7;
            cameraTilt = -0.1;
            foldAngle = 3.14159265 / 4;
            
            if (scene == 1) {
                zoom = 2.2;
                cameraTilt = -0.1;
                if (masterClock % 64 >= 16) {
                    cameraTilt = -0.12;
                }
                borderRadius = (50 * musicA);
            }
            
            cubeSizeX = 3*pow(-cos(time*0.1)*0.5+0.5, 3);
            cubeSizeY = 3*pow(-cos(time*0.1)*0.5+0.5, 3);
            iterationCount = 1+min(masterClock / 16, 20);
            
        } else if (scene == 2) {
            
            // scene 3
            ambientColor = vec3(100 + 55 , 189, 236) * (1.0/255);
            //ambientColor = vec3(155 + 5500 * musicA, 189 - 13000 * musicA, 236 - 13000 * musicA) * (1.0/255);
            directColor = vec3(250, 250, 250) * (1.0/255);
            directLightAddBrightness = 0.5;// + 0.2 * pow(musicA * 100,4);
            zoom = 1.4 +  0.1 * pow(musicA * 50,5);
            cubeSizeX = 0.2 -0.18*((masterClock / 8) % 2) * ((masterClock / 8) % 3);
            cubeSizeY = 5 + (6 * musicA);
            cubeSizeZ = 5 * abs((sin(time*0.2 + 3.5)+2)) + int(6 * musicA);
            borderRadius = 0;
            iterationCount = 20 - (masterClock / 8) % 14 - 8*(masterClock / 8) % 4;
            m = 1.2 + 0.07*sin(time*0.2 + 3.5); // meaningful values between 1.1 and 1.3
            foldAngle = 3.14159265 / (14 - 8*(masterClock / 4) % 2 - 4*(masterClock / 4) % 4);
            //foldAngle = 3.14159265 / (3 + 10 * musicA) * (sin(time*0.05)*0.5+0.5);
            
            cameraPosition = vec3(0.6, -0.9, -2.0);
            cameraPan = 0.0;
            cameraTilt = 0.4;
            cameraRoll = 0.0;
            zoom = 1.4;
            
        } else if (scene == 3) {
            // scene 2
            cameraTilt = -0.1;
            ambientColor = vec3(100 + 55 , 189, 236) * (1.0/255);
            directColor = vec3(250, 250, 250) * (1.0/255);
            directLightAddBrightness = 0.2 + 0.2 * pow(musicA * 100, 4);
            zoom = 1.4 +  0.1 * pow(musicA * 50,5);
            cubeSizeX = 0.2 + (200 * musicA);
            cubeSizeY = 5 + (6 * musicA);
            cubeSizeZ = 5 * abs((sin(time*0.2)+2)) + int(6 * musicA);
            borderRadius = 0.1 + (200 * musicA);
            iterationCount = (14 + int(1 * musicA));
            m = 1.2 + 0.07*sin(time*0.2); // meaningful values between 1.1 and 1.3
            foldAngle = 3.14159265 / (3 + 10 * musicA) * (sin(time * 0.05) * 0.5 + 0.5);
            
        } else if (scene == 5) {
            // scene 4
            cameraPosition = vec3(0.5, 0, -5.0);
            cameraPan = -0.1;
            cameraTilt = 0.1;
            cameraRoll = 0.9;
            zoom = 1.1 * (1.4 +  0.1 * pow(musicA * 50,5));
            
            ambientColor = vec3(155 + 5500 * musicA, 189 - 13000 * musicA, 236 - 13000 * musicA) * (1.0/255); // todo: hsl()
            directColor = vec3(250, 250, 250) * (1.0/255);
            directLightAddBrightness = 0.2 + 0.2 * pow(musicA * 100,4);//sin(time)+1;
            lightDirection = normalize(vec3(1, 1, -1));
            directLightStrength = 2.0; // 0 = no effect, 1 = some effect, 2 = strong effect
            cubeSizeX = 0.2 + (200 * musicA);
            cubeSizeY = 5 + (6 * musicA);
            cubeSizeZ = 5 * abs((sin(3+time*0.2)+2)) + int(6 * musicA);
            borderRadius = 0.1 + (200 * musicA);
            iterationCount = (19 - 2*((masterClock / 4)%7));
            iterationModulo = 3;
            m = 1.2 + 0.07*sin(3+time*0.2); // meaningful values between 1.1 and 1.3
            foldAngle = 3.14159265 / (3 + 10 * musicA) * (sin(3+time*0.05)*0.5+0.5);
            
        }
    }
    
    if (mod(masterClock, 64) < 0*32) {
        
        /*// scene 1
        ambientColor = vec3(55, 89, 136) * (1.0/255);
        directColor = vec3(253, 188, 79) * (1.0/255);
        directLightAddBrightness = 1.5;
        maxSteps = masterClock % 32 == 0 ? 20 : 100;
        iterationCount = 6 + min(int(8 * smoothstep(100 * musicA)), 20);
        //m = 1.3 + 0.1 * sin(time);
        lightDirection = rotateXZ(1+hash11(masterClock)) * normalize(vec3(-1, 1, -1));
        //directLightAddBrightness = 0.5*sin(time)+1.5;
        fullObjectRotation = rotateXZ(angle) * rotateXY(angle*1.5);
        iterationModulo = 7;
        cameraTilt = -0.1;
        foldAngle = 3.14159265 / 4;*/
    } else {
        
        // scene 5
        /*ambientColor = vec3(100 + 55 , 189, 236) * (1.0/255);
        //ambientColor = vec3(155 + 5500 * musicA, 189 - 13000 * musicA, 236 - 13000 * musicA) * (1.0/255);
        directColor = vec3(250, 250, 250) * (1.0/255);
        directLightAddBrightness = 0.5;// + 0.2 * pow(musicA * 100,4);
        /*zoom = 1.4 +  0.1 * pow(musicA * 50,5);
        cubeSizeX = 0.2 -0.18*((masterClock / 4) % 2) * ((masterClock / 4) % 3);
        cubeSizeY = 5 + (6 * musicA);
        cubeSizeZ = 5 * abs((sin(time*0.2)+2)) + int(6 * musicA);
        borderRadius = 0;
        iterationCount = 6 + min(int(8 * smoothstep(100 * musicA)), 20);
        fullObjectRotation = rotateXZ(angle) * rotateXY(angle*1.5);
        iterationModulo = 7;
        cameraTilt = -0.1;
        foldAngle = 3.14159265 / 4;
        
        cubeSizeX = 3*pow(-cos(time*0.1)*0.5+0.5, 3);
        cubeSizeY = 3*pow(-cos(time*0.1)*0.5+0.5, 3);
        iterationCount = 1+min(masterClock / 16, 20);*/
        
        //s3 = -0.7 - 1.2*sin(time*0.3);
        //m = 1.3 + 0.2*sin(time*0.3);

        
        // scene 4
        /*cameraPosition = vec3(0.5, 0, -5.0);
        cameraPan = -0.1;
        cameraTilt = 0.1;
        cameraRoll = 0.9;
        zoom = 1.1 * (1.4 +  0.1 * pow(musicA * 50,5));
        
        ambientColor = vec3(155 + 5500 * musicA, 189 - 13000 * musicA, 236 - 13000 * musicA) * (1.0/255); // todo: hsl()
        directColor = vec3(250, 250, 250) * (1.0/255);
        directLightAddBrightness = 0.2 + 0.2 * pow(musicA * 100,4);//sin(time)+1;
        lightDirection = normalize(vec3(1, 1, -1));
        directLightStrength = 2.0; // 0 = no effect, 1 = some effect, 2 = strong effect
        cubeSizeX = 0.2 + (200 * musicA);
        cubeSizeY = 5 + (6 * musicA);
        cubeSizeZ = 5 * abs((sin(time*0.2)+2)) + int(6 * musicA);
        borderRadius = 0.1 + (200 * musicA);
        iterationCount = (19 - (masterClock / 4)%14);
        iterationModulo = 3;
        m = 1.2 + 0.07*sin(time*0.2); // meaningful values between 1.1 and 1.3
        foldAngle = 3.14159265 / (3 + 10 * musicA) * (sin(time*0.05)*0.5+0.5);*/
        
        
        
        
        
        // scene 3
        /*ambientColor = vec3(100 + 55 , 189, 236) * (1.0/255);
        //ambientColor = vec3(155 + 5500 * musicA, 189 - 13000 * musicA, 236 - 13000 * musicA) * (1.0/255);
        directColor = vec3(250, 250, 250) * (1.0/255);
        directLightAddBrightness = 0.5;// + 0.2 * pow(musicA * 100,4);
        zoom = 1.4 +  0.1 * pow(musicA * 50,5);
        cubeSizeX = 0.2 -0.18*((masterClock / 4) % 2) * ((masterClock / 4) % 3);
        cubeSizeY = 5 + (6 * musicA);
        cubeSizeZ = 5 * abs((sin(time*0.2)+2)) + int(6 * musicA);
        borderRadius = 0;
        iterationCount = 20 - (masterClock / 4) % 14 - 8*(masterClock / 4) % 4;
        m = 1.2 + 0.07*sin(time*0.2); // meaningful values between 1.1 and 1.3
        foldAngle = 3.14159265 / (14 - 8*(masterClock / 4) % 2 - 4*(masterClock / 4) % 4);
        //foldAngle = 3.14159265 / (3 + 10 * musicA) * (sin(time*0.05)*0.5+0.5);

        cameraPosition = vec3(0.6, -0.9, -2.0);
        cameraPan = 0.0;
        cameraTilt = 0.4;
        cameraRoll = 0.0;
        zoom = 1.4;*/
  
        // scene 2
        /*ambientColor = vec3(100 + 55 , 189, 236) * (1.0/255);
        directColor = vec3(250, 250, 250) * (1.0/255);
        directLightAddBrightness = 0.2 + 0.2 * pow(musicA * 100,4);
        zoom = 1.4 +  0.1 * pow(musicA * 50,5);
        cubeSizeX = 0.2 + (200 * musicA);
        cubeSizeY = 5 + (6 * musicA);
        cubeSizeZ = 5 * abs((sin(time*0.2)+2)) + int(6 * musicA);
        borderRadius = 0.1 + (200 * musicA);
        iterationCount = (14 + int(1 * musicA));
        m = 1.2 + 0.07*sin(time*0.2); // meaningful values between 1.1 and 1.3
        foldAngle = 3.14159265 / (3 + 10 * musicA) * (sin(time*0.05)*0.5+0.5);*/
    }

    
    /*cubeSizeX = (masterClock % 64) + 4;
    cubeSizeY = (masterClock % 16) + 1;
    cubeSizeZ = (masterClock % 8) + 1;
    borderRadius = 0.0;
    iterationCount = 8;*/
    
    
    
    // actual raymarching
    vec3 rayDirection = rotateXZ(cameraPan) * rotateYZ(cameraTilt) * rotateXY(cameraRoll) * normalize(vec3(x, y, zoom));
    int stepN = 1;
    while (travelDistance < 50.0 && distanceToSurface > touchDistance && stepN <= maxSteps) {
        distanceToSurface = distanceEstimator(cameraPosition + rayDirection * travelDistance);
        travelDistance += 0.5* distanceToSurface;
        //travelDistance += (hash11(hash13(vec3(stepN+x, y, time)))) * distanceToSurface;
        touchDistance = 0.001 * travelDistance;
        stepN += 1;
    }
    vec3 rayPosition = cameraPosition + rayDirection * travelDistance;
    
    // naive ambient occlusion, range 0 = light .. 1 = dark
    float ambientOcclusion = pow(log(float(min(stepN, maxSteps))) / log(float(maxSteps)), 3.0);
    
    // did we hit the surface or not?
    bool hit = distanceToSurface <= touchDistance;
    
    if (stepN >= maxSteps) {
        hit = true;
        ambientOcclusion = 1;
    }
    

    if (hit) {
        // surface normal
        
        // less banding
        /*vec3 normal = normalize(vec3(
                                     distanceEstimator(rayPosition + vec3(touchDistance, 0, 0)) - distanceEstimator(rayPosition + vec3(-touchDistance, 0, 0)),distanceEstimator(rayPosition + vec3(0, touchDistance, 0)) - distanceEstimator(rayPosition + vec3(0, -touchDistance, 0)),
                                         distanceEstimator(rayPosition + vec3(0, 0, touchDistance)) - distanceEstimator(rayPosition + vec3(0, 0, -touchDistance))
                                     ));//*/
        // faster to calculate
        vec3 normal = normalize(vec3(
                                     distanceEstimator(rayPosition + vec3(touchDistance, 0, 0)) - distanceToSurface,
                                     distanceEstimator(rayPosition + vec3(0, touchDistance, 0)) - distanceToSurface,
                                     distanceEstimator(rayPosition + vec3(0, 0, touchDistance)) - distanceToSurface
                                     ));//*/
        
        
        
        
        float directLight = max(0, dot(normal, lightDirection));
        
        // cast shadows
        float lightDistanceToSurface = 1; // just put some large value so we enter the iteration
        if (directLight > 0) {
            cameraPosition = rayPosition - rayDirection * touchDistance;
            rayDirection = lightDirection;
            travelDistance = touchDistance;
            while (travelDistance < 50 && lightDistanceToSurface > touchDistance) {
                lightDistanceToSurface = distanceEstimator(cameraPosition + rayDirection * travelDistance);
                travelDistance += 1 * lightDistanceToSurface;
            }
        }
        if (lightDistanceToSurface <= touchDistance) {
            directLight = 0;
        }
        //directLight = pow(directLight, exp(-directLightAddBrightness));
        
        float ambientLight = 1 - ambientOcclusion;
        red = ambientColor.x * ambientLight;
        green = ambientColor.y * ambientLight;
        blue = ambientColor.z * ambientLight;

        if (abs(rayPosition.y - platformHeight) <= 20*touchDistance) {
            if (lightDistanceToSurface > touchDistance) {
                red = 1;
                green = 1;
                blue = 1;
            } else {
                float a = pow(directLightAddBrightness, 0.7);
                red = pow(red, a);
                green = pow(green, a);
                blue = pow(blue, a);
            }
        } else {
            float directRed = 1-pow(1-directColor.x, directLightAddBrightness * directLight);
            float directGreen = 1-pow(1-directColor.y, directLightAddBrightness * directLight);
            float directBlue = 1-pow(1-directColor.z, directLightAddBrightness * directLight);

            red = 1 - (1-red) * (1-directRed);
            green = 1 - (1-green) * (1-directGreen);
            blue = 1 - (1-blue) * (1-directBlue);
        }

    } else {
        red = 1;
        green = 1;
        blue = 1;
    }

    float alpha = 1.0;
	outputColor = vec4(red, green, blue, alpha);
}
