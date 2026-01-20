# Changelog

## [1.1.0](https://github.com/sebastian-software/python2ts/compare/python2ts-v1.0.0...python2ts-v1.1.0) (2026-01-20)


### Features

* add NumPy-style docstring parsing support ([fd54354](https://github.com/sebastian-software/python2ts/commit/fd54354bc5ac46e10359363869ddcd201a053cfa)), closes [#10](https://github.com/sebastian-software/python2ts/issues/10)
* convert keyword-only parameters (*) to options object ([720ddf5](https://github.com/sebastian-software/python2ts/commit/720ddf5a314b5da0a30a4614f69dec015bab3749)), closes [#13](https://github.com/sebastian-software/python2ts/issues/13)


### Bug Fixes

* resolve 7 transpiler bugs from issue reports ([952fbe8](https://github.com/sebastian-software/python2ts/commit/952fbe8346e41eaf96246b63e15c9745f37ca4c0))

## [0.2.1](https://github.com/sebastian-software/python2ts/compare/python2ts-v0.2.0...python2ts-v0.2.1) (2026-01-19)


### Tests

* improve coverage to 90% lines, add c8 ignores for unreachable code ([2737bf4](https://github.com/sebastian-software/python2ts/commit/2737bf4a8b0ac9c0be3878fbbfc9d88e6cc55a46))
* raise branch coverage threshold to 80% ([a6711fe](https://github.com/sebastian-software/python2ts/commit/a6711fe4b34ce6ebcb4244266ffbdfbe9eba03b0))

## [0.2.0](https://github.com/sebastian-software/python2ts/compare/python2ts-v0.1.0...python2ts-v0.2.0) (2026-01-19)


### ⚠ BREAKING CHANGES

* All snake_case function names are now camelCase
* Project restructured as monorepo

### Features

* **docs:** add logos, acknowledgments, simplify READMEs ([cb2ce3f](https://github.com/sebastian-software/python2ts/commit/cb2ce3fb5a5c81bec2689ebb81e2469c344da884))
* implement subpath exports architecture (ADR-0009, ADR-0010) ([33415e1](https://github.com/sebastian-software/python2ts/commit/33415e10f8d44f9c169d3ae8d58bdf7db5baf45b))
* migrate pythonlib API to camelCase naming convention ([5052071](https://github.com/sebastian-software/python2ts/commit/5052071cb1d979dd8b37651099de0bd08430df21))
* restructure as pnpm monorepo with Docusaurus docs ([94f44ea](https://github.com/sebastian-software/python2ts/commit/94f44ea0e9cf7bc3c86b802c58c5285f20cc4a19))


### Bug Fixes

* exclude prettier from bundle, add as dependency ([b2d85d7](https://github.com/sebastian-software/python2ts/commit/b2d85d72b6f73382c3217f0307e47e9e392b0f59))
