/**
 * The PIXI.js renderer for the BBCode Text runtime object.
 *
 * @class BBTextRuntimeObjectPixiRenderer
 * @constructor
 * @param {gdjs.BBTextRuntimeObject} runtimeObject The object to render
 * @param {gdjs.RuntimeScene} runtimeScene The gdjs.RuntimeScene in which the object is
 */
gdjs.BBTextRuntimeObjectPixiRenderer = function(runtimeObject, runtimeScene) {
  this._object = runtimeObject;

  // Load (or reset) the text
  if (this._pixiObject === undefined) {
    this._pixiObject = new MultiStyleText(runtimeObject._text, {
      default: {
        fontFamily: runtimeObject._fontFamily,
        fontSize: `${runtimeObject._fontSize}px`,
        fill: runtimeObject._color,
        tagStyle: ['[', ']'],
        wordWrap: true,
        wordWrapWidth: runtimeObject._wrappingWidth,
        align: runtimeObject._align,
      },
    });

    this._object.hidden = !runtimeObject._visible;
  } else {
    // No setting X/Y/Z as it will be updated
    this.updateText();
    this.updateColor();
    this.updateAlignment();
    this.updateFontFamily();
    this.updateFontSize();
    this.updatePosition();
  }

  runtimeScene
    .getLayer('')
    .getRenderer()
    .addRendererObject(this._pixiObject, runtimeObject.getZOrder());

  // Set the anchor in the center, so that the object rotates around
  // its center
  this._pixiObject.anchor.x = 0.5;
  this._pixiObject.anchor.y = 0.5;

  this.updateText();
  this.updatePosition();
  this.updateAngle();
  this.updateOpacity();
  this.updateVisible();
  this.ensureUpToDate();
};

gdjs.BBTextRuntimeObjectRenderer = gdjs.BBTextRuntimeObjectPixiRenderer;

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.getRendererObject = function() {
  return this._pixiObject;
};

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.ensureUpToDate = function() {
  if (this._object._wrappingWidth !== this._pixiObject._wrappingWidth) {
    this._pixiObject._style.wordWrapWidth = this._object._wrappingWidth;
    this._pixiObject.dirty = true;
  }
  if (
    !this._textureWasValid &&
    this._pixiObject.texture &&
    this._pixiObject.texture.valid
  ) {
    if (this._object._align !== this._pixiObject._style.align) {
      this._pixiObject._style.align = this._object._align;
      this._pixiObject.dirty = true;
    }
    this.updatePosition();
    this._textureWasValid = true;
  }
};

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.updateText = function() {
  this._pixiObject.setText(this._object._text);
  this.updatePosition();
};

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.updateColor = function() {
  this._pixiObject.textStyles.default.fill = this._object._color;
};

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.updateAlignment = function() {
  this._pixiObject._style.align = this._object._align;
  this._pixiObject.dirty = true;
};
gdjs.BBTextRuntimeObjectPixiRenderer.prototype.updateFontFamily = function() {
  this._pixiObject.textStyles.default.fontFamily = this._object._fontFamily;
};
gdjs.BBTextRuntimeObjectPixiRenderer.prototype.updateFontSize = function() {
  this._pixiObject.textStyles.default.fontSize = `${this._object._fontSize}px`;
};

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.updatePosition = function() {
  this._pixiObject.position.x = this._object.x + this._pixiObject.width / 2;
  this._pixiObject.position.y = this._object.y + this._pixiObject.height / 2;
};

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.updateVisible = function() {
  this._pixiObject.hidden = !this._object._visible;
};

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.updateAngle = function() {
  this._pixiObject.rotation = gdjs.toRad(this._object.angle);
};

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.updateOpacity = function() {
  this._pixiObject.alpha = this._object._opacity / 255;
};

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.getWidth = function() {
  return this._pixiObject.width;
};

gdjs.BBTextRuntimeObjectPixiRenderer.prototype.getHeight = function() {
  return this._pixiObject.height;
};
