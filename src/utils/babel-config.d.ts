export declare function createBabelConfig(context: string, esm: boolean, debug: boolean): {
    compact: boolean;
    presets: (string | {
        configPath: string;
        useBuiltIns: string;
        debug: boolean;
        corejs: number;
        modules: boolean;
        exclude: string[];
        targets: {
            esmodules: boolean;
        };
    })[][];
    plugins: (string | (string | {
        legacy: boolean;
    })[] | (string | {
        loose: boolean;
    })[])[];
    overrides: {
        test: RegExp;
        plugins: (string | {
            transform: string;
        })[][];
    }[];
};
