import {defineConfig} from 'vitest/config';

export default defineConfig({
    define: {
        FEATURE_TERRAIN: 'true',
        FEATURE_HEATMAP: 'true',
        FEATURE_HILLSHADE: 'true',
        FEATURE_FILL_EXTRUSION: 'true',
        FEATURE_SKY: 'true',
        FEATURE_COLOR_RELIEF: 'true',
        FEATURE_GLOBE: 'true',
        FEATURE_VIDEO_SOURCE: 'true',
        FEATURE_CANVAS_SOURCE: 'true',
        FEATURE_IMAGE_SOURCE: 'true',
        FEATURE_CONTROLS: 'true',
        FEATURE_POPUP: 'true',
        FEATURE_MARKER: 'true',
        FEATURE_HASH: 'true',
    },
    test: {
        name: 'unit',
        environment: 'jsdom',
        environmentOptions: {
            jsdom: {
                url: 'http://localhost/',
            }
        },
        setupFiles: [
            'vitest-webgl-canvas-mock',
            './test/unit/lib/web_worker_mock.ts'
        ],
        include: [
            'src/**/*.test.{ts,js}'
        ],
        coverage: {
            provider: 'v8',
            reporter: ['json', 'html'],
            exclude: ['**/*.test.ts'],
            include: ['src/**/*.{ts,js}'],
            reportsDirectory: './coverage/vitest/unit',
        },
    },
});
