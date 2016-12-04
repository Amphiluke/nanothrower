import structure from "./structure.js";
import app from "./app.js";
import "./components/save.js";
import "./components/transform.js";
import "./components/rnd-rain.js";
import "./components/appearance.js";
import "./components/menu.js";
import "./components/view.js";


app.on("app:structure:loaded", () => {
    document.title = `${structure.structure.name} - Nanothrower`;
});

app.on("app:stateChange", busy => {
    document.body.classList.toggle("app-busy", busy);
    if (!busy) {
        document.getElementById("nt-progress").innerHTML = "";
    }
});

app.on("app:progress", progress => {
    document.getElementById("nt-progress").innerHTML = Math.round(progress) + "%";
});