
var renderer = null,
    scene = null,
    root = null,
    robot_idle = null,
    group = null;
var  deadAnimator = null;
var flag = false;
var InicioJuego;
var tiempo = 0,
    rMax = 6,
    rLive = 0;
var puntos = 0;
var temp1 = 0;
var tNow = Date.now();
var tAparece = Date.now();
var robot_mixer = {}
var robots = [];
var Mixing = [];
var mixRobots = [];
var vel = [];

var mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
var raycaster, camera;
var animation = "idle";


function loadFBX() {
    var loader = new THREE.FBXLoader();
    loader.load('./models/Robot/robot_idle.fbx', function (object) {

        robot_mixer["idle"] = new THREE.AnimationMixer(scene);
        object.scale.set(0.02, 0.02, 0.02);
        object.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        robot_idle = object;


        createDeadAnimation();

        robot_mixer["idle"].clipAction(object.animations[0], robot_idle).play();
        mixRobots.push(object.animations[0]);

       

        loader.load('./models/Robot/robot_run.fbx', function (object) {
            robot_mixer["run"] = new THREE.AnimationMixer(scene);
            robot_mixer["run"].clipAction(object.animations[0], robot_idle).play();
            mixRobots.push(object.animations[0]);
        });

        loader.load('./models/Robot/robot_walk.fbx', function (object) {
            robot_mixer["walk"] = new THREE.AnimationMixer(scene);
            robot_mixer["walk"].clipAction(object.animations[0], robot_idle).play();
            mixRobots.push(object.animations[0]);
        });

        loader.load('./models/Robot/robot_atk.fbx', function (object) {
            robot_mixer["attack"] = new THREE.AnimationMixer(scene);
            robot_mixer["attack"].clipAction(object.animations[0], robot_idle).play();
            mixRobots.push(object.animations[0]);
        });
    });
}

function animate() {

    var now = Date.now();
    var temp3 = now - tNow;
    var temp4 = now - InicioJuego;
    tNow = now;

    if (rLive < rMax) {
        rLive++;
        tAparece = now
        var x = randNum(-90, 90);
        var newRobot = cloneFbx(robot_idle);
        newRobot.position.set(x, -4, -100);
        scene.add(newRobot);
        var mixer = new THREE.AnimationMixer(newRobot);
        mixer.clipAction(mixRobots[2]).play();
        newRobot.t1 = temp1;
        newRobot.m = 0;
        newRobot.p1 = 1;
        newRobot.status = 1;
        robots.push(newRobot);
        Mixing.push(mixer);
        vel.push(0.025);

        if (temp1 == 0) {
            scene.remove(robots[0]);
            rLive--;
        }
        temp1 += 1;
    }

    if (temp4 > 1000) {
        InicioJuego = now;
        tiempo += 1;
        document.getElementById("time").innerHTML = 60 - tiempo;
        if (tiempo >= 60) {
            flag = false;
        }
    }

    if (robots.length > 0) {
        for (var temp5 = 0; temp5 < robots.length; temp5++) {
            Mixing[temp5].update(temp3 * 0.001);
            if (robots[temp5].status == 1) {
                robots[temp5].position.z += vel[temp5] * temp3;
            }
            else {
                if (robots[temp5].p1) {
                    puntos++;
                    document.getElementById("score").innerHTML = "score: " + puntos;
                    rLive--;
                    robots[temp5].p1 = 0;
                }
                if (Date.now() - robots[temp5].status > 2000) {
                    scene.remove(robots[temp5]);
                }
            }
            if (robots[temp5].position.z > 100) {
                if (robots[temp5].p1) {
                    puntos--;
                    rLive--;
                    scene.remove(robots[temp5]);
                    document.getElementById("score").innerHTML = "score: " + puntos;
                    robots[temp5].p1 = 0;
                }
            }

        }
    }


}

function createDeadAnimation() {
    //Sin tiempo :S
    deadAnimator = new KF.KeyFrameAnimator;
    deadAnimator.init({
        interps:
            [
                {
                    keys: [0, .25, .50, .75, 1],
                    values: [
                         { x: 0, y : Math.PI/2, z : 0 },
                            { x: 0, y : Math.PI/2, z: Math.PI/6 },
                            { x: 0, y : Math.PI/2 , z: Math.PI/6 * 2},
                            { x: 0, y : Math.PI/2 , z: Math.PI/6 * 3 },
                            {x: 0, y : Math.PI/2 , z: Math.PI/6 * 4 },
                    ],
                },
            ],
        loop: false,
        duration: 1000,
    });
}


function onDocumentMouseDown(event) {
    
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // find intersections
    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        CLICKED = intersects[0].object;
        if (CLICKED.parent.t1 != "") {
            robots[CLICKED.parent.t1].status = Date.now();
            robots[CLICKED.parent.t1].rotation.z=-Math.PI/2;
            createDeadAnimation();
        }
    }

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function randNum(min, max) {
    return Math.random() * (max - min) + min
}

function run() {
    requestAnimationFrame(function () { run(); });

    // Render the scene
    renderer.render(scene, camera);

    // Spin the cube for next frame
    if (flag) {
        animate();
    }

}

function newGame() {
    if (robots.length > 0) {
        for (var actual = 0; actual < robots.length; actual++) {
            scene.remove(robots[actual]);
        }
        robots = [];
        Mixing = [];
        vel = [];
    }
    tiempo = 0
    InicioJuego = Date.now();
    puntos = 0;
    temp1 = 0;
    rLive = 0;
    document.getElementById("time").innerHTML = 60;
    document.getElementById("score").innerHTML = "score: " + puntos;
    document.getElementById("startButton").value = "Reiniciar";
    flag = true;
}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var mapUrl = "./img/checker_large.gif";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function setLightColor(light, r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    light.color.setRGB(r, g, b);
}


function createScene(canvas) {

    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 4000);
    camera.position.set(0, 200, 150);
    camera.rotation.set(-45, 0, 0);
    scene.add(camera);
    // Create a group to hold all the objects
    root = new THREE.Object3D;

    spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-30, 150, -30);
    spotLight.target.position.set(5, 3, 5);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 45;

    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    //ambientLight = new THREE.AmbientLight ( 0x888888 );
    //root.add(ambientLight);

    // Create the objects
    loadFBX();


    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create a texture map
    var map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    var color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: color, map: map, side: THREE.DoubleSide }));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4.02;

    // Add the mesh to our group
    group.add(mesh);
    mesh.castShadow = false;
    mesh.receiveShadow = true;
   
    // Now add the group to our scene
    scene.add(root);

    raycaster = new THREE.Raycaster();

    document.addEventListener('mousedown', onDocumentMouseDown);
    window.addEventListener('resize', onWindowResize);

}