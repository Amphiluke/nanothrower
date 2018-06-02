import AbstractDialog from "./abstract-dialog.js";
import structure from "../structure.js";
import draw from "../draw.js";
import app from "../app.js";

let appearance = Object.assign(new AbstractDialog(".nt-appearance-form"), {
    handleUpdateStructure(rescanAtoms) {
        if (rescanAtoms) {
            $("#nt-appearance-element")
                .html("<option selected>" + structure.getAtomList().join("</option><option>") + "</option>");
            this.setCurrElementColor();
        }
    },

    handleColorChange(e) {
        let color = parseInt(e.target.value.slice(1), 16); // skip the leading # sign
        if (isNaN(color)) {
            return;
        }
        if (!this.tmpClrPresets) {
            this.tmpClrPresets = new Map();
        }
        // Store the value in a temporal map (it will be copied to view's presets if the dialog won't be discarded)
        this.tmpClrPresets.set($("#nt-appearance-element").val(), color);
    },

    apply() {
        draw.appearance = this.$el.find("input[name='appearance']:checked").data("appearance");
        draw.setBgColor($("#nt-bg-color").val());
        if (this.tmpClrPresets) {
            draw.setAtomColors(this.tmpClrPresets);
            this.tmpClrPresets = undefined;
        }
        draw.render();
        this.fix();
    },

    discard() {
        this.reset();
        this.tmpClrPresets = undefined;
        this.setCurrElementColor();
    },

    setCurrElementColor() {
        let el = $("#nt-appearance-element").val(),
            color;
        if (this.tmpClrPresets && (this.tmpClrPresets.has(el))) {
            color = this.tmpClrPresets.get(el);
        } else {
            color = draw.getAtomColor(el);
        }
        $("#nt-appearance-color").val("#" + color.toString(16).padStart(6, "0"));
    }
});

appearance.listen([
    {type: "updateStructure", owner: structure, handler: "handleUpdateStructure"},

    {type: "change", owner: "#nt-appearance-element", handler: "setCurrElementColor"},
    {type: "change", owner: "#nt-appearance-color", handler: "handleColorChange"}
]);

export default appearance;

app.addAction("alterView", {
    get enabled() {
        return structure.structure.atoms.length > 0;
    },
    exec() {
        appearance.show();
    }
});