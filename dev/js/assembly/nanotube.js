let nanotube = {
    create(settings) {
        return {
            name: "Nanotube",
            atoms: this.makeAtoms(settings),
            bonds: this.makeBonds(settings)
        };
    },

    makeAtoms({radius, length, rCC}) {
        let factor = rCC / radius;
        let nx = Math.round(2 * Math.PI / Math.acos(1 - 1.5 * factor * factor));
        radius = 0.5 * Math.sqrt(3) * rCC / Math.sin(Math.PI / nx); // exact radius
        let theta = 2 * Math.PI / nx;
        factor = radius * (1 - Math.cos(theta / 2));
        let dz = Math.sqrt(rCC * rCC / 4 - factor * factor);
        let layerCount = Math.round(length / (rCC + dz));
        let atomCount = 2 * nx * layerCount;
        let halfTheta = theta / 2;
        let atoms = new Array(atomCount);
        let atomIndex = 0;
        for (let t = 0; t < layerCount; t++) {
            let factorT = t % 2;
            for (let i = 0; i < 2 * nx; i++, atomIndex++) {
                atoms[atomIndex] = {
                    el: "C",
                    x: radius * Math.cos(halfTheta * i),
                    y: radius * Math.sin(halfTheta * i),
                    z: t * (rCC + dz) + ((i % 2) ^ factorT) * dz,
                    mol: 0
                };
            }
        }
        return atoms;
    },

    makeBonds({radius, length, rCC}) {
        let factor = rCC / radius;
        let nx = Math.round(2 * Math.PI / Math.acos(1 - 1.5 * factor * factor));
        radius = 0.5 * Math.sqrt(3) * rCC / Math.sin(Math.PI / nx); // exact radius
        let theta = 2 * Math.PI / nx;
        factor = radius * (1 - Math.cos(theta / 2));
        let dz = Math.sqrt(rCC * rCC / 4 - factor * factor);
        let layerCount = Math.round(length / (rCC + dz));
        let atomsPerLayer = 2 * nx;
        let atomCount = atomsPerLayer * layerCount;
        let bonds = [];
        for (let i = 0; i < atomCount; i++) {
            if ((i + 1) % atomsPerLayer) {
                bonds.push({iAtm: i, jAtm: i + 1, type: "a"});
            } else {
                bonds.push({iAtm: i, jAtm: i + 1 - atomsPerLayer, type: "a"});
            }
            let layerParity = Math.trunc(i / atomsPerLayer) % 2;
            let atomParity = i % 2;
            if (layerParity ^ atomParity) {
                let nextLayerNeighbor = i + atomsPerLayer;
                if (nextLayerNeighbor < atomCount) {
                    bonds.push({iAtm: i, jAtm: nextLayerNeighbor, type: "a"});
                }
            }
        }
        return bonds;
    }
};

export default nanotube.create.bind(nanotube);