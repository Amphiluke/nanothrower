let graphene = {
    create(settings) {
        return {
            name: "Graphene",
            atoms: this.makeAtoms(settings),
            bonds: this.makeBonds(settings)
        };
    },

    makeAtoms({width, height, rCC}) {
        let nx2 = 2 * Math.round(width / (Math.sqrt(3) * rCC)),
            layerCount = Math.round(2 * height / (3 * rCC)),
            atomCount = (nx2 + 1) * layerCount,
            halfRCC = rCC / 2,
            halfHexWidth = Math.sqrt(3) * halfRCC,
            layerHeight = 3 * halfRCC,
            atoms = new Array(atomCount),
            atomIndex = 0;
        for (let t = 0; t < layerCount; t++) {
            let factorT = t % 2;
            for (let i = 0; i <= nx2; i++, atomIndex++) {
                atoms[atomIndex] = {
                    el: "C",
                    x: halfHexWidth * i,
                    y: t * layerHeight + ((i % 2 === factorT) ? halfRCC : 0),
                    z: 0,
                    mol: 0
                };
            }
        }
        return atoms;
    },

    makeBonds({width, height, rCC}) {
        let nx2 = 2 * Math.round(width / (Math.sqrt(3) * rCC)),
            layerCount = Math.round(2 * height / (3 * rCC)),
            atomsPerLayer = nx2 + 1,
            atomCount = atomsPerLayer * layerCount,
            bonds = [];
        for (let i = 0; i < atomCount - 1; i++) {
            if ((i + 1) % atomsPerLayer) {
                bonds.push({iAtm: i, jAtm: i + 1, type: "a"});
            }
            if (i % 2 === 0) {
                let nextLayerNeighbor = i + atomsPerLayer;
                if (nextLayerNeighbor < atomCount) {
                    bonds.push({iAtm: i, jAtm: nextLayerNeighbor, type: "a"});
                }
            }
        }
        return bonds;
    }
};

export default graphene.create.bind(graphene);