+(function (window, webduino) {

  'use strict';

  window.getVideoClassifier = function (modelName, camSource, userId, rotate, _canvas) {
    return new webduino.module.imageml(modelName, camSource, userId, rotate, _canvas);
  };

}(window, window.webduino));