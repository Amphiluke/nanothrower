"bundle";
(function() {
var define = System.amdDefine;
define("components/save.amd.js", ["exports", "jquery", "./abstract-dialog.amd.js", "../file-processing.amd.js", "../app.amd.js", "../structure.amd.js", "../utils.amd.js"], function(exports, _jquery, _abstractDialogAmd, _fileProcessingAmd, _appAmd, _structureAmd, _utilsAmd) {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  var _jquery2 = _interopRequireDefault(_jquery);
  var _abstractDialogAmd2 = _interopRequireDefault(_abstractDialogAmd);
  var _fileProcessingAmd2 = _interopRequireDefault(_fileProcessingAmd);
  var _appAmd2 = _interopRequireDefault(_appAmd);
  var _structureAmd2 = _interopRequireDefault(_structureAmd);
  var _utilsAmd2 = _interopRequireDefault(_utilsAmd);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
  }
  let save = Object.assign(new _abstractDialogAmd2.default(".nt-save-form"), {handleSave(e) {
      let type = (0, _jquery2.default)("#nt-file-type").val(),
          file = _fileProcessingAmd2.default.makeFile(type);
      if (file) {
        e.target.setAttribute("download", `untitled.${type}`);
        e.target.href = _utilsAmd2.default.getBlobURL(file);
      }
    }});
  save.listen([{
    type: "click",
    filter: ".nt-apply",
    handler: "handleSave"
  }]);
  exports.default = save;
  _appAmd2.default.addAction("save", {
    get enabled() {
      return _structureAmd2.default.structure.atoms.length > 0;
    },
    exec() {
      save.show();
    }
  });
});

})();
(function() {
var define = System.amdDefine;
define("components/transform.amd.js", ["exports", "jquery", "./abstract-dialog.amd.js", "../app.amd.js", "../structure.amd.js", "../draw.amd.js"], function(exports, _jquery, _abstractDialogAmd, _appAmd, _structureAmd, _drawAmd) {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  var _jquery2 = _interopRequireDefault(_jquery);
  var _abstractDialogAmd2 = _interopRequireDefault(_abstractDialogAmd);
  var _appAmd2 = _interopRequireDefault(_appAmd);
  var _structureAmd2 = _interopRequireDefault(_structureAmd);
  var _drawAmd2 = _interopRequireDefault(_drawAmd);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
  }
  let transform = Object.assign(new _abstractDialogAmd2.default(".nt-transform-form"), {
    handleAppStateChange(busy) {
      this.$el.find("fieldset").prop("disabled", busy);
    },
    handleTranslate() {
      let $fieldSet = this.$el.find(".nt-translate"),
          x = +$fieldSet.find("[data-axis='x']").val(),
          y = +$fieldSet.find("[data-axis='y']").val(),
          z = +$fieldSet.find("[data-axis='z']").val();
      _structureAmd2.default.translate(x, y, z);
    },
    handleRotate(e) {
      let angle = (0, _jquery2.default)("#nt-rotate-angle").val() * Math.PI / 180,
          axis = e.target.getAttribute("data-axis");
      _structureAmd2.default.rotate(angle, axis);
    },
    show() {
      let centroid = _structureAmd2.default.getCentroid();
      let $fields = this.$el.find(".nt-translate input[data-axis]");
      $fields.val((idx) => centroid[$fields.eq(idx).data("axis")].toFixed(5));
      _drawAmd2.default.addAxes();
      return Object.getPrototypeOf(this).show.apply(this, arguments);
    },
    hide() {
      _drawAmd2.default.removeAxes();
      return Object.getPrototypeOf(this).hide.apply(this, arguments);
    }
  });
  transform.listen([{
    type: "app:stateChange",
    owner: _appAmd2.default,
    handler: "handleAppStateChange"
  }, {
    type: "click",
    owner: "#nt-translate-apply",
    handler: "handleTranslate"
  }, {
    type: "click",
    filter: ".nt-rotate [data-axis]",
    handler: "handleRotate"
  }]);
  exports.default = transform;
  _appAmd2.default.addAction("transform", {
    get enabled() {
      return _structureAmd2.default.structure.atoms.length > 0;
    },
    exec() {
      transform.show();
    }
  });
});

})();
(function() {
var define = System.amdDefine;
define("components/rnd-rain.amd.js", ["exports", "jquery", "../structure.amd.js", "../app.amd.js", "./abstract-dialog.amd.js", "../worker.amd.js", "../draw.amd.js"], function(exports, _jquery, _structureAmd, _appAmd, _abstractDialogAmd, _workerAmd, _drawAmd) {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  var _jquery2 = _interopRequireDefault(_jquery);
  var _structureAmd2 = _interopRequireDefault(_structureAmd);
  var _appAmd2 = _interopRequireDefault(_appAmd);
  var _abstractDialogAmd2 = _interopRequireDefault(_abstractDialogAmd);
  var _workerAmd2 = _interopRequireDefault(_workerAmd);
  var _drawAmd2 = _interopRequireDefault(_drawAmd);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
  }
  let rndRain = Object.assign(new _abstractDialogAmd2.default(".nt-rnd-rain-form"), {
    show() {
      let sphere = this.sphere = _structureAmd2.default.getWrappingSphere();
      sphere.r *= 1.1;
      _drawAmd2.default.addWireSphere(sphere);
      (0, _jquery2.default)("#nt-sphere-radius").val(sphere.r.toFixed(3));
      return Object.getPrototypeOf(this).show.apply(this, arguments);
    },
    hide() {
      _drawAmd2.default.removeWireSphere();
      return Object.getPrototypeOf(this).hide.apply(this, arguments);
    },
    handleApply() {
      if (this.$el[0].checkValidity()) {
        return Object.getPrototypeOf(this).handleApply.apply(this, arguments);
      } else {
        window.alert("Please, fix invalid input first");
      }
    },
    apply() {
      this.fix();
      let captureDistances = new Map((0, _jquery2.default)("#nt-distance-fields").find("label[data-el]").get().map((label) => {
        return [(0, _jquery2.default)(label).data("el"), Number((0, _jquery2.default)("input", label).val())];
      }));
      captureDistances.set("H1", captureDistances.get("H"));
      _workerAmd2.default.invoke("run", {
        mode: this.$el.find("input[name='nt-src-mode']").filter(":checked").val(),
        molecular: (0, _jquery2.default)("#nt-adsorb-mol").prop("checked"),
        biradical: (0, _jquery2.default)("#nt-adsorb-birad").prop("checked"),
        rHH: Number((0, _jquery2.default)("#nt-adsorb-r-hh").val()),
        hCount: Number((0, _jquery2.default)("#nt-adsorb-count").val()),
        sphere: this.sphere,
        structure: _structureAmd2.default.structure,
        captureDistances: captureDistances
      });
    },
    discard() {
      this.reset();
    },
    resetHTML() {
      let atomSet = _structureAmd2.default.getAtomSet();
      atomSet.add("H");
      let html = "";
      for (let el of atomSet) {
        html += `<label data-el="${el}"><input type="text" pattern="\\d*\\.?\\d+([eE][+-]?\\d+)?" required></label>`;
      }
      (0, _jquery2.default)("#nt-distance-fields").html(html);
    },
    handleMolecularChange(e) {
      let molecular = e.target.checked;
      (0, _jquery2.default)("#nt-adsorb-count-mol").toggleClass("hidden", !molecular);
      (0, _jquery2.default)("#nt-adsorb-count-atm").toggleClass("hidden", molecular);
      (0, _jquery2.default)("#nt-adsorb-birad").prop({
        checked: molecular,
        disabled: !molecular
      });
      (0, _jquery2.default)("#nt-adsorb-r-hh").prop({
        required: molecular,
        disabled: !molecular
      });
    },
    handleRadiusChange(e) {
      if (e.target.checkValidity()) {
        this.sphere.r = Number(e.target.value);
        _drawAmd2.default.removeWireSphere();
        _drawAmd2.default.addWireSphere(this.sphere);
      }
    },
    updateProgress: function(value) {
      _appAmd2.default.trigger("app:progress", value);
    },
    updateStructure(updatedStructure) {
      _structureAmd2.default.overwrite(updatedStructure);
    }
  });
  rndRain.listen([{
    type: "change",
    owner: "#nt-adsorb-mol",
    handler: "handleMolecularChange"
  }, {
    type: "change",
    owner: "#nt-sphere-radius",
    handler: "handleRadiusChange"
  }, {
    type: "app:structure:loaded",
    owner: _appAmd2.default,
    handler: "resetHTML"
  }, {
    type: "progress",
    owner: _workerAmd2.default,
    handler: "updateProgress"
  }, {
    type: "run",
    owner: _workerAmd2.default,
    handler: "updateStructure"
  }]);
  exports.default = rndRain;
  _appAmd2.default.addAction("rndRain", {
    get enabled() {
      return _structureAmd2.default.structure.atoms.length > 0;
    },
    exec() {
      rndRain.show();
    }
  });
});

})();
(function() {
var define = System.amdDefine;
define("components/abstract-dialog.amd.js", ["exports", "../eventful.amd.js"], function(exports, _eventfulAmd) {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  var _eventfulAmd2 = _interopRequireDefault(_eventfulAmd);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
  }
  let events = [{
    type: "click",
    filter: ".nt-apply",
    handler(...params) {
      this.handleApply(...params);
    }
  }, {
    type: "click",
    filter: ".nt-discard",
    handler(...params) {
      this.handleDiscard(...params);
    }
  }, {
    type: "keyup",
    owner: document,
    handler(...params) {
      this.handleGlobalKeyUp(...params);
    }
  }];
  exports.default = class extends _eventfulAmd2.default {
    constructor($el) {
      super($el);
      this.listen(events);
    }
    handleApply() {
      this.apply();
      this.hide();
    }
    handleDiscard() {
      this.discard();
      this.hide();
    }
    handleGlobalKeyUp(e) {
      if (e.which === 27) {
        this.discard();
        this.hide();
      }
    }
    apply() {}
    discard() {}
    show() {
      this.$el.removeClass("hidden");
    }
    hide() {
      this.$el.addClass("hidden");
    }
    fix(fields) {
      if (!fields) {
        fields = this.$el[0].elements;
      }
      for (let field of Array.from(fields)) {
        if (field.type === "checkbox" || field.type === "radio") {
          field.defaultChecked = field.checked;
        } else if (field.nodeName.toUpperCase() === "OPTION") {
          field.defaultSelected = field.selected;
        } else if ("defaultValue" in field) {
          field.defaultValue = field.value;
        } else if (field.options) {
          this.fix(field.options);
        }
      }
    }
    reset() {
      this.$el[0].reset();
    }
  };
});

})();
(function() {
var define = System.amdDefine;
define("components/appearance.amd.js", ["exports", "jquery", "./abstract-dialog.amd.js", "../structure.amd.js", "../draw.amd.js", "../app.amd.js"], function(exports, _jquery, _abstractDialogAmd, _structureAmd, _drawAmd, _appAmd) {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  var _jquery2 = _interopRequireDefault(_jquery);
  var _abstractDialogAmd2 = _interopRequireDefault(_abstractDialogAmd);
  var _structureAmd2 = _interopRequireDefault(_structureAmd);
  var _drawAmd2 = _interopRequireDefault(_drawAmd);
  var _appAmd2 = _interopRequireDefault(_appAmd);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
  }
  let appearance = Object.assign(new _abstractDialogAmd2.default(".nt-appearance-form"), {
    handleUpdateStructure(rescanAtoms) {
      if (rescanAtoms) {
        (0, _jquery2.default)("#nt-appearance-element").html("<option selected>" + _structureAmd2.default.getAtomList().join("</option><option>") + "</option>");
        this.setCurrElementColor();
      }
    },
    handleColorChange(e) {
      let color = parseInt(e.target.value.slice(1), 16);
      if (isNaN(color)) {
        return;
      }
      if (!this.tmpClrPresets) {
        this.tmpClrPresets = new Map();
      }
      this.tmpClrPresets.set((0, _jquery2.default)("#nt-appearance-element").val(), color);
    },
    apply() {
      _drawAmd2.default.appearance = this.$el.find("input[name='appearance']:checked").data("appearance");
      _drawAmd2.default.setBgColor((0, _jquery2.default)("#nt-bg-color").val());
      if (this.tmpClrPresets) {
        _drawAmd2.default.setAtomColors(this.tmpClrPresets);
        this.tmpClrPresets = undefined;
      }
      _drawAmd2.default.render();
      this.fix();
    },
    discard() {
      this.reset();
      this.tmpClrPresets = undefined;
      this.setCurrElementColor();
    },
    setCurrElementColor() {
      let el = (0, _jquery2.default)("#nt-appearance-element").val(),
          color;
      if (this.tmpClrPresets && this.tmpClrPresets.has(el)) {
        color = this.tmpClrPresets.get(el);
      } else {
        color = _drawAmd2.default.getAtomColor(el);
      }
      (0, _jquery2.default)("#nt-appearance-color").val("#" + ("000000" + color.toString(16)).slice(-6));
    }
  });
  appearance.listen([{
    type: "updateStructure",
    owner: _structureAmd2.default,
    handler: "handleUpdateStructure"
  }, {
    type: "change",
    owner: "#nt-appearance-element",
    handler: "setCurrElementColor"
  }, {
    type: "change",
    owner: "#nt-appearance-color",
    handler: "handleColorChange"
  }]);
  exports.default = appearance;
  _appAmd2.default.addAction("alterView", {
    get enabled() {
      return _structureAmd2.default.structure.atoms.length > 0;
    },
    exec() {
      appearance.show();
    }
  });
});

})();
(function() {
var define = System.amdDefine;
define("utils.amd.js", ["exports"], function(exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  let blobUrl;
  let utils = {
    readFile(ref) {
      return new Promise((resolve, reject) => {
        if (typeof ref === "string") {
          let xhr = new XMLHttpRequest();
          xhr.open("GET", ref, true);
          xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
              resolve(xhr.responseText);
            }
          });
          xhr.addEventListener("error", () => reject(xhr.status));
          xhr.send(null);
        } else {
          let reader = new FileReader();
          reader.addEventListener("load", () => resolve(reader.result));
          reader.addEventListener("error", () => reject(reader.error));
          reader.readAsText(ref);
        }
      });
    },
    getBlobURL(data, type = "text/plain") {
      let blob = data instanceof Blob ? data : new Blob([data], {type});
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      blobUrl = URL.createObjectURL(blob);
      return blobUrl;
    }
  };
  exports.default = utils;
});

})();
(function() {
var define = System.amdDefine;
define("file-processing.amd.js", ["exports", "./utils.amd.js", "./structure.amd.js"], function(exports, _utilsAmd, _structureAmd) {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  var _utilsAmd2 = _interopRequireDefault(_utilsAmd);
  var _structureAmd2 = _interopRequireDefault(_structureAmd);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
  }
  let formats = {};
  formats.hin = {
    parseMolecule(index, atomRecords, result) {
      let {atoms,
        bonds} = result,
          inc = atoms.length,
          spaceRE = /\s+/;
      for (let i = 0,
          len = atomRecords.length; i < len; i++) {
        let items = atomRecords[i].trim().split(spaceRE);
        atoms.push({
          el: items[3],
          x: +items[7],
          y: +items[8],
          z: +items[9],
          mol: index
        });
        for (let j = 11,
            cn = 2 * items[10] + 11; j < cn; j += 2) {
          if (items[j] - 1 > i) {
            bonds.push({
              iAtm: i + inc,
              jAtm: items[j] - 1 + inc,
              type: items[j + 1]
            });
          }
        }
      }
    },
    parse(fileStr) {
      let molRE = /\n\s*mol\s+(\d+)([\s\S]+)\n\s*endmol\s+\1/g,
          atmRE = /^atom\s+\d+\s+.+$/gm,
          result = {
            atoms: [],
            bonds: []
          },
          mol = molRE.exec(fileStr);
      while (mol) {
        this.parseMolecule(mol[1] - 1, mol[2].match(atmRE), result);
        mol = molRE.exec(fileStr);
      }
      return result;
    },
    make() {
      let atoms = _structureAmd2.default.structure.atoms;
      let molecules = [];
      for (let [index, {mol}] of atoms.entries()) {
        let molAtoms = molecules[mol] || (molecules[mol] = []);
        molAtoms[molAtoms.length] = index;
      }
      let nbors = new Array(atoms.length);
      for (let {type,
        iAtm,
        jAtm} of _structureAmd2.default.structure.bonds) {
        let iAtmIdx = molecules[atoms[iAtm].mol].indexOf(iAtm) + 1;
        let jAtmIdx = molecules[atoms[jAtm].mol].indexOf(jAtm) + 1;
        (nbors[iAtm] || (nbors[iAtm] = [])).push(`${jAtmIdx} ${type}`);
        (nbors[jAtm] || (nbors[jAtm] = [])).push(`${iAtmIdx} ${type}`);
      }
      let hin = ";The structure was saved in Nanothrower\nforcefield mm+\n";
      for (let [molIndex, mol] of molecules.entries()) {
        hin += `mol ${molIndex + 1}\n`;
        for (let [molAtomIndex, atomIndex] of mol.entries()) {
          let {el,
            x,
            y,
            z} = atoms[atomIndex];
          let nbor = nbors[atomIndex];
          hin += `atom ${molAtomIndex + 1} - ${el} ** - 0 ${x.toFixed(4)} ${y.toFixed(4)} ${z.toFixed(4)} ` + (nbor ? `${nbor.length} ${nbor.join(" ")}` : "0") + "\n";
        }
        hin += `endmol ${molIndex + 1}\n`;
      }
      return hin;
    }
  };
  formats.ml2 = formats.mol2 = {
    bondTypes: new Map([["s", "1"], ["d", "2"], ["t", "3"], ["a", "ar"]]),
    parseMolecule(index, atomRecords, bondRecords, result) {
      let {atoms,
        bonds} = result,
          inc = atoms.length,
          spaceRE = /\s+/;
      for (let rec of atomRecords) {
        let items = rec.trim().split(spaceRE);
        let dotPos = items[5].indexOf(".");
        atoms.push({
          el: dotPos > -1 ? items[5].slice(0, dotPos) : items[5],
          x: +items[2],
          y: +items[3],
          z: +items[4],
          mol: index
        });
      }
      for (let rec of bondRecords) {
        let items = rec.trim().split(spaceRE);
        let type = [...this.bondTypes].find((x) => x[1] === items[3]);
        bonds.push({
          iAtm: items[1] - 1 + inc,
          jAtm: items[2] - 1 + inc,
          type: type && type[0] || "s"
        });
      }
    },
    parse(fileStr) {
      let result = {
        atoms: [],
        bonds: []
      },
          molChunks = fileStr.split("@<TRIPOS>MOLECULE").slice(1),
          atomRE = /@<TRIPOS>ATOM([\s\S]+?)(?:@<TRIPOS>|$)/,
          bondRE = /@<TRIPOS>BOND([\s\S]+?)(?:@<TRIPOS>|$)/,
          newLineRE = /(?:\r?\n)+/,
          noRec = [];
      for (let [index, chunk] of molChunks.entries()) {
        let atomSection = chunk.match(atomRE);
        let atomRecords = atomSection && atomSection[1].trim().split(newLineRE) || noRec;
        let bondSection = chunk.match(bondRE);
        let bondRecords = bondSection && bondSection[1].trim().split(newLineRE) || noRec;
        this.parseMolecule(index, atomRecords, bondRecords, result);
      }
      return result;
    },
    make() {
      let atoms = _structureAmd2.default.structure.atoms;
      let molecules = [];
      for (let [index, {mol}] of atoms.entries()) {
        let molAtoms = molecules[mol] || (molecules[mol] = []);
        molAtoms[molAtoms.length] = index;
      }
      let nbors = {};
      for (let {type,
        iAtm,
        jAtm} of _structureAmd2.default.structure.bonds) {
        let iAtmIdx = molecules[atoms[iAtm].mol].indexOf(iAtm) + 1;
        let jAtmIdx = molecules[atoms[jAtm].mol].indexOf(jAtm) + 1;
        (nbors[iAtm] || (nbors[iAtm] = [])).push(`${iAtmIdx} ${jAtmIdx} ${this.bondTypes.get(type) || 1}`);
      }
      let ml2 = "# The structure was saved in Nanothrower\n";
      for (let mol of molecules) {
        ml2 += `@<TRIPOS>MOLECULE\n****\n${mol.length} %BOND_COUNT%\nSMALL\nNO_CHARGES\n\n\n@<TRIPOS>ATOM\n`;
        let bondRecs = [];
        for (let [molAtomIndex, atomIndex] of mol.entries()) {
          let {el,
            x,
            y,
            z} = atoms[atomIndex];
          ml2 += `${molAtomIndex + 1} ${el} ${x.toFixed(4)} ${y.toFixed(4)} ${z.toFixed(4)} ${el} 1 **** 0.0000\n`;
          if (nbors[atomIndex]) {
            bondRecs.push(...nbors[atomIndex]);
          }
        }
        ml2 = ml2.replace("%BOND_COUNT%", bondRecs.length.toString());
        ml2 += "@<TRIPOS>BOND\n";
        for (let [bondIndex, bondRec] of bondRecs.entries()) {
          ml2 += `${bondIndex + 1} ${bondRec}\n`;
        }
        ml2 += "@<TRIPOS>SUBSTRUCTURE\n1 **** 0\n";
      }
      return ml2;
    }
  };
  formats.xyz = {
    parseAtomRecord(atomStr) {
      let items = atomStr.trim().split(/\s+/);
      return {
        el: items[0],
        x: +items[1],
        y: +items[2],
        z: +items[3]
      };
    },
    parse(fileStr) {
      let atomRecords = fileStr.split(/(?:\r?\n)+/).slice(2);
      return atomRecords && {
        atoms: atomRecords.map(this.parseAtomRecord, this),
        bonds: []
      };
    },
    make() {
      let xyz = _structureAmd2.default.structure.atoms.length + "\nThe structure was saved in Nanothrower";
      for (let {el,
        x,
        y,
        z} of _structureAmd2.default.structure.atoms) {
        xyz += `\n${el} ${x.toFixed(5)} ${y.toFixed(5)} ${z.toFixed(5)}`;
      }
      return xyz;
    }
  };
  formats.json = {
    parse(fileStr) {
      return JSON.parse(fileStr);
    },
    make() {
      return JSON.stringify(_structureAmd2.default.structure, null, 2);
    }
  };
  exports.default = {
    load(fileRef) {
      return _utilsAmd2.default.readFile(fileRef).then((contents) => {
        let name = fileRef.name || String(fileRef),
            type = name.slice(name.lastIndexOf(".") + 1).toLowerCase(),
            format = formats[type] || formats.hin,
            newStructure = format.parse(contents);
        newStructure.name = name.replace(/.*[\/\\]/, "") || "unknown";
        _structureAmd2.default.overwrite(newStructure);
        return contents;
      });
    },
    makeFile(type) {
      let format = formats[type.toLowerCase()];
      return format ? format.make() : false;
    }
  };
});

})();
(function() {
var define = System.amdDefine;
define("components/menu.amd.js", ["exports", "jquery", "../eventful.amd.js", "../app.amd.js", "../file-processing.amd.js"], function(exports, _jquery, _eventfulAmd, _appAmd, _fileProcessingAmd) {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  var _jquery2 = _interopRequireDefault(_jquery);
  var _eventfulAmd2 = _interopRequireDefault(_eventfulAmd);
  var _appAmd2 = _interopRequireDefault(_appAmd);
  var _fileProcessingAmd2 = _interopRequireDefault(_fileProcessingAmd);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
  }
  let disabled;
  let menu = Object.assign(new _eventfulAmd2.default(".nt-menu"), {
    handleAppStateChange(busy) {
      this.disabled = busy;
    },
    handleGlobalClick(e) {
      if (this.disabled) {
        return;
      }
      let $target = (0, _jquery2.default)(e.target);
      let $popups = this.$el.find("menu.expanded");
      if ($target.is(".nt-menu button[menu]")) {
        let $targetPopup = (0, _jquery2.default)("#" + $target.attr("menu")).toggleClass("expanded");
        if ($targetPopup.hasClass("expanded")) {
          this.setItemStates();
        }
        $popups = $popups.not($targetPopup);
      }
      $popups.removeClass("expanded");
    },
    handleHover(e) {
      if (this.disabled) {
        return;
      }
      let $expandedMenu = this.$el.find("menu.expanded");
      if ($expandedMenu.length) {
        let $targetMenu = (0, _jquery2.default)(e.target).siblings("menu");
        if (!$expandedMenu.is($targetMenu)) {
          $expandedMenu.removeClass("expanded");
          $targetMenu.addClass("expanded");
        }
      }
    },
    handleAction(e) {
      let action = (0, _jquery2.default)(e.target).data("action");
      if (action === "load") {
        (0, _jquery2.default)("#nt-file").trigger("click");
      } else {
        _appAmd2.default.execAction(action);
      }
    },
    handleFile(e) {
      _appAmd2.default.execAction("load", e.target.files[0]);
    },
    setItemStates(action) {
      let $items = this.$el.find("menuitem[data-action]");
      if (action) {
        $items = $items.filter(`[data-action="${action}"]`);
      }
      let actionStates = _appAmd2.default.getActionStates();
      $items.each((idx, item) => {
        let state = actionStates.get(item.getAttribute("data-action")),
            disabled = item.hasAttribute("disabled");
        if (state && disabled) {
          item.removeAttribute("disabled");
        } else if (!state && !disabled) {
          item.setAttribute("disabled", "disabled");
        }
      });
    }
  });
  Object.defineProperty(menu, "disabled", {
    enumerable: true,
    get() {
      return disabled;
    },
    set(state) {
      disabled = !!state;
      this.$el.toggleClass("nt-disabled", !!disabled);
      if (disabled) {
        this.$el.find("menu.expanded").removeClass("expanded");
      }
    }
  });
  menu.listen([{
    type: "app:stateChange",
    owner: _appAmd2.default,
    handler: "handleAppStateChange"
  }, {
    type: "click",
    owner: document,
    handler: "handleGlobalClick"
  }, {
    type: "mouseenter",
    owner: ".nt-menu",
    filter: "button[menu]",
    handler: "handleHover"
  }, {
    type: "click",
    owner: ".nt-menu",
    filter: "menuitem[data-action]",
    handler: "handleAction"
  }, {
    type: "change",
    owner: "#nt-file",
    handler: "handleFile"
  }]);
  menu.disabled = _appAmd2.default.busy;
  exports.default = menu;
  _appAmd2.default.addAction("load", {
    get enabled() {
      return true;
    },
    exec(file) {
      if (file) {
        _fileProcessingAmd2.default.load(file).then(() => _appAmd2.default.trigger("app:structure:loaded"));
      }
    }
  });
});

})();
(function() {
var define = System.amdDefine;
define("eventful.amd.js", ["exports", "./observer.amd.js", "jquery"], function(exports, _observerAmd, _jquery) {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  var _observerAmd2 = _interopRequireDefault(_observerAmd);
  var _jquery2 = _interopRequireDefault(_jquery);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
  }
  function to$(target) {
    return target && target.jquery ? target : (0, _jquery2.default)(target);
  }
  exports.default = class {
    constructor($el) {
      this.$el = to$($el);
    }
    listen(config) {
      for (let {type,
        owner,
        filter,
        handler} of config) {
        let handlerFn = typeof handler === "function" ? handler : this[handler];
        if (owner instanceof _observerAmd2.default) {
          owner.on(type, handlerFn.bind(this));
        } else {
          to$(owner || this.$el).on(type, filter || null, handlerFn.bind(this));
        }
      }
    }
  };
});

})();
(function() {
var define = System.amdDefine;
define("cacheable.amd.js", ["exports"], function(exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  let cacheRegistry = new WeakMap();
  exports.default = class {
    constructor(createFn) {
      Object.defineProperty(this, "create", {
        configurable: true,
        value: createFn
      });
      cacheRegistry.set(this, new Map());
    }
    get(item) {
      let cache = cacheRegistry.get(this);
      if (!cache.has(item)) {
        cache.set(item, this.create(item));
      }
      return cache.get(item);
    }
    renew(item) {
      cacheRegistry.get(this).delete(item);
    }
  };
});

})();
(function() {
var define = System.amdDefine;
define("draw.amd.js", ["exports", "three", "./cacheable.amd.js", "./structure.amd.js"], function(exports, _three, _cacheableAmd, _structureAmd) {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  var THREE = _interopRequireWildcard(_three);
  var _cacheableAmd2 = _interopRequireDefault(_cacheableAmd);
  var _structureAmd2 = _interopRequireDefault(_structureAmd);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
  }
  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};
      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key))
            newObj[key] = obj[key];
        }
      }
      newObj.default = obj;
      return newObj;
    }
  }
  let colors = new _cacheableAmd2.default((color) => new THREE.Color(color));
  let presets = Object.create({
    get(el) {
      return this.hasOwnProperty(el) ? this[el] : this._def;
    },
    set(el, value) {
      if (this.hasOwnProperty(el)) {
        Object.assign(this[el], value);
      } else {
        this[el] = Object.assign({}, this._def, value);
      }
    }
  }, {_def: {value: Object.freeze({
        color: 0xFFFFFF,
        radius: 1
      })}});
  presets.set("C", {color: 0xFF0000});
  presets.set("H", {radius: 0.7});
  let pointMaterials = new _cacheableAmd2.default((atom) => {
    let preset = presets.get(atom);
    return new THREE.PointsMaterial({
      color: preset.color,
      sizeAttenuation: false
    });
  });
  let atomMaterials = new _cacheableAmd2.default((atom) => {
    let preset = presets.get(atom);
    return new THREE.MeshLambertMaterial({color: preset.color});
  });
  let atomGeometries = new _cacheableAmd2.default((atom) => {
    let preset = presets.get(atom);
    return new THREE.SphereGeometry(preset.radius);
  });
  let bondMaterials = new _cacheableAmd2.default((type) => {
    if (type === "extra") {
      return new THREE.LineDashedMaterial({
        dashSize: 0.2,
        gapSize: 0.1,
        vertexColors: THREE.VertexColors
      });
    } else {
      return new THREE.LineBasicMaterial({vertexColors: THREE.VertexColors});
    }
  });
  let canvas;
  let assets3;
  let rotation = 0;
  let draw = {
    setup(canvasEl) {
      canvas = {
        el: canvasEl,
        width: canvasEl.offsetWidth,
        height: canvasEl.offsetHeight
      };
      assets3 = {
        scene: new THREE.Scene(),
        group: new THREE.Object3D(),
        camera: new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000),
        spotLight: new THREE.SpotLight(0xFFFFFF),
        renderer: new THREE.WebGLRenderer({canvas: canvasEl})
      };
      assets3.spotLight.position.set(-40, 60, 50);
      assets3.scene.add(assets3.group, assets3.spotLight);
      assets3.camera.position.x = 0;
      assets3.camera.position.y = 0;
      assets3.camera.position.z = 20;
      assets3.camera.lookAt(assets3.scene.position);
      assets3.renderer.setClearColor(0x000000);
      assets3.renderer.setSize(canvas.width, canvas.height);
      assets3.renderer.render(assets3.scene, assets3.camera);
    },
    get canvas() {
      return canvas.el;
    },
    get rotation() {
      return rotation;
    },
    set rotation(value) {
      if (value !== rotation && Number.isFinite(value)) {
        rotation = value;
        assets3.group.rotation.y += (rotation - assets3.group.rotation.y) * 0.05;
      }
    },
    appearance: "graph",
    zoom(delta) {
      assets3.camera.position.z += delta;
      assets3.camera.lookAt(assets3.scene.position);
      this.update();
    },
    resize(width = canvas.el.offsetWidth, height = canvas.el.offsetHeight) {
      if (width > 0 && height > 0 && (width !== canvas.width || height !== canvas.height)) {
        assets3.camera.aspect = width / height;
        assets3.camera.updateProjectionMatrix();
        assets3.renderer.setSize(width, height, false);
        canvas.width = width;
        canvas.height = height;
        this.update();
      }
    },
    render() {
      this.resetScene();
      this.update();
    },
    update() {
      assets3.renderer.render(assets3.scene, assets3.camera);
      if (this.autoUpdate) {
        requestAnimationFrame(() => this.update());
      }
    },
    getAtomColor(el) {
      return presets.get(el).color;
    },
    setAtomColors(colors) {
      for (let [el, color] of colors) {
        if (this.getAtomColor(el) !== color) {
          presets.set(el, {color});
          atomMaterials.renew(el);
          pointMaterials.renew(el);
        }
      }
    },
    setBgColor(color) {
      if (typeof color === "string") {
        color = Number(color.replace("#", "0x"));
      }
      assets3.renderer.setClearColor(color);
    },
    clearScene() {
      let group = assets3.group;
      let child = group.children[0];
      while (child) {
        group.remove(child);
        child = group.children[0];
      }
    },
    resetScene() {
      this.clearScene();
      if (this.appearance === "spheres") {
        this.addSceneAtoms();
      } else if (_structureAmd2.default.structure.bonds.length) {
        this.addSceneBonds();
      } else {
        this.addScenePoints();
      }
    },
    addSceneAtoms() {
      let Mesh = THREE.Mesh,
          group = assets3.group;
      for (let {el,
        x,
        y,
        z} of _structureAmd2.default.structure.atoms) {
        let atom3 = new Mesh(atomGeometries.get(el), atomMaterials.get(el));
        atom3.position.x = x;
        atom3.position.y = y;
        atom3.position.z = z;
        group.add(atom3);
      }
    },
    addSceneBonds() {
      let Line = THREE.Line,
          Vector3 = THREE.Vector3,
          group = assets3.group,
          atoms = _structureAmd2.default.structure.atoms,
          bindMap = new Int8Array(atoms.length);
      for (let {type,
        iAtm,
        jAtm} of _structureAmd2.default.structure.bonds) {
        bindMap[iAtm] = bindMap[jAtm] = 1;
        let bondGeometry = new THREE.Geometry();
        let atom = atoms[iAtm];
        bondGeometry.vertices.push(new Vector3(atom.x, atom.y, atom.z));
        bondGeometry.colors.push(colors.get(presets.get(atom.el).color));
        atom = atoms[jAtm];
        bondGeometry.vertices.push(new Vector3(atom.x, atom.y, atom.z));
        bondGeometry.colors.push(colors.get(presets.get(atom.el).color));
        if (type === "x") {
          bondGeometry.computeLineDistances();
          group.add(new Line(bondGeometry, bondMaterials.get("extra"), THREE.LineStrip));
        } else {
          group.add(new Line(bondGeometry, bondMaterials.get("basic")));
        }
      }
      let Points = THREE.Points;
      let i = bindMap.indexOf(0);
      while (i !== -1) {
        let pointGeometry = new THREE.Geometry();
        let atom = atoms[i];
        pointGeometry.vertices.push(new Vector3(atom.x, atom.y, atom.z));
        group.add(new Points(pointGeometry, pointMaterials.get(atom.el)));
        i = bindMap.indexOf(0, i + 1);
      }
    },
    addScenePoints() {
      let Points = THREE.Points,
          Vector3 = THREE.Vector3,
          group = assets3.group;
      for (let {el,
        x,
        y,
        z} of _structureAmd2.default.structure.atoms) {
        let pointGeometry = new THREE.Geometry();
        pointGeometry.vertices.push(new Vector3(x, y, z));
        group.add(new Points(pointGeometry, pointMaterials.get(el)));
      }
    },
    addAxes() {
      if (!this.axes) {
        this.axes = new THREE.AxisHelper(20);
        assets3.scene.add(this.axes);
        this.update();
      }
    },
    removeAxes() {
      if (this.axes) {
        assets3.scene.remove(this.axes);
        this.axes = undefined;
        this.update();
      }
    },
    addWireSphere({cx,
      cy,
      cz,
      r,
      color = 0xFFFFFF}) {
      let sphere = this.wireSphere;
      if (!sphere) {
        sphere = this.wireSphere = new THREE.Mesh(new THREE.SphereGeometry(r, 15, 15), new THREE.MeshBasicMaterial({
          color,
          wireframe: true
        }));
        sphere.position.x = cx;
        sphere.position.y = cy;
        sphere.position.z = cz;
        assets3.scene.add(sphere);
        this.update();
      }
    },
    removeWireSphere() {
      if (this.wireSphere) {
        assets3.scene.remove(this.wireSphere);
        this.wireSphere = undefined;
        this.update();
      }
    }
  };
  exports.default = draw;
  _structureAmd2.default.on("updateStructure", draw.render.bind(draw));
});

})();
(function() {
var define = System.amdDefine;
define("observer.amd.js", ["exports"], function(exports) {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  let handlerRegistry = new WeakMap();
  class Observer {
    constructor() {
      handlerRegistry.set(this, new Map());
    }
    static on(...params) {
      return Observer.prototype.on.apply(Observer, params);
    }
    static off(...params) {
      return Observer.prototype.off.apply(Observer, params);
    }
    static trigger(...params) {
      return Observer.prototype.trigger.apply(Observer, params);
    }
    on(event, handler) {
      let handlers = handlerRegistry.get(this);
      if (!handlers.has(event)) {
        handlers.set(event, []);
      }
      handlers.get(event).push(handler);
    }
    off(event, handler) {
      let handlers = handlerRegistry.get(this);
      if (!handlers.has(event)) {
        return;
      }
      if (handler) {
        let eventHandlers = handlers.get(event);
        let handlerIndex = eventHandlers.indexOf(handler);
        if (handlerIndex > -1) {
          eventHandlers.splice(handlerIndex, 1);
          if (eventHandlers.length === 0) {
            handlers.delete(event);
          }
        }
      } else {
        handlers.get(event).length = 0;
        handlers.delete(event);
      }
    }
    trigger(event, ...params) {
      let handlers = handlerRegistry.get(this);
      if (handlers.has(event)) {
        for (let handler of handlers.get(event)) {
          handler.apply(null, params);
        }
      }
    }
  }
  handlerRegistry.set(Observer, new Map());
  exports.default = Observer;
});

})();
(function() {
var define = System.amdDefine;
define("app.amd.js", ["exports", "./observer.amd.js"], function(exports, _observerAmd) {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  var _observerAmd2 = _interopRequireDefault(_observerAmd);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
  }
  let actionStore = new Map();
  let app = Object.assign(new _observerAmd2.default(), {
    addAction(name, action) {
      actionStore.set(name, action);
    },
    execAction(name, ...params) {
      if (!this.actionEnabled(name)) {
        throw new Error(`Action "${name}" is disabled and can't be executed`);
      }
      return actionStore.get(name).exec(...params);
    },
    actionEnabled(name) {
      return !this.busy && actionStore.get(name).enabled;
    },
    getActionStates() {
      let busy = this.busy;
      let states = new Map();
      for (let [name, action] of actionStore) {
        states.set(name, !busy && action.enabled);
      }
      return states;
    }
  });
  let busyCount = 0;
  Object.defineProperty(app, "busy", {
    configurable: true,
    enumerable: true,
    get() {
      return busyCount > 0;
    },
    set(value) {
      let busyAnte = this.busy;
      if (busyAnte || value) {
        busyCount += value ? 1 : -1;
        let busy = this.busy;
        if (busyAnte !== busy) {
          this.trigger("app:stateChange", busy);
        }
      }
    }
  });
  exports.default = app;
});

})();
(function() {
var define = System.amdDefine;
define("worker.amd.js", ["exports", "./observer.amd.js", "./app.amd.js"], function(exports, _observerAmd, _appAmd) {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  var _observerAmd2 = _interopRequireDefault(_observerAmd);
  var _appAmd2 = _interopRequireDefault(_appAmd);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
  }
  let worker = new Worker("js/rr-worker.js");
  let blockingMethod = null;
  let workerHelper = Object.assign(new _observerAmd2.default(), {invoke(method, data) {
      if (blockingMethod) {
        throw new Error(`Unable to run the method “${method}” as the blocking method “${blockingMethod}” is still running`);
      }
      blockingMethod = method;
      _appAmd2.default.busy = true;
      worker.postMessage({
        method,
        data
      });
    }});
  worker.addEventListener("message", ({data: {method,
      data} = {}}) => {
    if (method) {
      if (method === blockingMethod) {
        _appAmd2.default.busy = false;
        blockingMethod = null;
      }
      workerHelper.trigger(method, data);
    }
  });
  worker.addEventListener("error", (e) => {
    throw e;
  });
  exports.default = workerHelper;
});

})();
(function() {
var define = System.amdDefine;
define("structure.amd.js", ["exports", "./observer.amd.js", "./worker.amd.js"], function(exports, _observerAmd, _workerAmd) {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  var _observerAmd2 = _interopRequireDefault(_observerAmd);
  var _workerAmd2 = _interopRequireDefault(_workerAmd);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
  }
  let structure = {
    name: "",
    atoms: [],
    bonds: []
  };
  let atomSet = new Set();
  let pairSet = new Set();
  let structureUtils = Object.assign(new _observerAmd2.default(), {
    getPairList(type) {
      switch (type) {
        case "basic":
          return [...pairSet].filter((pair) => !pair.startsWith("x-"));
        case "extra":
          return [...pairSet].filter((pair) => pair.startsWith("x-"));
        default:
          return [...pairSet];
      }
    },
    getPairSet(type) {
      return new Set(this.getPairList(type));
    },
    getAtomList() {
      return [...atomSet];
    },
    getAtomSet() {
      return new Set(this.getAtomList());
    },
    overwrite(newStructure, rescanAtoms = true) {
      ({name: structure.name = "",
        atoms: structure.atoms = [],
        bonds: structure.bonds = []} = newStructure);
      if (rescanAtoms !== false) {
        atomSet = new Set(structure.atoms.map((atom) => atom.el));
        let atomList = this.getAtomList();
        let pairList = [];
        for (let [i, el] of atomList.entries()) {
          pairList.push(...atomList.slice(i).map((elem) => el + elem));
        }
        pairList.push(...pairList.map((pair) => `x-${pair}`));
        pairSet = new Set(pairList);
      }
      this.trigger("updateStructure", rescanAtoms !== false);
    },
    getCentroid() {
      let result = {
        x: 0,
        y: 0,
        z: 0
      };
      for (let {x,
        y,
        z} of structure.atoms) {
        result.x += x;
        result.y += y;
        result.z += z;
      }
      let atomCount = structure.atoms.length;
      result.x /= atomCount;
      result.y /= atomCount;
      result.z /= atomCount;
      return result;
    },
    getWrappingSphere() {
      let {x: cx,
        y: cy,
        z: cz} = this.getCentroid(),
          sqrRadius = 0;
      for (let {x,
        y,
        z} of structure.atoms) {
        let sqrDist = (x - cx) * (x - cx) + (y - cy) * (y - cy) + (z - cz) * (z - cz);
        if (sqrDist > sqrRadius) {
          sqrRadius = sqrDist;
        }
      }
      return {
        cx,
        cy,
        cz,
        r: Math.sqrt(sqrRadius)
      };
    },
    translate(x, y, z) {
      let center = this.getCentroid(),
          dx = x - center.x,
          dy = y - center.y,
          dz = z - center.z;
      for (let atom of structure.atoms) {
        atom.x += dx;
        atom.y += dy;
        atom.z += dz;
      }
      this.overwrite(structure, false);
    },
    rotate(angle, axis) {
      let axis2 = axis === "x" ? "y" : "x",
          axis3 = axis === "z" ? "y" : "z",
          sine = Math.sin(angle),
          cosine = Math.cos(angle);
      for (let atom of structure.atoms) {
        let coord2 = atom[axis2];
        let coord3 = atom[axis3];
        atom[axis2] = coord2 * cosine + coord3 * sine;
        atom[axis3] = coord3 * cosine - coord2 * sine;
      }
      this.overwrite(structure, false);
    }
  });
  Object.defineProperty(structureUtils, "structure", {
    enumerable: true,
    get() {
      return structure;
    }
  });
  exports.default = structureUtils;
  _workerAmd2.default.on("updateStructure", (updatedStructure) => structureUtils.overwrite(updatedStructure));
});

})();
(function() {
var define = System.amdDefine;
define("components/view.amd.js", ["exports", "../eventful.amd.js", "../app.amd.js", "../draw.amd.js", "../structure.amd.js"], function(exports, _eventfulAmd, _appAmd, _drawAmd, _structureAmd) {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  var _eventfulAmd2 = _interopRequireDefault(_eventfulAmd);
  var _appAmd2 = _interopRequireDefault(_appAmd);
  var _drawAmd2 = _interopRequireDefault(_drawAmd);
  var _structureAmd2 = _interopRequireDefault(_structureAmd);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
  }
  let view = Object.assign(new _eventfulAmd2.default("#nt-view"), {
    rotData: {
      startX: 0,
      startRot: 0
    },
    handleDragEnterOver(e) {
      e.preventDefault();
      if (e.type === "dragenter") {
        e.currentTarget.classList.add("nt-droppable");
      }
    },
    handleDragLeave(e) {
      e.preventDefault();
      if (e.target === e.currentTarget) {
        e.target.classList.remove("nt-droppable");
      }
    },
    handleDrop(e) {
      let dt = e.originalEvent.dataTransfer,
          files = dt && dt.files;
      if (files && files.length) {
        e.preventDefault();
        _appAmd2.default.execAction("load", files[0]);
      }
      e.currentTarget.classList.remove("nt-droppable");
    },
    handleWheelZoom(e) {
      _drawAmd2.default.zoom(e.originalEvent.deltaY < 0 ? 5 : -5);
      e.preventDefault();
    },
    handleStartRotate(e) {
      this.rotData.startX = e.pageX;
      this.rotData.startRot = _drawAmd2.default.rotation;
      this.$el.on("mouseup.ntViewRotation mouseleave.ntViewRotation", this.handleStopRotate.bind(this)).on("mousemove.ntViewRotation", this.handleRotate.bind(this));
      _drawAmd2.default.autoUpdate = true;
      _drawAmd2.default.update();
    },
    handleStopRotate() {
      _drawAmd2.default.autoUpdate = false;
      this.$el.off(".ntViewRotation");
    },
    handleRotate(e) {
      _drawAmd2.default.rotation = this.rotData.startRot + (e.pageX - this.rotData.startX) * 0.02;
    },
    handleWndResize() {
      if (!this._resizeTimer) {
        this._resizeTimer = setTimeout(() => {
          _drawAmd2.default.resize();
          this._resizeTimer = undefined;
        }, 300);
      }
    },
    handleDblClick() {
      let sphere = _structureAmd2.default.getWrappingSphere();
      _drawAmd2.default.addWireSphere(sphere.cx, sphere.cy, sphere.cz, sphere.r);
    }
  });
  view.listen([{
    type: "dragenter dragover",
    handler: "handleDragEnterOver"
  }, {
    type: "dragleave",
    handler: "handleDragLeave"
  }, {
    type: "drop",
    handler: "handleDrop"
  }, {
    type: "wheel",
    handler: "handleWheelZoom"
  }, {
    type: "mousedown",
    handler: "handleStartRotate"
  }, {
    type: "resize",
    owner: window,
    handler: "handleWndResize"
  }, {
    type: "dblclick",
    handler: "handleDblClick"
  }]);
  _drawAmd2.default.setup(view.$el.children("canvas")[0]);
  exports.default = view;
});

})();
(function() {
var define = System.amdDefine;
define("interface.amd.js", ["./structure.amd.js", "./app.amd.js", "./components/save.amd.js", "./components/transform.amd.js", "./components/rnd-rain.amd.js", "./components/appearance.amd.js", "./components/menu.amd.js", "./components/view.amd.js"], function(_structureAmd, _appAmd) {
  "use strict";
  var _structureAmd2 = _interopRequireDefault(_structureAmd);
  var _appAmd2 = _interopRequireDefault(_appAmd);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
  }
  _appAmd2.default.on("app:structure:loaded", () => {
    document.title = `${_structureAmd2.default.structure.name} - Nanothrower`;
  });
  _appAmd2.default.on("app:stateChange", (busy) => {
    document.body.classList.toggle("app-busy", busy);
    if (!busy) {
      document.getElementById("nt-progress").innerHTML = "";
    }
  });
  _appAmd2.default.on("app:progress", (progress) => {
    document.getElementById("nt-progress").innerHTML = Math.round(progress) + "%";
  });
});

})();