var center;
var cameraPos = new THREE.Quaternion();

var makeConstellation = function(){

  updateUI('atlas');

  var scene = new THREE.Scene();
      scene.selectable=[];
  var vertices = [],
      colors = [],
      sizes = [],
      starsGeometryFiltered = new THREE.BufferGeometry();

  //container for transformations
  var container = new THREE.Object3D();
  //stars
  starDatabase.map(function(d){
    if(d.con == INTERSECTED.userData.name){
      //if processing major star create unique object
      if(d.proper !== ""){
        var majorStarGeo = new THREE.Geometry();
        var majorStarMap = new THREE.TextureLoader().load('textures/lensflare0_alpha.png');
        //2d to 3d coordinates
        var lambda = d.ra*Math.PI/180*15, //arc length, range 360 deg
            phi = d.dec*Math.PI/180,      //arc length, range 90 deg
            cosPhi = Math.cos(phi);
        var x = radius*cosPhi*Math.cos(lambda),
            y = radius*cosPhi*Math.sin(lambda),
            z = radius * Math.sin(phi);


        majorStarGeo.vertices.push(new THREE.Vector3(x,y,z));
        var majorStarMat = new THREE.PointsMaterial({
          color: new THREE.Color(starColor(d.ci)),
          size: (scaleMag(d.mag)*400),
          blending: THREE.AdditiveBlending,
          transparent: true,
          map: majorStarMap,
        });
        var majorStar = new THREE.Points(majorStarGeo, majorStarMat);

        majorStar.userData = d.proper;
        container.add(majorStar);
        scene.selectable.push(majorStar)
      }
      //use vertex shader method for unnamed stars
      else{
        //2d to 3d coordinates
        var lambda = d.ra*Math.PI/180*15,
            phi = d.dec*Math.PI/180,
            cosPhi = Math.cos(phi);
        var x = radius*cosPhi*Math.cos(lambda),
            y = radius*cosPhi*Math.sin(lambda),
            z = radius * Math.sin(phi);

        vertices.push(x);
        vertices.push(y);
        vertices.push(z);
        var rgb = new THREE.Color(starColor(d.ci));
        colors.push(rgb.r, rgb.g, rgb.b);
        sizes.push((scaleMag(d.mag))*1);
      }
    }//filter by name/mag end
  })//database processing end

  //shader setup
  starsGeometryFiltered.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  starsGeometryFiltered.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  starsGeometryFiltered.addAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

  var uniforms = {
      texture: {value: new THREE.TextureLoader().load('textures/lensflare0_alpha.png')},
      scale: {type: 'f', value: window.innerHeight/2}
    };

  var starsMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById('vertexshader').textContent,
    fragmentShader: document.getElementById('fragmentshader').textContent,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: true,
    alphaTest: 0.5
  });

  var starFieldFiltered = new THREE.Points(starsGeometryFiltered, starsMaterial);
  //starFieldFiltered.geometry.center();
  container.add(starFieldFiltered);

  //append constellation boundary from intesected object
  var boundsDetailed = INTERSECTED.children[0].clone();
  //boundsDetailed.geometry.center();
  container.add(boundsDetailed);

  //add constellation lines
  var linesGeometry = new THREE.Geometry();
  for (var i=2; i<INTERSECTED.children.length; i++){
    line = INTERSECTED.children[i].clone();
    container.add(line);
  }

  //append name and get description from wikipedia
  var ahref = INTERSECTED.children[2].userData[1];
  ahref = ahref.replace(/ /g,"_"); //replace space with underscore
  document.getElementById('name-container').innerHTML = INTERSECTED.children[2].userData[1];
  getWikiData(ahref+'_(constellation)');

  scene.add(container);
  container.name = "container";
  sceneLvl2 = scene;

  ;
  centerConstellation(container, 1);
  if(typeof window.orientation !== 'undefined') {
    camera.rotation.set(0,0,0);
    camera.position.set(0,0,0)
    switchControls()
  };
}

function centerConstellation(container, x){
  //draw box around constellation and get its center
  var bCenter = new THREE.Box3().setFromObject(container).getCenter();
  //get direction which camera is looking at
  var direction = camera.getWorldDirection();
  //center object
  container.quaternion.setFromUnitVectors(bCenter.normalize(), direction.normalize());
  //move object to 0,0,0
  new THREE.Box3().setFromObject(container).getCenter(container.position).multiplyScalar(-1);
  // //draw smallest possible box around mesh and compute its center
  // new THREE.Box3().setFromObject(container).getCenter(container.position).multiplyScalar(1);
  
	// var vector = new THREE.Vector3(0,0,0);
	// var direction = vector.clone().add(camera.position).normalize();
  
	// vector.add(direction.clone().multiplyScalar(1));
  
	// container.quaternion.setFromUnitVectors(container.position.normalize().multiplyScalar(-x), vector.normalize());

  // var center2 = new THREE.Box3().setFromObject(container).getCenter(container.position).multiplyScalar(-1);
  // camera.translateZ(8000);
};
