import * as THREE from 'three';
import {
    OrbitControls
} from 'three/addons/controls/OrbitControls.js';
import {
    GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';

// criar a cena
let cena = new THREE.Scene()

// declaração global das ações de animação
let texturaVerify = false;
let acaoSuporte, acaoLong, acaoShort, acaoArmJoint, acaoAbajurJoint;

let misturador = new THREE.AnimationMixer(cena);

let carregador = new GLTFLoader()
carregador.load(
    './3D.gltf',
    function ( gltf ) {
        cena.add( gltf.scene )
        cena.traverse(function(obj) {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        })




        const clipSuporte = THREE.AnimationClip.findByName(gltf.animations, 'Suporte1')
        acaoSuporte = misturador.clipAction(clipSuporte)

        const clipLong = THREE.AnimationClip.findByName(gltf.animations, 'Long1')
        acaoLong = misturador.clipAction(clipLong)

        const clipShort = THREE.AnimationClip.findByName(gltf.animations, 'Short1')
        acaoShort = misturador.clipAction(clipShort)

        const clipArmJoint = THREE.AnimationClip.findByName(gltf.animations, 'ArmJoint1')
        acaoArmJoint = misturador.clipAction(clipArmJoint)

        const clipAbajurJoint = THREE.AnimationClip.findByName(gltf.animations, 'AbajurJoint1')
        acaoAbajurJoint = misturador.clipAction(clipAbajurJoint)

        mudarTextura();

    }
)

// criar e configurar o renderer
let meuCanvas = document.getElementById('meuCanvas')
let renderer = new THREE.WebGLRenderer({ 
    canvas: meuCanvas,
    antialias: true
 })


let delta = 0; // tempo desde a última atualização
let relogio = new THREE.Clock(); // componente que obtém o delta
let latencia_minima = 1 / 60; // tempo mínimo entre cada atualização

renderer.setSize( 953, 709 )
renderer.setPixelRatio(window.devicePixelRatio);

// criar e posicionar a camara
let camara = new THREE.PerspectiveCamera(50, 953 / 709, 0.01, 1000);
camara.position.set(-10,2, 13); // Set position like this


cena.background = new THREE.Color('#E8E8E8'); // Cor de fundo
renderer.shadowMap.enabled = true;

let controlos = new OrbitControls(camara, renderer.domElement);
controlos.maxDistance = 20;

// adicionar luzes

const luzAmbiente = new THREE.AmbientLight( "lightgreen" )
cena.add(luzAmbiente)

const luzFrontal = new THREE.DirectionalLight("white");
luzFrontal.position.set(5, 10, 5);
luzFrontal.intensity = 3;
cena.add(luzFrontal);

const luzTraseira = new THREE.DirectionalLight("white");
luzTraseira.position.set(-3, 10, -5);
luzTraseira.intensity = 3;
cena.add(luzTraseira);

const luzInferior = new THREE.DirectionalLight("white");
luzInferior.position.set(0, -5, 0);
luzInferior.intensity = 4;
cena.add(luzInferior);


function mudarTextura() {
    const suporte = cena.getObjectByName('Support');
    const suporteJointHolder = cena.getObjectByName('SupportJointHolder');
    const suporteJoint = cena.getObjectByName('SupportJoint');
    const circleJoint = cena.getObjectByName('CircleJoint');
    const longArm = cena.getObjectByName('LongArm');
    const shortArm = cena.getObjectByName('ShortArm');
    const armToAbajurJoint = cena.getObjectByName('ArmToAbajurJoint');
    const abajurJoint = cena.getObjectByName('AbajurJoint');
    const abajur = cena.getObjectByName('Abajur');
    const abajurMesh = cena.getObjectByName('AbajurMesh');


    let texturaURL

    if (texturaVerify == false) {
        texturaURL = './textures/bronze.png';
        texturaVerify = true;
    } else {
        texturaURL = './textures/preto.png';
        texturaVerify = false;
    }
    
    const material = new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load(texturaURL, function(textura) {
            textura.encoding = THREE.sRGBEncoding;
            textura.wrapS = THREE.RepeatWrapping;
            textura.wrapT = THREE.RepeatWrapping;
            textura.repeat.set(4, 4);
        }),
    });

    suporte.material = material;
    suporteJointHolder.material = material;
    suporteJoint.material = material;
    circleJoint.material = material;
    longArm.material = material;
    shortArm.material = material;
    armToAbajurJoint.material = material;
    abajurJoint.material = material;
    abajur.material = material;
    abajurMesh.material = material;
}


function reproduzirAnimacao(acao) {
    let animacaoAcao;
    switch (acao) {
        case 'acaoSuporte':
            animacaoAcao = acaoSuporte;
            break;
        case 'acaoLong':
            animacaoAcao = acaoLong;
            break;
        case 'acaoShort':
            animacaoAcao = acaoShort;
            break;
        case 'acaoArmJoint':
            animacaoAcao = acaoArmJoint;
            break;
        case 'acaoAbajurJoint':
            animacaoAcao = acaoAbajurJoint;
            break;
        default:
            return;
    }

    if (!animacaoAcao.isRunning()) {
        animacaoAcao.reset().setLoop(THREE.LoopOnce).play();
        animacaoAcao.setEffectiveTimeScale(0.5);
    }
}

function animar() {
    requestAnimationFrame(animar);// agendar animar para o próximo animation frame
    delta += relogio.getDelta(); // acumula tempo entre chamadas de getDelta
    if (delta < latencia_minima) return; // não exceder a taxa de atualização


    // atualizar misturador
    misturador.update(delta);

    // mostrar...
    renderer.render( cena, camara )
    delta = delta % latencia_minima; // atualizar delta com o excedente
}


animar()

// botões
document.getElementById('suporteButton').addEventListener('click', function() {
    reproduzirAnimacao('acaoSuporte');
});
document.getElementById('longButton').addEventListener('click', function() {
    reproduzirAnimacao('acaoLong');
});
document.getElementById('shortButton').addEventListener('click', function() {
    reproduzirAnimacao('acaoShort');
});
document.getElementById('armJointButton').addEventListener('click', function() {
    reproduzirAnimacao('acaoArmJoint');
});
document.getElementById('abajurJointButton').addEventListener('click', function() {
    reproduzirAnimacao('acaoAbajurJoint');
});

document.getElementById('trocarCor').addEventListener('click', function() {
    mudarTextura();
});