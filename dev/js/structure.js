import Observer from "./observer.js";
import worker from "./worker.js";

/**
 * An atom record in a structure
 * @typedef {Object} Atom
 * @property {String} el - Element
 * @property {Number} x - X-coordinate of an atom
 * @property {Number} y - Y-coordinate of an atom
 * @property {Number} z - Z-coordinate of an atom
 * @property {Number} mol - Index of a molecule an atom belongs to
 */

/**
 * A bond record in a structure's bond registry
 * @typedef {Object} Bond
 * @property {Number} iAtm - The bond's first atom index in the `atoms` array
 * @property {Number} jAtm - The bond's second atom index in the `atoms` array
 * @property {String} type - Bond type (e.g. "s" for single bond, "a" for aromatic, "x" for extra)
 */

/**
 * Current structure data
 * @typedef {Object} Structure
 * @property {String} name - The name of a structure
 * @property {Array.<Atom>} atoms - Atom list
 * @property {Array.<Bond>} bonds - Bond list
 */

/**
 * @type {Structure}
 */
let structure = {
    name: "",
    atoms: [],
    bonds: []
};

let atomSet = new Set();
let pairSet = new Set();

let structureUtils = Object.assign(new Observer(), {
    /**
     * Get a list of all possible (chemically bound or not) atomic pairs for the current structure
     * @param {String} [type] Pairs of which graph type to return: basic, extra, or both
     * @returns {Array}
     */
    getPairList(type) {
        switch (type) {
            case "basic":
                return [...pairSet].filter(pair => !pair.startsWith("x-"));
            case "extra":
                return [...pairSet].filter(pair => pair.startsWith("x-"));
            default:
                return [...pairSet];
        }
    },

    getPairSet(type) {
        return new Set(this.getPairList(type));
    },

    /**
     * Get a list of all chemical elements present in the current structure
     * @returns {Array}
     */
    getAtomList() {
        return [...atomSet];
    },

    getAtomSet() {
        return new Set(this.getAtomList());
    },

    /**
     * Completely overwrites the `structure` object. Call this method when a new file is opened,
     * or when the structure needs to be updated according the result of a worker calculations
     * @param {Object} newStructure
     * @param {Boolean} [rescanAtoms] Pass `false` to prevent `atomSet` and `pairSet` update.
     * By default they are updated as well
     */
    overwrite(newStructure, rescanAtoms = true) {
        ({name: structure.name = "", atoms: structure.atoms = [], bonds: structure.bonds = []} = newStructure);
        if (rescanAtoms !== false) {
            atomSet = new Set(structure.atoms.map(atom => atom.el));
            let atomList = this.getAtomList();
            let pairList = [];
            for (let [i, el] of atomList.entries()) {
                pairList.push(...atomList.slice(i).map(elem => el + elem));
            }
            // Add extra-graph pairs
            pairList.push(...pairList.map(pair => `x-${pair}`));
            pairSet = new Set(pairList);
        }
        this.trigger("updateStructure", rescanAtoms !== false);
    },

    getCentroid() {
        let result = {x: 0, y: 0, z: 0};
        for (let {x, y, z} of structure.atoms) {
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
        let {x: cx, y: cy, z: cz} = this.getCentroid(),
            sqrRadius = 0;
        for (let {x, y, z} of structure.atoms) {
            let sqrDist = (x - cx) * (x - cx) + (y - cy) * (y - cy) + (z - cz) * (z - cz);
            if (sqrDist > sqrRadius) {
                sqrRadius = sqrDist;
            }
        }
        return {cx, cy, cz, r: Math.sqrt(sqrRadius)};
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
        let axis2 = (axis === "x") ? "y" : "x",
            axis3 = (axis === "z") ? "y" : "z",
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
        return structure; // not safe but fast… Freezing would result in performance degradation
    }
});

export default structureUtils;


worker.on("updateStructure", updatedStructure => structureUtils.overwrite(updatedStructure));