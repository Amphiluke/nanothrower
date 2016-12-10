import app from "../app.js";
import structure from "../structure.js";

let bnConvert = {
    convert() {
        let bnAtoms = JSON.parse(JSON.stringify(structure.structure.atoms));
        for (let {iAtm, jAtm} of structure.structure.bonds) {
            let iEl = bnAtoms[iAtm].el;
            let jEl = bnAtoms[jAtm].el;
            if (iEl === "C" && jEl === "C") {
                bnAtoms[iAtm].el = "B";
                bnAtoms[jAtm].el = "N";
            } else if (iEl === "C") {
                bnAtoms[iAtm].el = (jEl === "B") ? "N" : "B";
            } else if (jEl === "C") {
                bnAtoms[jAtm].el = (iEl === "B") ? "N" : "B";
            }
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