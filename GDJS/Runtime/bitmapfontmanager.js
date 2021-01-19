/**
*BitmapFontManager use the resources file needed for install the "bitmapFont" from PixiJS
*Can return the fontName
Can check if the bitmapFont is already installed by searching with a resource file (type "bitmapFont")
 * @constructor
 * @memberof gdjs
 * @class BitmapFontManager
 */

//BitmapFontManager loads fnt/xml files (using `fetch`) as a "bitmapFont" resource
gdjs.BitmapFontManager = function (resources) {
  this._resources = resources;
  this._fontUsed = {};
  this._fontTobeUnloaded = [];
};

/**
 * Update the resources data of the game. Useful for hot-reloading, should not be used otherwise.
 *
 * @param {ResourceData[]} resources The resources data of the game.
 */
gdjs.BitmapFontManager.prototype.setResources = function (resources) {
  this._resources = resources;
};

/**
 * When an object use an bitmapFont register the slug of the font and how many objects use it.
 * @param {string} name Slug of the bitmapFont
 */
gdjs.BitmapFontManager.prototype.setFontUsed = function (name) {
  this._fontUsed[name] = this._fontUsed[name] || { objectsUsingTheFont: 0 };
  this._fontUsed[name].objectsUsingTheFont++;

  const fontCachePosition = this._fontTobeUnloaded.indexOf(name);
  if (fontCachePosition !== -1) {
    // The font is in the cache of unloaded font, because it was previously used and then marked as not used anymore.
    // Remove it from the cache to avoid the font getting unloaded.
    this._fontTobeUnloaded.splice(fontCachePosition, 1);
  }
};

/**
 * When an bitmapText object is removed, decrease the count of objects related to the font in the manager.
 * When a font is not unused anymore, it goes in a temporary cache. The cache holds up to 10 fonts.
 * If the cache reaches its maximum capacity, the oldest font is unloaded from memory.
 * @param {string} name Slug of the bitmapFont
 */
gdjs.BitmapFontManager.prototype.removeFontUsed = function (name) {
  if (!this._fontUsed[name]) {
    // We tried to remove font that was never marked as used.
    console.error(
      'BitmapFont with name ' +
        name +
        ' was tried to be removed but was never marked as used.'
    );
    return;
  }

  this._fontUsed[name].objectsUsingTheFont--;

  if (this._fontUsed[name].objectsUsingTheFont <= 0) {
    delete this._fontUsed[name];

    // Add the font name at the last position of the cache.
    if (!this._fontTobeUnloaded.includes(name))
      this._fontTobeUnloaded.push(name);

    if (this._fontTobeUnloaded.length > 10) {
      // Remove the first font (i.e: the oldest one)
      const oldestUnloadedFont = this._fontTobeUnloaded.shift();
      PIXI.BitmapFont.uninstall(oldestUnloadedFont);
      console.log('Uninstall bitmapFont: ' + oldestUnloadedFont);
    }
  }
};

// This method is asynchronous and return a promise with the fontName.
gdjs.BitmapFontManager.prototype.loadBitmapFont = async function (
  bitmapFontResourceName,
  texture
) {
  let bitmapFontResource = this._resources.find(function (resource) {
    return (
      resource.kind === 'bitmapFont' && resource.name === bitmapFontResourceName
    );
  });

  if (!bitmapFontResource) {
    return Promise.reject(
      new Error(
        'Can\'t find resource with name: "' +
          bitmapFontResourceName +
          '" (or is not a bitmapFont file).'
      )
    );
  }

  let response = await fetch(bitmapFontResource.file);
  if (!response.ok) {
    return Promise.reject(
      new Error(
        "Can't fetch the bitmap font file, error: " +
          response.status +
          '(' +
          response.statusText +
          ')'
      )
    );
  }

  let fontData = await response.text();
  let bitmapFont = PIXI.BitmapFont.install(fontData, texture);
  return Promise.resolve(bitmapFont.font);
};

/**
 * Check if a bitmap font exist by this name.
 * The font name is defined in the font file (.fnt/.xml)
 * @param {string} fontName Name of the bitmap font
 */
gdjs.BitmapFontManager.prototype.isBitmapFontLoaded = function (fontName) {
  return !!PIXI.BitmapFont.available[fontName];
};

// function not yet used, because not complete
// At the end loadBitmapFont() must use as arguments bitmapFontResourceName and texture
// But texture isn't yet setup in this function
gdjs.BitmapFontManager.prototype.preloadBitmapFonts = function (
  onProgress,
  onComplete
) {
  let resources = this._resources;

  let bitmapFontResources = resources.filter(function (resource) {
    return resource.kind === 'bitmapFont' && !resource.disablePreload;
  });
  if (bitmapFontResources.length === 0)
    return onComplete(bitmapFontResources.length);

  var loaded = 0;
  /** @type BitmapFontManagerRequestCallback */
  var onLoad = function (error) {
    if (error) {
      console.error('Error while preloading a bitmapFont resource:' + error);
    }

    loaded++;
    if (loaded === bitmapFontResources.length) {
      onComplete(bitmapFontResources.length);
    } else {
      onProgress(loaded, bitmapFontResources.length);
    }
  };

  for (var i = 0; i < bitmapFontResources.length; ++i) {
    this.loadBitmapFont(bitmapFontResources[i].name, texture)
      .then((fontName) => {
        this._pixiObject.fontName = fontName;
        this._pixiObject.dirty = true;
      })
      .catch((error) => {
        console.error('Error while preloading a bitmapFont resource:', error);
      });
  }
};

/**
 * The callback called when a bitmap font that was requested is loaded (or an error occured).
 * @callback BitmapFontManagerRequestCallback
 * @param {?Error} error The error, if any. `null` otherwise.
 * @param {?Object} jsonContent The content of the json file (or null if an error occured).
 * @returns {void} Nothing
 */
