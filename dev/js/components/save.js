import AbstractDialog from "./abstract-dialog.js";
import fileAPI from "../file-processing.js";
import app from "../app.js";
import structure from "../structure.js";
import utils from "../utils.js";

let save = Object.assign(new AbstractDialog(".nt-save-form"), {
    handleSave(e) {
        let type = $("#nt-file-type").val(),
            file = fileAPI.makeFile(type);
        if (file) {
            e.target.setAttribute("download", `untitled.${type}`);
            e.target.href = utils.getBlobURL(file);
        }
    }
});

save.listen([
    {type: "click", filter: ".nt-apply", handler: "handleSave"}
]);

export default save;

app.addAction("save", {
    get enabled() {
        return structure.structure.atoms.length > 0;
    },
    exec() {
        save.show();
    }
});