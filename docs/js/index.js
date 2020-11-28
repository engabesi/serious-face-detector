// switch at upload to git
// const gitPagesPath = "";
const gitPagesPath = "/serious-face-detector";

const startVideo = async (video) => {
  try {
    const constraints = { audio: false, video: {} };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
  } catch (error) {
    console.error(error);
  }
};

const loadModels = async () => {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(`${gitPagesPath}/js/lib/models`),
    faceapi.nets.faceExpressionNet.loadFromUri(`${gitPagesPath}/js/lib/models`),
  ]);
};

(async () => {
  const video = document.querySelector("video");
  await loadModels();
  await startVideo(video);
  video.addEventListener("play", () => {
    const displaySize = { width: video.width, height: video.height };
    const tinyFaceDetectorOption = {
      // default 416
      inputSize: 224,
      // default 0.5
      scoreThreshold: 0.5,
    };
    setInterval(async () => {
      const results = await faceapi
        .detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions(tinyFaceDetectorOption)
        )
        .withFaceExpressions();
      if (results.length <= 0) return;
      const resizedResults = faceapi.resizeResults(results, displaySize);
      resizedResults.forEach((result) => {
        const expression = result.expressions.asSortedArray()[0].expression;
      });
    }, 100);
  });
})();
