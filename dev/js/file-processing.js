import utils from "./utils.js";
import structure from "./structure.js";

let formats = {};

formats.hin = {
    /* HIN file syntax defines the atom record as follows:
    atom <at#> <atom-name> <element> <type> <flags> <at-charge> <x> <y> <z> <cn> <nbor# nbor-bond>
     0     1        2          3       4       5         6       7   8   9   10         11... */
    parseMolecule(index, atomRecords, result) {
        let {atoms, bonds} = result,
            inc = atoms.length, // total number of atoms added into the structure previously
            spaceRE = /\s+/;
        for (let i = 0, len = atomRecords.length; i < len; i++) {
            let items = atomRecords[i].trim().split(spaceRE);
            atoms.push({el: items[3], x: +items[7], y: +items[8], z: +items[9], mol: index});
            for (let j = 11, cn = 2 * items[10] + 11; j < cn; j += 2) {
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
            result = {atoms: [], bonds: []},
            mol = molRE.exec(fileStr);
        while (mol) {
            this.parseMolecule(mol[1] - 1, mol[2].match(atmRE), result);
            mol = molRE.exec(fileStr);
        }
        return result;
    },

    make() {
        let atoms = structure.structure.atoms;
        // Group existing atoms by their `mol` property
        let molecules = [];
        for (let [index, {mol}] of atoms.entries()) {
            let molAtoms = molecules[mol] || (molecules[mol] = []);
            molAtoms[molAtoms.length] = index;
        }

        // Get each atom's neighbours (in HIN format: <nbor# nbor-bond>)
        let nbors = new Array(atoms.length);
        for (let {type, iAtm, jAtm} of structure.structure.bonds) {
            // Use relative atom indices (w.r.t. a containing molecule)
            let iAtmIdx = molecules[atoms[iAtm].mol].indexOf(iAtm) + 1;
            let jAtmIdx = molecules[atoms[jAtm].mol].indexOf(jAtm) + 1;
            (nbors[iAtm] || (nbors[iAtm] = [])).push(`${jAtmIdx} ${type}`);
            (nbors[jAtm] || (nbors[jAtm] = [])).push(`${iAtmIdx} ${type}`);
        }

        let hin = ";The structure was saved in Nanothrower\nforcefield mm+\n";
        // Write mol records as required by the HIN format
        for (let [molIndex, mol] of molecules.entries()) {
            hin += `mol ${molIndex + 1}\n`;
            for (let [molAtomIndex, atomIndex] of mol.entries()) {
                let {el, x, y, z} = atoms[atomIndex];
                let nbor = nbors[atomIndex];
                hin += `atom ${molAtomIndex + 1} - ${el} ** - 0 ${x.toFixed(4)} ${y.toFixed(4)} ${z.toFixed(4)} ` +
                    (nbor ? `${nbor.length} ${nbor.join(" ")}` : "0") + "\n";
            }
            hin += `endmol ${molIndex + 1}\n`;
        }
        return hin;
    }
};

formats.ml2 = formats.mol2 = {
    // Map internal bond types to the SYBYL bond types used in MOL2
    bondTypes: new Map([["s", "1"], ["d", "2"], ["t", "3"], ["a", "ar"]]),

    /* MOL2 file syntax defines the atom record as follows:
    atom_id atom_name x y z atom_type [subst_id [subst_name [charge [status_bit]]]]
       0        1     2 3 4     5         6          7         8         9
    MOL2 file syntax defines the bond record as follows:
    bond_id origin_atom_id target_atom_id bond_type [status_bits]
       0          1              2            3           4 */
    parseMolecule(index, atomRecords, bondRecords, result) {
        let {atoms, bonds} = result,
            inc = atoms.length, // total number of atoms added into the structure previously
            spaceRE = /\s+/;
        for (let rec of atomRecords) {
            let items = rec.trim().split(spaceRE);
            let dotPos = items[5].indexOf("."); // atom_type may look like "C.3"
            atoms.push({
                el: (dotPos > -1) ? items[5].slice(0, dotPos) : items[5],
                x: +items[2],
                y: +items[3],
                z: +items[4],
                mol: index
            });
        }
        for (let rec of bondRecords) {
            let items = rec.trim().split(spaceRE);
            let type = [...this.bondTypes].find(x => x[1] === items[3]);
            bonds.push({
                iAtm: items[1] - 1 + inc,
                jAtm: items[2] - 1 + inc,
                type: type && type[0] || "s"
            });
        }
    },

    parse(fileStr) {
        let result = {atoms: [], bonds: []},
            molChunks = fileStr.split("@<TRIPOS>MOLECULE").slice(1),
            atomRE = /@<TRIPOS>ATOM([\s\S]+?)(?:@<TRIPOS>|$)/,
            bondRE = /@<TRIPOS>BOND([\s\S]+?)(?:@<TRIPOS>|$)/,
            newLineRE = /(?:\r?\n)+/,
            noRec = [];
        for (let [index, chunk] of molChunks.entries()) {
            let atomSection = chunk.match(atomRE);
            let atomRecords = (atomSection && atomSection[1].trim().split(newLineRE)) || noRec;
            let bondSection = chunk.match(bondRE);
            let bondRecords = (bondSection && bondSection[1].trim().split(newLineRE)) || noRec;
            this.parseMolecule(index, atomRecords, bondRecords, result);
        }
        return result;
    },

    make() {
        let atoms = structure.structure.atoms;
        // Group existing atoms by their `mol` property
        let molecules = [];
        for (let [index, {mol}] of atoms.entries()) {
            let molAtoms = molecules[mol] || (molecules[mol] = []);
            molAtoms[molAtoms.length] = index;
        }

        // Get each atom's neighbours (in MOL2 format: origin_atom_id target_atom_id bond_type)
        let nbors = {};
        for (let {type, iAtm, jAtm} of structure.structure.bonds) {
            // Use relative atom indices (w.r.t. a containing molecule)
            let iAtmIdx = molecules[atoms[iAtm].mol].indexOf(iAtm) + 1;
            let jAtmIdx = molecules[atoms[jAtm].mol].indexOf(jAtm) + 1;
            (nbors[iAtm] || (nbors[iAtm] = [])).push(`${iAtmIdx} ${jAtmIdx} ${this.bondTypes.get(type) || 1}`);
        }

        let ml2 = "# The structure was saved in Nanothrower\n";
        // Write MOLECULE records as required by the MOL2 format
        for (let mol of molecules) {
            ml2 += `@<TRIPOS>MOLECULE\n****\n${mol.length} %BOND_COUNT%\nSMALL\nNO_CHARGES\n\n\n@<TRIPOS>ATOM\n`;
            let bondRecs = [];
            for (let [molAtomIndex, atomIndex] of mol.entries()) {
                let {el, x, y, z} = atoms[atomIndex];
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
        let xyz = structure.structure.atoms.length + "\nThe structure was saved in Nanothrower";
        for (let {el, x, y, z} of structure.structure.atoms) {
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
        return JSON.stringify(structure.structure, null, 2);
    }
};


export default {
    load(fileRef) {
        return utils.readFile(fileRef).then(contents => {
            let name = fileRef.name || String(fileRef),
                type = name.slice(name.lastIndexOf(".") + 1).toLowerCase(),
                format = formats[type] || formats.hin,
                newStructure = format.parse(contents);
            newStructure.name = name.replace(/.*[\/\\]/, "") || "unknown";
            structure.overwrite(newStructure);
            return contents;
        });
    },

    makeFile(type) {
        let format = formats[type.toLowerCase()];
        return format ? format.make() : false;
    }
};