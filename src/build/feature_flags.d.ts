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
/** When false, removes globe and vertical-perspective projections. */
declare const FEATURE_GLOBE: boolean;
/** When false, removes the video source type. */
declare const FEATURE_VIDEO_SOURCE: boolean;
/** When false, removes the canvas source type. */
declare const FEATURE_CANVAS_SOURCE: boolean;
/** When false, removes the image source type. Also disables video and canvas sources. */
declare const FEATURE_IMAGE_SOURCE: boolean;
/** When false, removes all UI controls except AttributionControl. */
declare const FEATURE_CONTROLS: boolean;
/** When false, removes the Popup class. */
declare const FEATURE_POPUP: boolean;
/** When false, removes the Marker class. */
declare const FEATURE_MARKER: boolean;
/** When false, removes URL hash tracking support. */
declare const FEATURE_HASH: boolean;
