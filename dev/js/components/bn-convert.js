import app from "../app.js";
import structure from "../structure.js";

let bnConvert = {
    convert() {
        let atoms = structure.structure.atoms;
        let bnAtoms = new Array(atoms.length);
        for (let [index, atom] of atoms.entries()) {
            bnAtoms[index] = Object.assign({}, atom);
            bnAtoms[index].el = (index % 2) ? "B" : "N";
        }
        structure.overwrite(Object.assign({}, structure.structure, {atoms: bnAtoms}));
    }
};

app.addAction("bnConvert", {
    get enabled() {
        return structure.structure.atoms.length > 0;
    },
    exec() {
        bnConvert.convert();
    }
});