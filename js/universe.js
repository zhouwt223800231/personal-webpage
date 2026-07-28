<script>
/* ==================================================================
   ANIMATED STARFIELD BACKGROUND — NASA deep-space style
   No edits needed here. STAR_COUNT below controls star density.
   ================================================================== */
(function(){
const container =
document.getElementById(
"universe-background"
);

const scene =
new THREE.Scene();

const camera =
new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
1000
);

const renderer =
new THREE.WebGLRenderer({
alpha:true,
antialias:true
});

renderer.setSize(
window.innerWidth,
window.innerHeight
);

container.appendChild(
renderer.domElement
);

camera.position.z=30;

// 星空

let geometry =
new THREE.BufferGeometry();
let positions=[];
for(let i=0;i<4000;i++){
positions.push(
(Math.random()-0.5)*600,
(Math.random()-0.5)*600,
(Math.random()-0.5)*600
);
}
geometry.setAttribute(
"position",
new THREE.Float32BufferAttribute(
positions,
3
)
);
let stars =
new THREE.Points(
geometry,
new THREE.PointsMaterial({
color:0xffffff,
size:0.8
})
);
scene.add(stars);

// 动画

function animate(){
requestAnimationFrame(
animate
);
stars.rotation.y+=0.0004;
stars.rotation.x+=0.0001;
renderer.render(
scene,
camera
);
}
animate();

// 自适应

window.onresize=function(){
camera.aspect=
window.innerWidth/
window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(
window.innerWidth,
window.innerHeight
);
};
})();
</script>
