import minify from "rollup-plugin-minify-es";

export default {
    input: "dev/js/main.js",
    output: {
        file: "build/js/main.js",
        format: "es"
    },
    plugins: [minify()],
    external: id => id.endsWith("three.min.js")
};