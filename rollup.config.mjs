import terser from "@rollup/plugin-terser";

export default {
    input: "dev/js/main.js",
    output: {
        file: "build/js/main.js",
        format: "es"
    },
    plugins: [terser({module: true})],
    external: id => id.endsWith("three.min.js")
};
