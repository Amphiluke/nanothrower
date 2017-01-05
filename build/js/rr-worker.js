"use strict";

/**
 * A point in space
 * @typedef {{x: Number, y: Number, z: Number}} Point
 */

/**
 * Sphere
 * @typedef {Object} Sphere
 * @property {Number} cx - X-coordinate of the sphere's center
 * @property {Number} cy - Y-coordinate of the sphere's center
 * @property {Number} cz - Z-coordinate of the sphere's center
 * @property {Number} r - Radius of the sphere
 */

/**
 * Simulation process settings
 * @typedef {Object} Settings
 * @property {String} mode - Feeding mode: either "sphere" or "hemisphere"
 * @property {Boolean} molecular - Use molecular hydrogen (true) or atomic (false)
 * @property {Boolean} biradical - Use hydrogen biradicals (only for the case of molecular=true)
 * @property {Number} rHH - Distance between H atoms in a molecule (only for the case of molecular=true)
 * @property {Number} hCount - A number of H atoms to be injected
 * @property {Sphere} sphere - Wrapping sphere parameters
 * @property {Map} captureDistances - Maps element names to maximum capture distances
 * @property {Structure} structure - Target working structure
 */

/**
 * @type {Settings}
 */
let settings;

let defaults = {
    mode: "sphere",
    molecular: true,
    biradical: true
};

let api = {
    run(data) {
        try {
            let checkStatus = core.applySettings(data);
            if (checkStatus !== true) {
                return checkStatus;
            }
        } catch (e) {
            return e.message;
        }
        return core.run();
    }
};

self.onmessage = function ({data: {method, data} = {}}) {
    if (typeof api[method] === "function") {
        self.postMessage({
            method,
            data: api[method](data)
        });
    }
};


