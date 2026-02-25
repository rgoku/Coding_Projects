// Inline OrbitControls for Create Site generator
// Extracted from solar-farm-v2

export function createOrbitControls(o, d) {
  const ctrl = {};
  ctrl.object = o;
  ctrl.domElement = d;
  ctrl.target = new THREE.Vector3();
  ctrl.enableDamping = true;
  ctrl.dampingFactor = 0.08;
  ctrl.rotateSpeed = 0.5;
  ctrl.zoomSpeed = 1.2;
  ctrl.panSpeed = 0.8;
  ctrl.minDistance = 3;
  ctrl.maxDistance = 500;
  ctrl.maxPolarAngle = Math.PI / 2 - 0.02;
  ctrl.autoRotate = false;
  ctrl.autoRotateSpeed = 0.3;

  const spherical = new THREE.Spherical();
  const sphericalDelta = new THREE.Spherical();
  const panOffset = new THREE.Vector3();
  let scale = 1;
  const rotStart = new THREE.Vector2(), rotEnd = new THREE.Vector2(), rotDelta = new THREE.Vector2();
  const panStart = new THREE.Vector2(), panEnd = new THREE.Vector2(), panDelta = new THREE.Vector2();
  const STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };
  let state = STATE.NONE;

  function getZoomScale() { return Math.pow(0.95, ctrl.zoomSpeed); }

  ctrl.update = (function () {
    const offset = new THREE.Vector3();
    const quat = new THREE.Quaternion().setFromUnitVectors(o.up, new THREE.Vector3(0, 1, 0));
    const quatInv = quat.clone().invert();
    return function () {
      const pos = ctrl.object.position;
      offset.copy(pos).sub(ctrl.target);
      offset.applyQuaternion(quat);
      spherical.setFromVector3(offset);
      if (ctrl.autoRotate) sphericalDelta.theta -= 2 * Math.PI / 60 / 60 * ctrl.autoRotateSpeed;
      spherical.theta += sphericalDelta.theta * ctrl.dampingFactor;
      spherical.phi += sphericalDelta.phi * ctrl.dampingFactor;
      spherical.phi = Math.max(0.01, Math.min(ctrl.maxPolarAngle, spherical.phi));
      spherical.radius *= scale;
      spherical.radius = Math.max(ctrl.minDistance, Math.min(ctrl.maxDistance, spherical.radius));
      ctrl.target.addScaledVector(panOffset, ctrl.dampingFactor);
      offset.setFromSpherical(spherical);
      offset.applyQuaternion(quatInv);
      pos.copy(ctrl.target).add(offset);
      ctrl.object.lookAt(ctrl.target);
      sphericalDelta.theta *= (1 - ctrl.dampingFactor);
      sphericalDelta.phi *= (1 - ctrl.dampingFactor);
      panOffset.multiplyScalar(1 - ctrl.dampingFactor);
      scale = 1;
    };
  })();

  function onMD(e) {
    if (e.button === 0) { state = STATE.ROTATE; rotStart.set(e.clientX, e.clientY); }
    else if (e.button === 2) { state = STATE.PAN; panStart.set(e.clientX, e.clientY); }
  }
  function onMM(e) {
    if (state === STATE.ROTATE) {
      rotEnd.set(e.clientX, e.clientY); rotDelta.subVectors(rotEnd, rotStart);
      sphericalDelta.theta -= 2 * Math.PI * rotDelta.x / d.clientHeight * ctrl.rotateSpeed;
      sphericalDelta.phi -= 2 * Math.PI * rotDelta.y / d.clientHeight * ctrl.rotateSpeed;
      rotStart.copy(rotEnd);
    } else if (state === STATE.PAN) {
      panEnd.set(e.clientX, e.clientY); panDelta.subVectors(panEnd, panStart);
      const te = new THREE.Vector3(), re = new THREE.Vector3();
      const dist = o.position.distanceTo(ctrl.target);
      const fovH = 2 * Math.tan(o.fov / 2 * Math.PI / 180) * dist;
      te.setFromMatrixColumn(o.matrix, 0);
      re.setFromMatrixColumn(o.matrix, 1);
      te.multiplyScalar(-panDelta.x * fovH / d.clientHeight * ctrl.panSpeed);
      re.multiplyScalar(panDelta.y * fovH / d.clientHeight * ctrl.panSpeed);
      panOffset.add(te).add(re);
      panStart.copy(panEnd);
    }
  }
  function onMU() { state = STATE.NONE; }
  function onW(e) { if (e.deltaY > 0) scale /= getZoomScale(); else scale *= getZoomScale(); }

  d.addEventListener('mousedown', onMD);
  d.addEventListener('mousemove', onMM);
  d.addEventListener('mouseup', onMU);
  d.addEventListener('wheel', onW, { passive: true });
  d.addEventListener('contextmenu', e => e.preventDefault());

  // Touch support
  let touchDist = 0;
  d.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) { state = STATE.ROTATE; rotStart.set(e.touches[0].clientX, e.touches[0].clientY); }
    else if (e.touches.length === 2) { state = STATE.ZOOM; const dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY; touchDist = Math.sqrt(dx * dx + dy * dy); }
  }, { passive: true });
  d.addEventListener('touchmove', function (e) {
    if (state === STATE.ROTATE && e.touches.length === 1) {
      rotEnd.set(e.touches[0].clientX, e.touches[0].clientY); rotDelta.subVectors(rotEnd, rotStart);
      sphericalDelta.theta -= 2 * Math.PI * rotDelta.x / d.clientHeight * ctrl.rotateSpeed;
      sphericalDelta.phi -= 2 * Math.PI * rotDelta.y / d.clientHeight * ctrl.rotateSpeed;
      rotStart.copy(rotEnd);
    } else if (state === STATE.ZOOM && e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY;
      const nd = Math.sqrt(dx * dx + dy * dy);
      if (nd > touchDist) scale *= getZoomScale(); else scale /= getZoomScale();
      touchDist = nd;
    }
  }, { passive: true });
  d.addEventListener('touchend', function () { state = STATE.NONE; }, { passive: true });

  ctrl.dispose = function () {
    d.removeEventListener('mousedown', onMD);
    d.removeEventListener('mousemove', onMM);
    d.removeEventListener('mouseup', onMU);
    d.removeEventListener('wheel', onW);
  };

  return ctrl;
}
