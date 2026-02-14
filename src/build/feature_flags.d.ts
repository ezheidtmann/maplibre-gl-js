/**
 * Compile-time feature flags. Replaced with boolean literals by
 * @rollup/plugin-replace at build time. See build/feature_flags.ts for docs.
 */

/** When false, removes 3D terrain support. */
declare const FEATURE_TERRAIN: boolean;
/** When false, removes the heatmap layer type. */
declare const FEATURE_HEATMAP: boolean;
/** When false, removes the hillshade layer type. */
declare const FEATURE_HILLSHADE: boolean;
/** When false, removes the fill-extrusion (3D buildings) layer type. */
declare const FEATURE_FILL_EXTRUSION: boolean;
/** When false, removes sky rendering and atmosphere. */
declare const FEATURE_SKY: boolean;
/** When false, removes the color-relief layer type. */
declare const FEATURE_COLOR_RELIEF: boolean;
