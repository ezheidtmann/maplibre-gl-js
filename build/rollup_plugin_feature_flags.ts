import {type Plugin} from 'rollup';
import path from 'path';
import {fileURLToPath} from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Feature flag configuration: maps each flag to the source file path
 * patterns that should be replaced with empty stubs when the flag is false.
 *
 * Paths are relative to the project's `src/` directory.
 */
const featureModuleMap: Record<string, string[]> = {
    FEATURE_TERRAIN: [
        'render/terrain.ts',
        'render/draw_terrain.ts',
        'render/program/terrain_program.ts',
        'tile/terrain_tile_manager.ts',
        'ui/control/terrain_control.ts',
        'data/dem_data.ts',
    ],
    FEATURE_HEATMAP: [
        'style/style_layer/heatmap_style_layer.ts',
        'data/bucket/heatmap_bucket.ts',
        'render/draw_heatmap.ts',
        'render/program/heatmap_program.ts',
    ],
    FEATURE_HILLSHADE: [
        'style/style_layer/hillshade_style_layer.ts',
        'render/draw_hillshade.ts',
        'render/program/hillshade_program.ts',
    ],
    FEATURE_FILL_EXTRUSION: [
        'style/style_layer/fill_extrusion_style_layer.ts',
        'data/bucket/fill_extrusion_bucket.ts',
        'render/draw_fill_extrusion.ts',
        'render/program/fill_extrusion_program.ts',
    ],
    FEATURE_SKY: [
        'style/sky.ts',
        'render/draw_sky.ts',
        'render/program/sky_program.ts',
        'render/program/atmosphere_program.ts',
    ],
    FEATURE_COLOR_RELIEF: [
        'style/style_layer/color_relief_style_layer.ts',
        'render/draw_color_relief.ts',
        'render/program/color_relief_program.ts',
    ],
};

const STUB_MODULE_PREFIX = '\0feature-stub:';

/**
 * Parse export names from a TypeScript source file using regex.
 * Handles common patterns used in this codebase:
 *   - export class/function/const/let/var/type/interface/enum Foo
 *   - export { foo, bar, baz }
 *   - export default
 */
function parseExportNames(source: string): string[] {
    const names = new Set<string>();

    // Match: export class Foo, export function foo, export const foo, etc.
    const namedExportRe = /export\s+(?:declare\s+)?(?:abstract\s+)?(?:class|function|const|let|var|type|interface|enum)\s+(\w+)/g;
    let match: RegExpExecArray | null;
    while ((match = namedExportRe.exec(source)) !== null) {
        names.add(match[1]);
    }

    // Match: export { foo, bar, baz } (but not export { ... } from '...')
    const exportListRe = /export\s*\{([^}]+)\}(?!\s*from)/g;
    while ((match = exportListRe.exec(source)) !== null) {
        const items = match[1].split(',');
        for (const item of items) {
            // Handle "foo as bar" — use the exported name (bar)
            const asMatch = item.trim().match(/(?:\w+\s+as\s+)?(\w+)/);
            if (asMatch) {
                names.add(asMatch[1]);
            }
        }
    }

    // Match: export default
    if (/export\s+default\s/.test(source)) {
        names.add('default');
    }

    return [...names];
}

/**
 * Generate stub code for a module. Classes become empty classes,
 * type-guard functions return false, everything else becomes undefined.
 */
function generateStub(realPath: string): string {
    let source: string;
    try {
        source = fs.readFileSync(realPath, 'utf-8');
    } catch {
        return 'export default undefined;';
    }

    const names = parseExportNames(source);
    if (names.length === 0) {
        return 'export default undefined;';
    }

    const lines: string[] = [];
    for (const name of names) {
        if (name === 'default') {
            lines.push('export default undefined;');
        } else if (/^is[A-Z]/.test(name)) {
            // Type guard functions — always return false
            lines.push(`export function ${name}() { return false; }`);
        } else if (/^[A-Z]/.test(name)) {
            // Capitalized names are likely classes
            lines.push(`export class ${name} {}`);
        } else {
            // Constants, uniforms, etc.
            lines.push(`export const ${name} = undefined;`);
        }
    }
    return lines.join('\n');
}

/**
 * Rollup plugin that replaces disabled feature modules with empty stubs.
 *
 * When a feature flag environment variable is set to "false", all modules
 * associated with that feature are resolved to empty stub modules. This
 * ensures that Rollup never pulls their dependency trees into the bundle.
 *
 * The stub modules export the same names as the original modules, but with
 * empty implementations: classes become `class Foo {}`, type guards return
 * `false`, and other exports become `undefined`.
 */
export function featureFlagPlugin(featureFlags: Record<string, boolean>): Plugin {
    // Build a set of absolute paths that should be stubbed out
    const srcDir = path.resolve(__dirname, '..', 'src');
    const stubbedPaths = new Set<string>();

    for (const [flag, modulePaths] of Object.entries(featureModuleMap)) {
        if (featureFlags[flag] === false) {
            for (const relPath of modulePaths) {
                stubbedPaths.add(path.resolve(srcDir, relPath));
            }
        }
    }

    if (stubbedPaths.size === 0) {
        // No features disabled — return a no-op plugin
        return {name: 'feature-flags'};
    }

    // Log which features are disabled
    const disabled = Object.entries(featureFlags)
        .filter(([, v]) => !v)
        .map(([k]) => k);
    console.log(`[feature-flags] Disabled features: ${disabled.join(', ')}`);
    console.log(`[feature-flags] Stubbing ${stubbedPaths.size} modules`);

    return {
        name: 'feature-flags',

        resolveId(source, importer) {
            if (!importer) return null;

            // Resolve the import to an absolute path
            let resolved: string | undefined;
            if (source.startsWith('.')) {
                resolved = path.resolve(path.dirname(importer), source);
                // Add .ts extension if not present
                if (!path.extname(resolved)) {
                    resolved += '.ts';
                }
            }

            if (resolved && stubbedPaths.has(resolved)) {
                return STUB_MODULE_PREFIX + resolved;
            }

            return null;
        },

        load(id) {
            if (id.startsWith(STUB_MODULE_PREFIX)) {
                const realPath = id.slice(STUB_MODULE_PREFIX.length);
                return generateStub(realPath);
            }
            return null;
        }
    };
}
