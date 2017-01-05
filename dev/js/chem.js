let atomicMasses = {
    H: 1.00794,
    H1: 1.00794,
    He: 4.002602,
    Li: 6.941,
    Be: 9.01218,
    B: 10.811,
    C: 12.011,
    N: 14.0067,
    O: 15.9994,
    F: 18.998403,
    Ne: 20.179,
    Na: 22.98977,
    Mg: 24.305,
    Al: 26.98154,
    Si: 28.0855,
    P: 30.97376,
    S: 32.066,
    Cl: 35.453,
    Ar: 39.948,
    K: 39.0983,
    Ca: 40.078,
    Sc: 44.95591,
    Ti: 47.88,
    V: 50.9415,
    Cr: 51.9961,
    Mn: 54.938,
    Fe: 55.847,
    Co: 58.9332,
    Ni: 58.69,
    Cu: 63.546,
    Zn: 65.39,
    Ga: 69.723,
    Ge: 72.59,
    As: 74.9216,
    Se: 78.96,
    Br: 79.904,
    Kr: 83.8,
    Rb: 85.4678,
    Sr: 87.62,
    Y: 88.9059,
    Zr: 91.224,
    Nb: 92.9064,
    Mo: 95.94,
    Tc: 97.9072,
    Ru: 101.07,
    Rh: 102.9055,
    Pd: 106.42,
    Ag: 107.8682,
    Cd: 112.41,
    In: 114.82,
    Sn: 118.71,
    Sb: 121.75,
    Te: 127.6,
    I: 126.9045,
    Xe: 131.29,
    Cs: 132.9054,
    Ba: 137.33,
    La: 138.9055,
    Ce: 140.12,
    Pr: 140.9077,
    Nd: 144.24,
    Pm: 144.9128,
    Sm: 150.36,
    Eu: 151.96,
    Gd: 157.25,
    Tb: 158.9254,
    Dy: 162.5,
    Ho: 164.9304,
    Er: 167.26,
    Tm: 168.9342,
    Yb: 173.04,
    Lu: 174.967,
    Hf: 178.49,
    Ta: 180.9479,
    W: 183.85,
    Re: 186.207,
    Os: 190.2,
    Ir: 192.22,
    Pt: 195.08,
    Au: 196.9665,
    Hg: 200.59,
    Tl: 204.383,
    Pb: 207.2,
    Bi: 208.9804,
    Po: 208.9824,
    At: 209.9871,
    Rn: 222.0176,
    Fr: 223.0197,
    Ra: 226.0254,
    Ac: 227.0278,
    Th: 232.0381,
    Pa: 231.0359,
    U: 238.0289,
    Np: 237.0482,
    Pu: 244.0642,
    Am: 243.0614,
    Cm: 247.0703,
    Bk: 247.0703,
    Cf: 251.0796,
    Es: 252.0828,
    Fm: 257.0951,
    Md: 258.0986,
    No: 259.1009,
    Lr: 260.1054,
    Rf: 261,
    Db: 262,
    Sg: 263,
    Bh: 262,
    Hs: 265,
    Mt: 266
};

export default {
    getAtomicMass(el) {
        return atomicMasses[el];
    },

    /**
     * Get number of atoms of the given element in the given structure
     * @param {Array.<Atom>} atoms - Atom list
     * @param {String} [el="H"] - Element
     * @returns {Number}
     */
    countAtoms(atoms, el = "H") {
        let count = 0;
        let elAlias = `${el}1`;
        for (let {el: currEl} of atoms) {
            if (currEl === el || currEl === elAlias) {
                count++;
            }
        }
        return count;
    },

    /**
     * Calculate mass concentration for a given element
     * @param {Array.<Atom>} atoms - Atom list
     * @param {String} [el="H"] - Element
     * @returns {Number}
     */
    getConcentration(atoms, el = "H") {
        let totalMass = 0;
        let elMass = 0;
        let elAlias = `${el}1`;
        for (let {el: currEl} of atoms) {
            let atomicMass = atomicMasses[currEl];
            totalMass += atomicMass;
            if (currEl === el || currEl === elAlias) {
                elMass += atomicMass;
            }
        }
        return elMass / totalMass;
    },

    /**
     * Calculate the number of atoms required to get the given mass concentration
     * @param {Array.<Atom>} atoms - Atom list
     * @param {Number} con - Mass concentration
     * @param {String} [el="H"] - Target element
     * @returns {Number}
     */
    conToNum(atoms, con, el = "H") {
        let restMass = 0;
        let elAlias = `${el}1`;
        for (let {el: currEl} of atoms) {
            if (currEl !== el && currEl !== elAlias) {
                restMass += atomicMasses[currEl];
            }
        }
        return Math.round(con * restMass / ((1 - con) * atomicMasses[el]));
    }
};