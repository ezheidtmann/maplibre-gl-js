import {CircleStyleLayer} from './style_layer/circle_style_layer';
import {HeatmapStyleLayer} from './style_layer/heatmap_style_layer';
import {HillshadeStyleLayer} from './style_layer/hillshade_style_layer';
import {ColorReliefStyleLayer} from './style_layer/color_relief_style_layer';
import {FillStyleLayer} from './style_layer/fill_style_layer';
import {FillExtrusionStyleLayer} from './style_layer/fill_extrusion_style_layer';
import {LineStyleLayer} from './style_layer/line_style_layer';
import {SymbolStyleLayer} from './style_layer/symbol_style_layer';
import {BackgroundStyleLayer} from './style_layer/background_style_layer';
import {RasterStyleLayer} from './style_layer/raster_style_layer';
import {CustomStyleLayer, type CustomLayerInterface} from './style_layer/custom_style_layer';

import type {LayerSpecification} from '@maplibre/maplibre-gl-style-spec';

export function createStyleLayer(layer: LayerSpecification | CustomLayerInterface, globalState: Record<string, any>) {
    if (layer.type === 'custom') {
        return new CustomStyleLayer(layer, globalState);
    }
    switch (layer.type) {
        case 'background':
            return new BackgroundStyleLayer(layer, globalState);
        case 'circle':
            return new CircleStyleLayer(layer, globalState);
        case 'color-relief':
            if (FEATURE_COLOR_RELIEF) return new ColorReliefStyleLayer(layer, globalState);
            break;
        case 'fill':
            return new FillStyleLayer(layer, globalState);
        case 'fill-extrusion':
            if (FEATURE_FILL_EXTRUSION) return new FillExtrusionStyleLayer(layer, globalState);
            break;
        case 'heatmap':
            if (FEATURE_HEATMAP) return new HeatmapStyleLayer(layer, globalState);
            break;
        case 'hillshade':
            if (FEATURE_HILLSHADE) return new HillshadeStyleLayer(layer, globalState);
            break;
        case 'line':
            return new LineStyleLayer(layer, globalState);
        case 'raster':
            return new RasterStyleLayer(layer, globalState);
        case 'symbol':
            return new SymbolStyleLayer(layer, globalState);
    }
}
