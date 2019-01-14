//https: //blockly-demo.appspot.com/static/demos/blockfactory_old/index.html#ckpupe

Blockly.Blocks['imageml2_classifier'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(Blockly.Msg.WEBDUINO_IMAGEML_CAMERA_SRC)
      .appendField(new Blockly.FieldTextInput(Blockly.Msg.WEBDUINO_IMAGEML_CAMERA_LOCAL), "camSource")
      .appendField("旋轉鏡頭")
      .appendField(new Blockly.FieldCheckbox("TRUE"), "rotate")
      .appendField(Blockly.Msg.WEBDUINO_IMAGEML_MODEL_NAME)
      .appendField(new Blockly.FieldTextInput(""), "modelName");
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip('');
    this.setToolUrl(hasher.getUIUrl());
  }
};

Blockly.Blocks['imageml2_callback'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new Blockly.FieldVariable("imageClassifier"), "name")
      .appendField(Blockly.Msg.WEBDUINO_IMAGEML_CLASSIFY)
      .appendField(new Blockly.FieldTextInput("0"), "idx")
      .appendField(Blockly.Msg.WEBDUINO_IMAGEML_CLASSIFY2);
    this.appendStatementInput("name")
      .setCheck(null)
      .appendField(Blockly.Msg.WEBDUINO_IMAGEML_RUN);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(75);
    this.setTooltip('');
    this.setToolUrl(hasher.getUIUrl());
  }
};

Blockly.Blocks['imageml2_levelVal'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new Blockly.FieldVariable("imageClassifier"), "name")
      .appendField(Blockly.Msg.WEBDUINO_IMAGEML_LEVEL);
    this.setOutput(true, null);
    this.setColour(45);
    this.setTooltip("");
    this.setToolUrl(hasher.getUIUrl());
  }
};

Blockly.Blocks['imageml2_confidenceVal'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new Blockly.FieldVariable("imageClassifier"), "name")
      .appendField(Blockly.Msg.WEBDUINO_IMAGEML_CONFIDENCE);
    this.setOutput(true, null);
    this.setColour(45);
    this.setTooltip("");
    this.setToolUrl(hasher.getUIUrl());
  }
};