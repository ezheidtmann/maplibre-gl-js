
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import strip from '@rollup/plugin-strip';
import {type Plugin} from 'rollup';
import json from '@rollup/plugin-json';
import {visualizer} from 'rollup-plugin-visualizer';
import {featureFlagPlugin} from './rollup_plugin_feature_flags';

const {BUNDLE} = process.env;
const stats = BUNDLE === 'stats';

// Feature flags for optimized builds.
// Set environment variables to "false" to exclude features from the bundle.
// Example: FEATURE_TERRAIN=false FEATURE_HEATMAP=false npm run build-prod
export const featureFlags: Record<string, boolean> = {
    FEATURE_TERRAIN: process.env.FEATURE_TERRAIN !== 'false',
    FEATURE_HEATMAP: process.env.FEATURE_HEATMAP !== 'false',
    FEATURE_HILLSHADE: process.env.FEATURE_HILLSHADE !== 'false',
    FEATURE_FILL_EXTRUSION: process.env.FEATURE_FILL_EXTRUSION !== 'false',
    FEATURE_SKY: process.env.FEATURE_SKY !== 'false',
    FEATURE_COLOR_RELIEF: process.env.FEATURE_COLOR_RELIEF !== 'false',
    FEATURE_GLOBE: process.env.FEATURE_GLOBE !== 'false',
    FEATURE_VIDEO_SOURCE: process.env.FEATURE_VIDEO_SOURCE !== 'false',
    FEATURE_CANVAS_SOURCE: process.env.FEATURE_CANVAS_SOURCE !== 'false',
    FEATURE_IMAGE_SOURCE: process.env.FEATURE_IMAGE_SOURCE !== 'false',
    FEATURE_CONTROLS: process.env.FEATURE_CONTROLS !== 'false',
    FEATURE_POPUP: process.env.FEATURE_POPUP !== 'false',
    FEATURE_MARKER: process.env.FEATURE_MARKER !== 'false',
    FEATURE_HASH: process.env.FEATURE_HASH !== 'false',
    FEATURE_VALIDATE_STYLE: process.env.FEATURE_VALIDATE_STYLE !== 'false',
};

// Common set of plugins/transformations shared across different rollup
// builds (main maplibre bundle, style-spec package, benchmarks bundle)

export const nodeResolve = resolve({
    browser: true,
    preferBuiltins: false
});

export const plugins = (production: boolean): Plugin[] => [
    json(),
    // Stub out modules belonging to disabled features so they (and their
    // dependency trees) are never pulled into the bundle.
    featureFlagPlugin(featureFlags),
    // Replace feature flag identifiers with compile-time boolean constants.
    // Using preventAssignment: true so that `export let FEATURE_X = true`
    // declarations in feature_flags.ts are not mangled, while usages like
    // `if (FEATURE_X)` are replaced with literal true/false.
    replace({
        preventAssignment: true,
        values: Object.fromEntries(
            Object.entries(featureFlags).map(([key, value]) => [key, JSON.stringify(value)])
        )
    }),
    // https://github.com/zaach/jison/issues/351
    replace({
        preventAssignment: true,
        include: /\/jsonlint-lines-primitives\/lib\/jsonlint.js/,
        delimiters: ['', ''],
        values: {
            '_token_stack:': ''
        }
    }),
    production && strip({
        sourceMap: true,
        functions: ['PerformanceUtils.*']
    }),
    production && terser({
        compress: {
            pure_getters: true,
            passes: 3
        },
        sourceMap: true
    }),
    nodeResolve,
    typescript(),
    commonjs({
        // global keyword handling causes Webpack compatibility issues, so we disabled it:
        // https://github.com/mapbox/mapbox-gl-js/pull/6956
        ignoreGlobal: true
    }),
    // generate bundle stats in multiple formats (treemap, sunburst, etc...)
    ...(stats ? (['treemap', 'sunburst', 'flamegraph', 'network'] as const).map(template =>
        visualizer({
            template: template,
            title: `gl-js-${template}`,
            filename: `staging/${template}.html`,
            gzipSize: true,
            brotliSize: true,
            sourcemap: true,
            open: true
        })
    ) : [])
].filter(Boolean) as Plugin[];

export const watchStagingPlugin: Plugin = {
    name: 'watch-external',
    buildStart() {
        this.addWatchFile('staging/maplibregl/index.js');
        this.addWatchFile('staging/maplibregl/shared.js');
        this.addWatchFile('staging/maplibregl/worker.js');
    }
};
