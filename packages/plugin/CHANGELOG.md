# Changelog

## [1.2.0](https://github.com/OneEyed1366/wolfi-tui/compare/plugin@v1.1.0...plugin@v1.2.0) (2026-03-15)


### Features

* **angular:** add Angular 17+ support with custom Renderer2 ([635e240](https://github.com/OneEyed1366/wolfi-tui/commit/635e240f5ebb108a36b42c15381828310499818e))
* **plugin:** add nativeBindings option for automatic native asset handling ([514edff](https://github.com/OneEyed1366/wolfi-tui/commit/514edff63ba2428e19dbbe00e450d4fbc33ae317))
* **plugin:** add solid to Framework type and LogCategory ([10af364](https://github.com/OneEyed1366/wolfi-tui/commit/10af364cbf439e588415fdc3e5af4148da1d65a4))
* **plugin:** create unified @wolfie/plugin package with bundler-specific exports ([15f9fc3](https://github.com/OneEyed1366/wolfi-tui/commit/15f9fc35c2880c75d5acdb8c5fcc00344b2ccda6))
* **vue:** add component library and comprehensive test suite (130 tests) ([7bd9446](https://github.com/OneEyed1366/wolfi-tui/commit/7bd9446db6dfdd6ba43f9328f8b66fa2376c7dc5))


### Bug Fixes

* **plugin:** fix esbuild style modules and scoped rendering ([6741463](https://github.com/OneEyed1366/wolfi-tui/commit/674146387598a51cd9d942600217af4f68135764))
* **plugin:** scan Tailwind candidates in webpack beforeRun/watchRun hooks ([3303af3](https://github.com/OneEyed1366/wolfi-tui/commit/3303af3e566bc2323d369de02fb3f8f5474093ab))
* **plugin:** use @wolfie/solid for CSS module registerStyles import in esbuild plugin ([049c822](https://github.com/OneEyed1366/wolfi-tui/commit/049c8229594ed682178091267df5281fb7e9c9b4))
* **vue:** clear terminal on first render and suppress dev mode logs ([ed3da81](https://github.com/OneEyed1366/wolfi-tui/commit/ed3da81a89484c027823bf53bce8a505de1f2df4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @wolfie/css-parser bumped to 1.2.0
