// Compass Widget - Updates compass rotation based on camera angle
// Imported by main.js, called in animate() loop

export function updateCompass() {
  const compassRing = document.getElementById('compass-ring');
  if (!compassRing || !window._mainCamera) return;

  const camera = window._mainCamera;
  const target = window._mainCameraTarget || new THREE.Vector3(0, 0, 0);

  // Calculate the angle from camera to target in the XZ plane
  const dx = camera.position.x - target.x;
  const dz = camera.position.z - target.z;
  const angle = Math.atan2(dx, dz) * (180 / Math.PI);

  compassRing.style.transform = `rotate(${angle}deg)`;
}
