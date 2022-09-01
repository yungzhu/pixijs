module.exports = {
    testPathIgnorePatterns: ['/node_modules/', '/src/', '/dist/', '/lib/'],
    preset: 'ts-jest/presets/js-with-ts',
    // runner: 'jest-electron/runner',
    // testEnvironment: 'jest-electron/environment',
    runner: '@kayahr/jest-electron-runner',
    testEnvironment: '@kayahr/jest-electron-runner/environment',
    setupFilesAfterEnv: [
        'jest-extended/all',
        './test/debug.js',
    ],
    globalSetup: '<rootDir>/test/jest-global-setup.ts',
    globalTeardown: '<rootDir>/test/jest-global-teardown.ts',
    transform: {
        '\\.vert$': '<rootDir>/test/jest-raw-loader.js',
        '\\.frag$': '<rootDir>/test/jest-raw-loader.js',
    },
    moduleNameMapper: {
        '^@pixi/(.*)$': '<rootDir>/packages/$1/src',
    },
    testMatch: ['**/?(*.)+(spec|tests).[tj]s?(x)'],
    globals: {
        'ts-jest': {
            tsconfig: {
                module: 'ESNext',
                esModuleInterop: true,
            },
            diagnostics: false,
        },
    },
    collectCoverageFrom: [
        '<rootDir>/packages/**/*.ts',
        '!<rootDir>/packages/**/*.d.ts',
        '!<rootDir>/packages/polyfill/**/*.ts',
    ],
    coverageDirectory: '<rootDir>/dist/coverage',
};
