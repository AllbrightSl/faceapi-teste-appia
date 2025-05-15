
window.addEventListener('load', () => {
  inicializarFaceAPI();
});

async function inicializarFaceAPI() {
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri('models/tiny_face_detector');
    const img = document.getElementById('inputImage');
    const canvas = document.getElementById('overlay');

    if (!img.complete) {
      await new Promise(resolve => {
        img.onload = resolve;
      });
    }

    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const displaySize = { width: img.naturalWidth, height: img.naturalHeight };
    faceapi.matchDimensions(canvas, displaySize);

    const detections = await faceapi.detectAllFaces(
      img,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.3 })
    );

    const resized = faceapi.resizeResults(detections, displaySize);
    faceapi.draw.drawDetections(canvas, resized);

    console.log(`Rostos detectados: ${detections.length}`);

    const proximidade = detections
      .map(d => ({ box: d.box, size: d.box.height }))
      .sort((a, b) => b.size - a.size);

    console.log('=== Distância relativa (1 = mais próximo) ===');
    proximidade.forEach((p, i) => {
      console.log(`${i + 1}º → altura=${p.size.toFixed(0)}px`);
      const tag = document.createElement('div');
      tag.style.position = 'absolute';
      tag.style.top = `${p.box.y + p.box.height + 4}px`;
      tag.style.left = `${p.box.x}px`;
      tag.style.background = 'rgba(0,0,0,0.6)';
      tag.style.color = 'white';
      tag.style.padding = '2px 4px';
      tag.style.fontSize = '12px';
      tag.innerText = `${i + 1}`;
      document.getElementById('wrapper').appendChild(tag);
    });
  } catch (err) {
    console.error('Erro ao inicializar FaceAPI:', err);
  }
}
