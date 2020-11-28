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

const calcExpressionPoint = (expression) => {
  switch (expression) {
    case "neutral":
      return 1;
    case "angry":
    case "disgusted":
      return 2;
    case "happy":
      return -5;
    default:
      return 0;
  }
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

    // 真顔ポイント
    let seriousPoint = 0;
    let seriousCount = 0;

    const pictureCanvas = document.querySelector("canvas");
    const timestampLabel = document.querySelector("#timestamp");
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
        seriousPoint += calcExpressionPoint(expression);
        if (seriousPoint >= 100) {
          // 画像出力
          pictureCanvas
            .getContext("2d")
            .drawImage(video, 0, 0, pictureCanvas.width, pictureCanvas.height);
          seriousPoint = 0;
          seriousCount++;
          timestampLabel.textContent = `${seriousCount}回目 ${new Date()}`;
        }
      });
    }, 100);
  });
})();
