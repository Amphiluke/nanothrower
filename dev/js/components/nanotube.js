import structure from "../structure.js";
import app from "../app.js";
import AbstractDialog from "./abstract-dialog.js";
import makeNanotube from "../assembly/nanotube.js";

let nanotube = Object.assign(new AbstractDialog(".nt-nanotube-form"), {
    handleApply(...args) {
        if (this.$el[0].checkValidity()) {
            return Object.getPrototypeOf(this).handleApply.apply(this, args);
        } else {
            window.alert("Please, fix invalid input first");
        }
    },

    apply() {
        this.fix();
        structure.overwrite(makeNanotube({
            radius: Number($("#nanotube-radius").val()),
            length: Number($("#nanotube-length").val()),
            rCC: Number($("#graphene-rcc").val())
        }));
        structure.translate(0, 0, 0);
    }
});

export default nanotube;

app.addAction("nanotube", {
    get enabled() {
        return true;
    },
    exec() {
        nanotube.show();
    }
});