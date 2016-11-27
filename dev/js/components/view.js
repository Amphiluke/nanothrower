import Eventful from "../eventful.js";
import app from "../app.js";
import draw from "../draw.js";
import structure from "../structure.js";

let view = Object.assign(new Eventful("#nt-view"), {
    rotData: {
        startX: 0,
        startRot: 0
    },

    handleDragEnterOver(e) {
        e.preventDefault();
        if (e.type === "dragenter") {
            e.currentTarget.classList.add("nt-droppable");
        }
    },

    handleDragLeave(e) {
        e.preventDefault();
        if (e.target === e.currentTarget) { // skip event when fired by children
            e.target.classList.remove("nt-droppable");
        }
    },

    handleDrop(e) {
        let dt = e.originalEvent.dataTransfer,
            files = dt && dt.files;
        if (files && files.length) {
            e.preventDefault();
            app.execAction("load", files[0]);
        }
        e.currentTarget.classList.remove("nt-droppable");
    },

    handleWheelZoom(e) {
        draw.zoom((e.originalEvent.deltaY) < 0 ? 5 : -5);
        e.preventDefault();
    },

    handleStartRotate(e) {
        this.rotData.startX = e.pageX;
        this.rotData.startRot = draw.rotation;
        this.$el
            .on("mouseup.ntViewRotation mouseleave.ntViewRotation", this.handleStopRotate.bind(this))
            .on("mousemove.ntViewRotation", this.handleRotate.bind(this));
        draw.autoUpdate = true;
        draw.update();
    },

    handleStopRotate() {
        draw.autoUpdate = false;
        this.$el.off(".ntViewRotation");
    },

    handleRotate(e) {
        draw.rotation = this.rotData.startRot + (e.pageX - this.rotData.startX) * 0.02;
    },

    handleWndResize() {
        if (!this._resizeTimer) {
            this._resizeTimer = setTimeout(() => {
                draw.resize();
                this._resizeTimer = undefined;
            }, 300);
        }
    },

    handleDblClick() {
        let sphere = structure.getWrappingSphere();
        draw.addWireSphere(sphere.cx, sphere.cy, sphere.cz, sphere.r);
    }
});

view.listen([
    {type: "dragenter dragover", handler: "handleDragEnterOver"},
    {type: "dragleave", handler: "handleDragLeave"},
    {type: "drop", handler: "handleDrop"},
    {type: "wheel", handler: "handleWheelZoom"},
    {type: "mousedown", handler: "handleStartRotate"},
    {type: "resize", owner: window, handler: "handleWndResize"},
    {type: "dblclick", handler: "handleDblClick"}
]);

draw.setup(view.$el.children("canvas")[0]);

export default view;