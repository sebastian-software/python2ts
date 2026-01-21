# Changelog

## [1.4.0](https://github.com/sebastian-software/python2ts/compare/python2ts-v1.3.3...python2ts-v1.4.0) (2026-01-21)


### Features

* **transformer:** support implicit string concatenation ([#34](https://github.com/sebastian-software/python2ts/issues/34), [#36](https://github.com/sebastian-software/python2ts/issues/36)) ([d868888](https://github.com/sebastian-software/python2ts/commit/d8688888c54667de5407ea484558f359b7c7b2bb))


### Bug Fixes

* **transformer:** handle UpdateStatement and variable context managers ([#35](https://github.com/sebastian-software/python2ts/issues/35), [#37](https://github.com/sebastian-software/python2ts/issues/37)) ([d5c30a4](https://github.com/sebastian-software/python2ts/commit/d5c30a48324098b506e9812328b7ce389bcc6be7))

## [1.3.3](https://github.com/sebastian-software/python2ts/compare/python2ts-v1.3.2...python2ts-v1.3.3) (2026-01-21)


### Bug Fixes

* **transformer:** convert ellipsis to Ellipsis constant ([#30](https://github.com/sebastian-software/python2ts/issues/30)) ([834d122](https://github.com/sebastian-software/python2ts/commit/834d12251550978555570b0695b2bb125a85741a))
* **transformer:** convert raw docstrings (r""") to JSDoc ([#33](https://github.com/sebastian-software/python2ts/issues/33)) ([6d7e300](https://github.com/sebastian-software/python2ts/commit/6d7e3002d2e64603f11dcadce52e38b258334bec))
* **transformer:** escape JS reserved keywords as variable names ([#29](https://github.com/sebastian-software/python2ts/issues/29)) ([2d2d7a4](https://github.com/sebastian-software/python2ts/commit/2d2d7a43774584b9f3e88cc0cbca94616f0a09fb))
* **transformer:** spread generator to array in join method calls ([#28](https://github.com/sebastian-software/python2ts/issues/28)) ([ff08efa](https://github.com/sebastian-software/python2ts/commit/ff08efa1697fe799c7cae7711b4b19bed2f29689))

## [1.3.2](https://github.com/sebastian-software/python2ts/compare/python2ts-v1.3.1...python2ts-v1.3.2) (2026-01-21)


### Bug Fixes

* **docstrings:** handle module-level and decorated function docstrings ([f8f53f0](https://github.com/sebastian-software/python2ts/commit/f8f53f0ac7f3d171f25e72eaf718e7e8b76126d0))
* isinstance with tuple of types now transpiles to array ([284d802](https://github.com/sebastian-software/python2ts/commit/284d802c81e5d10769325dbc16be402b635707a7)), closes [#26](https://github.com/sebastian-software/python2ts/issues/26)

## [1.3.1](https://github.com/sebastian-software/python2ts/compare/python2ts-v1.3.0...python2ts-v1.3.1) (2026-01-21)


### Documentation

* improve README files with marketing focus ([9db2108](https://github.com/sebastian-software/python2ts/commit/9db210874d52fe45e25a896a06ab4e53392d27ef))

## [1.3.0](https://github.com/sebastian-software/python2ts/compare/python2ts-v1.2.0...python2ts-v1.3.0) (2026-01-21)


### Features

* **transpiler:** add await for async module functions ([f43b659](https://github.com/sebastian-software/python2ts/commit/f43b65981945916a78100ce8a65f0c0db8994073))
* **transpiler:** add await to async hashlib calls ([14979bc](https://github.com/sebastian-software/python2ts/commit/14979bc5e803a475c556a464e5be8b5524b7ea70))


### Bug Fixes

* address strict eslint rules ([8eaf5aa](https://github.com/sebastian-software/python2ts/commit/8eaf5aa6a48bc244e3f8dba36764449b403d98ec))


### Code Refactoring

* remove eslint non-nullable-type-assertion-style override ([3287d2f](https://github.com/sebastian-software/python2ts/commit/3287d2f0b3af9888c907df6bf1b2d6dccd109bef))

## [1.2.0](https://github.com/sebastian-software/python2ts/compare/python2ts-v1.1.0...python2ts-v1.2.0) (2026-01-21)


### Features

* add ESLint prefer-const post-processing for optimal variable declarations ([209a1f9](https://github.com/sebastian-software/python2ts/commit/209a1f96d098cb493a7da00374325989be3c14f9)), closes [#16](https://github.com/sebastian-software/python2ts/issues/16)
* improve code quality of generated TypeScript ([e0f49f1](https://github.com/sebastian-software/python2ts/commit/e0f49f1b85e76fe0410eef851bb6574ef37f939d))
* **transpiler:** add ESLint rules for cleaner output ([737335d](https://github.com/sebastian-software/python2ts/commit/737335d06ab5a4bca173ed44836d693e17fccbf6))
* **transpiler:** add prefer-arrow-callback ESLint rule ([7825978](https://github.com/sebastian-software/python2ts/commit/7825978aff845deb883d4bb137f0c6ec6c333315))
* **transpiler:** add prefer-rest-params and prefer-spread rules ([9f45b1e](https://github.com/sebastian-software/python2ts/commit/9f45b1e730a72313e0475e45e49ab9ac193dfda4))
* **transpiler:** add TypeScript type-aware ESLint rules ([e16104f](https://github.com/sebastian-software/python2ts/commit/e16104f850e88f069e5522a6e87146ff7dc130ee))


### Code Refactoring

* **transpiler:** use typescript-eslint presets ([16db776](https://github.com/sebastian-software/python2ts/commit/16db776ce83f3ac18d902efab158d528a5eed0aa))

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
