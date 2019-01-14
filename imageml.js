let Camera = (function () {
  const webCam = 0;
  const wsCam = 1;
  const jpgCam = 2;

  class Camera {
    // camType: 0,1,2 or http://192.168.0.11/jpg or ws://192.168.43.110:8889/rws/ws
    constructor(camType) {
      this.setCamType(camType);
      this.setRotateCam(0)
    }

    setRotateCam(degree) {
      this.rotateCam = degree;
    }

    getRotateCam() {
      return this.rotateCam;
    }

    setCamType(camType) {
      this.cameraList = [];
      if (isNaN(parseInt(camType))) {
        this.URL = camType;
        if (camType.indexOf("ws://") == 0) {
          this.camType = wsCam;
        } else if (camType.indexOf("http://") == 0) {
          this.camType = jpgCam;
        }
      } else {
        this.camType = parseInt(camType);
      }
    }

    enumerateDevices() {
      var self = this;
      return new Promise(function (resolve, reject) {
        navigator.mediaDevices.enumerateDevices()
          .then(function (o) {
            self.gotDevices(self, o);
            resolve();
          }).catch(self.handleError);
      });
    }

    gotDevices(self, deviceInfos) {
      for (var i = 0; i !== deviceInfos.length; ++i) {
        var deviceInfo = deviceInfos[i];
        if (deviceInfo.kind === 'videoinput') {
          self.cameraList.push(deviceInfo);
        }
      }
    }

    async startCam() {
      switch (this.camType) {
        case webCam:
          await this.enumerateDevices();
          if (window.stream) {
            window.stream.getTracks().forEach(function (track) {
              track.stop();
            });
          }
          var deviceId = 0;
          try {
            deviceId = this.cameraList[this.camType].deviceId;
          } catch (e) {
            console.log("can't found camType:", this.camType, "error:", e);
            console.log(this.cameraList);
          }
          var constraints = {
            video: {
              deviceId: { exact: deviceId }
            }
          };
          var self = this;
          navigator.mediaDevices.getUserMedia(constraints).
          then(function (stream) {
            if (self.video) {
              self.video.srcObject = stream;
            }
          }).catch(function (error) {
            console.log('Error: ', error);
          });
          break;
          /* WebRTC */
        case wsCam:
          console.log("WebRTC:", this.camType);
          ConnectWebSocket(this.URL);
          break;
        case jpgCam:
          // http://192.168.43.201:9966/ok.png
          console.log("JPGCam:", this.camType, " ,URL:", this.URL);
          //this.setRotateCam(90);
          break;
      }
    }

    getEle(eleOrId) {
      return typeof eleOrId === 'object' ?
        eleOrId : document.getElementById(eleOrId);
    }

    onImage(imageId_or_ele, callback) {
      var self = this;
      var image = this.getEle(imageId_or_ele);
      image.setAttribute("crossOrigin", 'Anonymous');
      var camSnapshotDelay = 0.5;
      var param = this.URL.indexOf("?");
      if (param > 0) {
        camSnapshotDelay = parseFloat(this.URL.substring(param + 1)) * 1000;
        this.URL = this.URL.substring(0, param);
      }
      image.src = this.URL;
      image.onload = function () {
        setTimeout(function () {
          if (typeof callback == 'function') {
            callback(image);
          }
          image.src = self.URL + "?" + Math.random();
        }, camSnapshotDelay);
      }
    }

    onCanvas(eleOrId, callback) {
      var self = this;
      var canvas = self.getEle(eleOrId);
      buttonTrigger(canvas, function () {
        self.startCam();
        switch (self.camType) {
          case webCam:
          case wsCam:
            var video = self.createVideo();
            window.remoteVideo = self.video = video;
            video.onloadeddata = function () {
              var loop = function () {
                var ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight,
                  0, 0, canvas.width, canvas.height);
                if (typeof callback == 'function') {
                  callback(canvas);
                }
                requestAnimationFrame(loop);
              }
              requestAnimationFrame(loop);
            }
            break;
          case jpgCam:
            self.onImage(document.createElement('img'), function (img) {
              var ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
              if (self.getRotateCam() > 0) {
                self.drawRotated(canvas, img, 90);
              }
              if (typeof callback == 'function') {
                callback(canvas);
              }
            });
            break;
        }
      });
    }

    toVideo(eleOrId) {
      var self = this;
      window.remoteVideo = self.video = this.getEle(eleOrId);
      buttonTrigger(self.video, function () {
        self.startCam();
      });
    }

    createVideo() {
      var video = document.createElement('video');
      video.autoplay = true;
      return video;
    }

    drawRotated(canvas, image, degrees) {
      var context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(degrees * Math.PI / 180);
      context.drawImage(image, -image.width / 2, -image.width / 2);
      context.restore();
    }
  }

  function buttonTrigger(ele, callback) {
    if (navigator.userAgent.indexOf("Chrome") < 0) {
      var btn = document.createElement("BUTTON");
      btn.setAttribute("style", "background-color: #e0f0e0;position: absolute;z-index:2;font-size:32px");
      document.getElementsByTagName("body")[0].append(btn);
      var rect = ele.getBoundingClientRect();
      btn.style.top = rect.top;
      btn.style.left = rect.left;
      btn.style.width = rect.width;
      btn.style.height = rect.height;
      btn.innerHTML = "Start Camera";
      btn.addEventListener('click', function (e) {
        btn.parentNode.removeChild(btn);
        callback();
      });
    } else {
      callback();
    }
  }

  return Camera;
})();

