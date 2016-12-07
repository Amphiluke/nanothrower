import $ from "jquery";
import structure from "../structure.js";
import app from "../app.js";
import AbstractDialog from "./abstract-dialog.js";
import worker from "../worker.js";
import draw from "../draw.js";

let rndRain = Object.assign(new AbstractDialog(".nt-rnd-rain-form"), {
    show() {
        let sphere = this.sphere = structure.getWrappingSphere();
        sphere.r *= 1.1;
        draw.addWireSphere(sphere);
        $("#nt-sphere-radius").val(sphere.r.toFixed(3));
        return Object.getPrototypeOf(this).show.apply(this, arguments);
    },

    hide() {
        draw.removeWireSphere();
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
        let captureDistances = new Map($("#nt-distance-fields").find("label[data-el]").get().map(label => {
            return [$(label).data("el"), Number($("input", label).val())];
        }));
        captureDistances.set("H1", captureDistances.get("H"));
        worker.invoke("run", {
            mode: this.$el.find("input[name='nt-src-mode']").filter(":checked").val(),
            molecular: $("#nt-adsorb-mol").prop("checked"),
            biradical: $("#nt-adsorb-birad").prop("checked"),
            rHH: Number($("#nt-adsorb-r-hh").val()),
            hCount: Number($("#nt-adsorb-count").val()),
            sphere: this.sphere,
            structure: structure.structure,
            captureDistances: captureDistances
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
            html += `<label data-el="${el}"><input type="text" pattern="\\d*\\.?\\d+([eE][+-]?\\d+)?" required></label>`;
        }
        $("#nt-distance-fields").html(html);
    },

    handleMolecularChange(e) {
        let molecular = e.target.checked;
        $("#nt-adsorb-count-mol").toggleClass("hidden", !molecular);
        $("#nt-adsorb-count-atm").toggleClass("hidden", molecular);
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

    updateProgress: function (value) {
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