import postcss from 'rollup-plugin-postcss';

export default [{
    input: 'lib/VTutorial.js',
    plugins: [
        postcss({
            extensions: [ '.css' ],
        }),
    ],
    output: [{
        file: 'dist/vue3-tutorial.common.js',
        exports: "named",
        format: 'cjs',
    }, {
        file: 'dist/vue3-tutorial.esm.js',
        format: 'esm',
    }],
    external: [
        'vtyx',
    ],
    context: 'this',
}];