+
(function (factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function (scope) {
  'use strict';
  // let self = this;
  let proto;
  let Module = scope.Module;
  const HOST_URL = "https://imageml2.webduino.io";
  let mobilenet;
  let secondmodel;
  let vid = 0;
  let status;
  let labels = [];
  let currentClass = -1;
  let currentConfidence = 0;

  function loadJS(filePath) {
    var req = new XMLHttpRequest();
    req.open("GET", filePath, false); // 'false': synchronous.
    req.send(null);
    var headElement = document.getElementsByTagName("head")[0];
    var newScriptElement = document.createElement("script");
    newScriptElement.type = "text/javascript";
    newScriptElement.text = req.responseText;
    headElement.appendChild(newScriptElement);
  }

  async function start(modelName, camSource, userId, _rotate) {
    console.log("tfjs 0.13.4");
    var rotate = _rotate;
    //camSource = "http://192.168.0.168/jpg?0.5";
    // Module.call(this);
    loadJS('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@0.13.4');
    // load models
    try {
      const _mobilenet = await tf.loadModel(HOST_URL + '/mobilenet/v1_0.25_224/model.json');
      const layer = _mobilenet.getLayer('conv_pw_13_relu');
      mobilenet = tf.model({ inputs: _mobilenet.inputs, outputs: layer.output });
      if (modelName.indexOf('https://') === 0) {
        // modelName is full url
        secondmodel = await tf.loadModel(modelName);
      } else {
        // modelName is just name, combine full url by userId
        secondmodel = await tf.loadModel(HOST_URL + '/ml_models/' + ('00000000' + userId).slice(-8) + modelName + '/model.json');
      }
    } catch (e) {
      alert('Load model error!');
    }
    if (camSource != '本機') {
      var c1 = document.createElement('canvas');
      c1.width = 224;
      c1.height = 224;
      document.body.appendChild(c1);
      var cam = new Camera(camSource);
      cam.setRotateCam(rotate ? 90 : 0);
      cam.onCanvas(c1, function (c) {
        vid = c.getContext('2d').getImageData(0, 0, 224, 224);
      });
    } else {
      vid = document.createElement('video');
      vid.width = 224;
      vid.height = 224;
      vid.autoplay = true;
      document.body.appendChild(vid);
      // start webcam
      try {
        navigator.mediaDevices.getUserMedia({
            video: {
              width: 224,
              height: 224,
              facingMode: "environment"
            }
          })
          .then(stream => {
            vid.srcObject = stream;
            vid.play();
          });
      } catch (e) {
        alert('WebCam is not available!');
      }
    }
    // create status message
    status = document.createElement('div');
    status.id = 'status';
    document.body.appendChild(status);

    await proto.startDetect();
  }

  function imageml(modelName, camSource, userId, _rotate) {
    setTimeout(async () => {
      await start(modelName, camSource, userId, _rotate);
    }, 1);
  }

  imageml.prototype = proto =
    Object.create(Module.prototype, {
      constructor: {
        value: imageml
      }
    });

  proto.onLabel = function (idx, callback) {
    labels[idx] = callback;
  }

  proto.getClass = function () {
    return currentClass;
  }
  proto.getConfidence = function () {
    return parseInt(currentConfidence * 1000000) / 10000.0;
  }

  proto.startDetect = async function () {
    if (vid != 0) {
      const resultTensor = tf.tidy(() => {
        const webcamImage = tf.fromPixels(vid);
        const batchedImage = webcamImage.expandDims(0);
        const img = batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
        const activation = mobilenet.predict(img).flatten().expandDims(0);
        const predictions = secondmodel.predict(activation);
        return predictions.as1D();
      });
      let classTensor = resultTensor.argMax();
      let confidenceTensor = resultTensor.max();
      currentClass = (await classTensor.data())[0];
      currentConfidence = (await confidenceTensor.data())[0];
      classTensor.dispose();
      confidenceTensor.dispose();
      resultTensor.dispose();
      status.innerHTML = "辨識類別編號為：" + currentClass + ",信心水準：" + parseInt(currentConfidence * 1000000) / 10000.0 + " %";
      if (typeof labels[currentClass] === "function") {
        labels[currentClass](currentClass);
      }
    }
    setTimeout(async () => { await proto.startDetect() }, 100);
  }

  scope.module.imageml = imageml;
}));