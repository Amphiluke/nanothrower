import $ from "jquery";
import structure from "../structure.js";
import app from "../app.js";
import AbstractDialog from "./abstract-dialog.js";
import makeGraphene from "../assembly/graphene.js";

let graphene = Object.assign(new AbstractDialog(".nt-graphene-form"), {
    handleApply() {
        if (this.$el[0].checkValidity()) {
            return Object.getPrototypeOf(this).handleApply.apply(this, arguments);
        } else {
            window.alert("Please, fix invalid input first");
        }
    },

    apply() {
        this.fix();
        structure.overwrite(makeGraphene({
            width: Number($("#graphene-width").val()),
            height: Number($("#graphene-height").val()),
            rCC: Number($("#graphene-rcc").val())
        }));
        structure.translate(0, 0, 0);
    }
});

export default graphene;

app.addAction("graphene", {
    get enabled() {
        return true;
    },
    exec() {
        graphene.show();
    }
});