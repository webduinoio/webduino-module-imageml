+(function (window, webduino) {

  'use strict';

  window.getVideoClassifier = function (modelName, camSource, userId, rotate) {
    return new webduino.module.imageml(modelName, camSource, userId, rotate);
  };

}(window, window.webduino));