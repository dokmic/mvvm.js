import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';

export default [
  ...[['src/index.ts', { output: { name: 'MVVM', dir: 'lib' } }]].flatMap(([input, { output }]) => [
    {
      input,
      external: ['..'],
      output: [
        {
          ...output,
          entryFileNames: '[name].js',
          format: 'umd',
          exports: 'named',
          sourcemap: true,
          sourcemapExcludeSources: true,
        },
        {
          ...output,
          entryFileNames: '[name].mjs',
          format: 'esm',
          sourcemap: true,
          sourcemapExcludeSources: true,
        },
      ],
      plugins: [
        typescript({
          cacheRoot: './node_modules/.cache/rpt2',
          useTsconfigDeclarationDir: true,
        }),
        terser({
          ecma: 6,
          mangle: false,
          compress: false,
          output: {
            beautify: true,
            comments: false,
          },
        }),
      ],
    },
  ]),

  ...[['src/index.ts', { output: { dir: 'lib' } }]].map(([input, { output, plugins }]) => ({
    input,
    output: {
      ...output,
      entryFileNames: '[name].d.ts',
      format: 'es',
    },
    plugins: [
      ...(plugins || []),
      resolve({
        extensions: ['.d.ts'],
        mainFields: ['types'],
      }),
      dts(),
    ],
  })),
];
