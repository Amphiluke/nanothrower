import structure from "../structure.js";
import app from "../app.js";
import AbstractDialog from "./abstract-dialog.js";
import worker from "../worker.js";
import draw from "../draw.js";
import chem from "../chem.js";

let rndRain = Object.assign(new AbstractDialog(".nt-rnd-rain-form"), {
    show(...args) {
        let sphere = this.sphere = structure.getWrappingSphere();
        sphere.r *= 1.1;
        draw.addWireSphere(sphere);
        $("#nt-sphere-radius").val(sphere.r.toFixed(3));
        return Object.getPrototypeOf(this).show.apply(this, args);
    },

    hide(...args) {
        draw.removeWireSphere();
        return Object.getPrototypeOf(this).hide.apply(this, args);
    },

    handleApply(...args) {
        if (this.$el[0].checkValidity()) {
            return Object.getPrototypeOf(this).handleApply.apply(this, args);
        } else {
            window.alert("Please, fix invalid input first");
        }
    },

    apply() {
        this.fix();
        let concentration = Number($("#nt-adsorb-concentration").val());
        let hCount = chem.conToNum(structure.structure.atoms, concentration);
        let currHCount = chem.countAtoms(structure.structure.atoms);
        if (hCount <= currHCount) {
            window.alert("The given mass concentration of hydrogen is already reached");
            return;
        }
        let labels = $("#nt-distance-fields").find("label[data-el]").get();
        let captureDistances = new Map(labels.map(label => [$(label).data("el"), Number($("input", label).val())]));
        captureDistances.set("H1", captureDistances.get("H"));
        worker.invoke("run", {
            mode: this.$el.find("input[name='nt-src-mode']").filter(":checked").val(),
            molecular: $("#nt-adsorb-mol").prop("checked"),
            biradical: $("#nt-adsorb-birad").prop("checked"),
            rHH: Number($("#nt-adsorb-r-hh").val()),
            hCount: hCount - currHCount,
            sphere: this.sphere,
            structure: structure.structure,
            captureDistances
        });
    },

    discard() {
        this.reset();
    },

    resetHTML() {
        let atomSet = structure.getAtomSet();
        atomSet.add("H");
        let html = "";
        for (let el of atomSet) {
            html += `<label data-el="${el}"><input type="text" pattern="\\d*\\.?\\d+([eE][+\\-]?\\d+)?" required></label>`;
        }
        $("#nt-distance-fields").html(html);
    },

    handleMolecularChange(e) {
        let molecular = e.target.checked;
        $("#nt-adsorb-birad").prop({checked: molecular, disabled: !molecular});
        $("#nt-adsorb-r-hh").prop({required: molecular, disabled: !molecular});
    },

    handleRadiusChange(e) {
        if (e.target.checkValidity()) {
            this.sphere.r = Number(e.target.value);
            draw.removeWireSphere();
            draw.addWireSphere(this.sphere);
        }
    },

    updateProgress(value) {
        app.trigger("app:progress", value);
    },

    updateStructure(updatedStructure) {
        structure.overwrite(updatedStructure);
    }
});

rndRain.listen([
    {type: "change", owner: "#nt-adsorb-mol", handler: "handleMolecularChange"},
    {type: "change", owner: "#nt-sphere-radius", handler: "handleRadiusChange"},

    {type: "app:structure:loaded", owner: app, handler: "resetHTML"},
    {type: "updateStructure", owner: structure, handler: "resetHTML"},
    {type: "progress", owner: worker, handler: "updateProgress"},
    {type: "run", owner: worker, handler: "updateStructure"}
]);

export default rndRain;

app.addAction("rndRain", {
    get enabled() {
        return structure.structure.atoms.length > 0;
    },
    exec() {
        rndRain.show();
    }
});