let core = {
    applySettings(tempSettings) {
        tempSettings = Object.assign({}, defaults, tempSettings);
        if (!Number.isInteger(tempSettings.hCount) || tempSettings.hCount < 1) {
            return `A number of H atoms to be injected is incorrect: ${tempSettings.hCount}`;
        }
        if (!tempSettings.sphere || !tempSettings.sphere.r) {
            return "Wrapping sphere parameters are missed";
        }
        let distances = tempSettings.captureDistances;
        let missed = tempSettings.structure.atoms.find(atom => !distances.has(atom.el));
        if (missed) {
            return `Capture distance is not specified for ${missed.el}`;
        }
        settings = tempSettings;
        // Work with square distances whenever possible to avoid rooting in computations
        settings.sqrDistances = new Map([...distances].map(([el, dist]) => [el, dist * dist]));
        // Reset molecule counter to the latest molecule index
        settings.lastMol = settings.structure.atoms.reduce((last, atom) => Math.max(last, atom.mol), 0);
        return true;
    },

    run() {
        let {molecular, hCount, sphere, captureDistances, structure} = settings;
        let hemisphere = (settings.mode === "hemisphere");
        let currentHCount = 0;
        let progressMsg = {method: "progress", data: 0};
        while (currentHCount < hCount) {
            let startPt = this.getRndPointOnSphere(sphere);
            let endPt = this.getRndPointOnSphere(sphere);
            if (hemisphere) {
                startPt.z = Math.abs(startPt.z);
            }
            let atom = this.getCapturingAtom(startPt, endPt);
            if (!atom) {
                continue;
            }
            let captureSphere = {cx: atom.x, cy: atom.y, cz: atom.z, r: captureDistances.get(atom.el)};
            let stopPts = this.lineSphereCrossPoints(captureSphere, startPt, endPt);
            if (!stopPts) {
                continue;
            }
            let pt = this.sqrDistance(stopPts[0], startPt) < this.sqrDistance(stopPts[1], startPt) ? stopPts[0] : stopPts[1];
            if (molecular) {
                this.adhereHH(pt);
                currentHCount += 2;
            } else {
                this.adhereH(pt);
                currentHCount++;
            }
            progressMsg.data = 100 * currentHCount / hCount;
            self.postMessage(progressMsg);
        }
        return structure;
    },

    adhereH({x, y, z}) {
        settings.structure.atoms.push({el: "H", x: x, y: y, z: z, mol: ++settings.lastMol});
    },

    adhereHH({x, y, z}) {
        let mol = ++settings.lastMol;
        let h1Pt = this.getRndPointOnSphere({cx: x, cy: y, cz: z, r: settings.rHH / 2});
        let h2Pt = {x: 2 * x - h1Pt.x, y: 2 * y - h1Pt.y, z: 2 * z - h1Pt.z}; // diametrically opposite point
        let atomCount = settings.structure.atoms.push(
            {el: "H", x: h1Pt.x, y: h1Pt.y, z: h1Pt.z, mol},
            {el: settings.biradical ? "H1" : "H", x: h2Pt.x, y: h2Pt.y, z: h2Pt.z, mol}
        );
        settings.structure.bonds.push({iAtm: atomCount - 2, jAtm: atomCount - 1, type: "s"});
    },

    /**
     * Find an atom in the existing structure which will capture a particle moving along a line
     * @param {Point} startPt - The starting point of the particle movement
     * @param {Point} endPt - The destination point of the particle movement
     * @returns {Atom|null}
     */
    getCapturingAtom(startPt, endPt) {
        let sqrDistances = settings.sqrDistances;
        let capturingAtom = null;
        let capturingAtomDist = Infinity;
        for (let atom of settings.structure.atoms) {
            if (this.pointToLineSqrDistance(atom, startPt, endPt) <= sqrDistances.get(atom.el)) {
                let sqrDist = this.sqrDistance(atom, startPt);
                if (!capturingAtom || capturingAtomDist > sqrDist) {
                    capturingAtom = atom;
                    capturingAtomDist = sqrDist;
                }
            }
        }
        return capturingAtom;
    },

    /**
     * Convert spherical coordinates to Cartesian
     * @param {Number} r - Radius
     * @param {Number} theta - Inclination
     * @param {Number} phi - Azimuth
     * @returns {Point}
     */
    sphericalToCartesian(r, theta, phi) {
        let factor = r * Math.sin(theta);
        return {
            x: factor * Math.cos(phi),
            y: factor * Math.sin(phi),
            z: r * Math.cos(theta)
        };
    },

    /**
     * Calc square distance between two points
     * @param {Point} pt1
     * @param {Point} pt2
     * @returns {Number}
     */
    sqrDistance(pt1, pt2) {
        let dx = pt1.x - pt2.x;
        let dy = pt1.y - pt2.y;
        let dz = pt1.z - pt2.z;
        return dx * dx + dy * dy + dz * dz;
    },

    /**
     * Calc square distance from a point `pt` to a line defined by two points `linePt1` and `linePt1`
     * @param {Point} pt
     * @param {Point} linePt1
     * @param {Point} linePt2
     * @returns {Number}
     */
    pointToLineSqrDistance(pt, linePt1, linePt2) {
        let dirVector = [linePt2.x - linePt1.x, linePt2.y - linePt1.y, linePt2.z - linePt1.z];
        let ptPt2Vector = [pt.x - linePt2.x, pt.y - linePt2.y, pt.z - linePt2.z];
        let prodVector = [
            ptPt2Vector[1] * dirVector[2] - dirVector[1] * ptPt2Vector[2],
            ptPt2Vector[0] * dirVector[2] - dirVector[0] * ptPt2Vector[2],
            ptPt2Vector[0] * dirVector[1] - dirVector[0] * ptPt2Vector[1]
        ];
        return (prodVector[0] * prodVector[0] + prodVector[1] * prodVector[1] + prodVector[2] * prodVector[2]) /
            (dirVector[0] * dirVector[0] + dirVector[1] * dirVector[1] + dirVector[2] * dirVector[2]);
    },

    /**
     * Find cross points of a line and a sphere
     * @param {Sphere} sphere
     * @param {Point} linePt1
     * @param {Point} linePt2
     * @returns {Array.<Point>|null}
     */
    lineSphereCrossPoints({cx, cy, cz, r}, linePt1, linePt2) {
        let {x: bx, y: by, z: bz} = linePt1,
            kx = linePt2.x - bx,
            ky = linePt2.y - by,
            kz = linePt2.z - bz,
            mx = bx - cx,
            my = by - cy,
            mz = bz - cz,
            a = kx * kx + ky * ky + kz * kz,
            b = 2 * (kx * mx + ky * my + kz * mz),
            c = mx * mx + my * my + mz * mz - r * r,
            discriminant = b * b - 4 * a * c;
        if (discriminant < 0) {
            return null;
        }
        let rootDiscriminant = Math.sqrt(discriminant);
        let t1 = (-b + rootDiscriminant) / (2 * a);
        let t2 = (-b - rootDiscriminant) / (2 * a);
        return [
            {x: kx * t1 + bx, y: ky * t1 + by, z: kz * t1 + bz},
            {x: kx * t2 + bx, y: ky * t2 + by, z: kz * t2 + bz}
        ];
    },

    /**
     * Select a random point on the surface of a sphere
     * @param {Sphere} sphere
     * @returns {Point}
     */
    getRndPointOnSphere({cx, cy, cz, r}) {
        let point = this.sphericalToCartesian(r, Math.random() * Math.PI, Math.random() * 2 * Math.PI);
        point.x += cx;
        point.y += cy;
        point.z += cz;
        return point;
    }
};