/**
  Copyright (c) 2015, 2026, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '..',

    // Frameworks to use. Available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    // NOTE: the order of these libraries is important. "requirejs" must be loaded first so that
    // other UMD modules will know it's an AMD environment.
    frameworks: [
      'requirejs',
      'mocha',
      'chai',
      'sinon',
      'fixture',
      'karma-typescript'
    ],
    // List of files / patterns to load in the browser:
    files: [
      'test-config/test-main.js',
      // Test files
      {
        pattern: 'src/**/__tests__/*.spec.ts',
        included: false
      },
      {
        pattern: 'src/ts/viewModels/**/*.ts',
        included: false
      },
      // Compiled app modules (viewModels, root, appController, etc.)
      {
        pattern: 'web/js/**/*.js',
        included: false,
        watched: false
      },
      // CCA libs
      { 
        pattern: 'web/*/jet-composites/**/*',
        included: false
      },
      // JET/3rd party libs
      {
        pattern: 'web/js/libs/**/*.js',
        included: false,
        watched: false
      },
      {
        pattern: 'web/css/**/oj-alta-notag.css',
        included: false,
        watched: false
      },
      // 3rd party testing libs
      {
        pattern: 'node_modules/sinon/**',
        included: false,
        watched: false
      },
      {
        pattern: 'node_modules/knockout/**',
        included: false,
        watched: false
      }
    ],

    // Files / patterns to exclude
    exclude: [
      'web/js/**/__tests__/*.js'
    ],

    // Preprocess matching files before serving them to the browser.
    // Available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/**/__tests__/*.ts': ['karma-typescript'],
      'src/ts/viewModels/**/*.ts': ['karma-typescript']
    },

    karmaTypescriptConfig: {
      tsconfig: 'test-config/tsconfig.json',
      coverageOptions: {
        instrumentation: true,
        exclude: [/\.d\.ts$/, /__tests__/, /node_modules/]
      },
      reports: {
        html: 'coverage',
        'text-summary': '',
        text: ''
      }
    },

    // Test results reporter to use. Possible values: 'dots', 'progress'.
    // Available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'karma-typescript'],

    client: {
      mocha: {
        timeout: 30000
      }
    },

    // Web server port
    port: 9876,

    // Enable / disable colors in the output (reporters and logs)
    colors: true,

    // Level of logging. Possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers. Available browser launchers: https://npmjs.org/browse/keyword/karma-launcher.
    browsers: ['Chrome'],

    // Continuous Integration mode. If true, Karma captures browsers, runs the tests and exits.
    singleRun: true,

    // Concurrency level: How many browser should be started simultaneous.
    concurrency: Infinity
  });
};
