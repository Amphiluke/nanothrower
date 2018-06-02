import AbstractDialog from "./abstract-dialog.js";
import app from "../app.js";
import structure from "../structure.js";
import draw from "../draw.js";

let transform = Object.assign(new AbstractDialog(".nt-transform-form"), {
    handleAppStateChange(busy) {
        // Transformation of coordinates may take a while for large structures.
        // Block interface while the app is busy
        this.$el.find("fieldset").prop("disabled", busy);
    },

    handleTranslate() {
        let $fieldSet = this.$el.find(".nt-translate"),
            x = +$fieldSet.find("[data-axis='x']").val(),
            y = +$fieldSet.find("[data-axis='y']").val(),
            z = +$fieldSet.find("[data-axis='z']").val();
        structure.translate(x, y, z);
    },

    handleRotate(e) {
        let angle = $("#nt-rotate-angle").val() * Math.PI / 180,
            axis = e.target.getAttribute("data-axis");
        structure.rotate(angle, axis);
    },

    show(...args) {
        let centroid = structure.getCentroid();
        let $fields = this.$el.find(".nt-translate input[data-axis]");
        $fields.val(idx => centroid[$fields.eq(idx).data("axis")].toFixed(5));
        draw.addAxes();
        return Object.getPrototypeOf(this).show.apply(this, args);
    },

    hide(...args) {
        draw.removeAxes();
        return Object.getPrototypeOf(this).hide.apply(this, args);
    }
});

transform.listen([
    {type: "app:stateChange", owner: app, handler: "handleAppStateChange"},

    {type: "click", owner: "#nt-translate-apply", handler: "handleTranslate"},
    {type: "click", filter: ".nt-rotate [data-axis]", handler: "handleRotate"}
]);

export default transform;

app.addAction("transform", {
    get enabled() {
        return structure.structure.atoms.length > 0;
    },
    exec() {
        transform.show();
    }
});