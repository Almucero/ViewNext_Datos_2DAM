/**
  Copyright (c) 2015, 2022, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

module.exports = function (configObj) {
  return new Promise((resolve) => {
    console.log("Running before_component_typescript hook.");
    const { opts } = configObj;
    console.log("buildForServe component", opts.buildOptions.buildForServe);
    if (opts.buildForServe || opts.buildOptions.buildForServe) {
      const { tsconfigJson } = opts.typescript;
      tsconfigJson.compilerOptions.rootDir = "./web/ts/";
      tsconfigJson.compilerOptions.outDir = "./web/js/";
    }
    resolve(configObj);
  });
};
