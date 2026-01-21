# Changelog

## [2.0.3](https://github.com/sebastian-software/python2ts/compare/pythonlib-v2.0.2...pythonlib-v2.0.3) (2026-01-21)


### Bug Fixes

* **transformer:** convert ellipsis to Ellipsis constant ([#30](https://github.com/sebastian-software/python2ts/issues/30)) ([834d122](https://github.com/sebastian-software/python2ts/commit/834d12251550978555570b0695b2bb125a85741a))

## [2.0.2](https://github.com/sebastian-software/python2ts/compare/pythonlib-v2.0.1...pythonlib-v2.0.2) (2026-01-21)


### Bug Fixes

* isinstance with tuple of types now transpiles to array ([284d802](https://github.com/sebastian-software/python2ts/commit/284d802c81e5d10769325dbc16be402b635707a7)), closes [#26](https://github.com/sebastian-software/python2ts/issues/26)

## [2.0.1](https://github.com/sebastian-software/python2ts/compare/pythonlib-v2.0.0...pythonlib-v2.0.1) (2026-01-21)


### Documentation

* improve README files with marketing focus ([9db2108](https://github.com/sebastian-software/python2ts/commit/9db210874d52fe45e25a896a06ab4e53392d27ef))

## [2.0.0](https://github.com/sebastian-software/python2ts/compare/pythonlib-v1.0.2...pythonlib-v2.0.0) (2026-01-21)


### ⚠ BREAKING CHANGES

* **hashlib:** digest(), hexdigest(), pbkdf2Hmac(), scrypt(), compareDigest() now return Promises and must be awaited.

### Features

* **hashlib:** convert to async API with Web Crypto support ([82b0b58](https://github.com/sebastian-software/python2ts/commit/82b0b584fdff449d6c8afc58e4694bf105812d7c))
* **os:** implement conditional exports for browser/Node.js ([8e52695](https://github.com/sebastian-software/python2ts/commit/8e526958cbc7d41e06355b79fbfa7c325f756b81))
* **pythonlib:** add 13 Python standard library modules ([c0bf4ad](https://github.com/sebastian-software/python2ts/commit/c0bf4ad57d0d10e011ff196230b5f39241d31a2f))
* **pythonlib:** add browser entry point for main export ([bdba5c5](https://github.com/sebastian-software/python2ts/commit/bdba5c5ecd4eb6d361eab7f3aeae4cd56bf54c1c))
* **pythonlib:** add browser/Node.js conditional exports ([dc03d90](https://github.com/sebastian-software/python2ts/commit/dc03d903f86a40818333deafdf139f6c018e8ba5))
* **transpiler:** add await for async module functions ([f43b659](https://github.com/sebastian-software/python2ts/commit/f43b65981945916a78100ce8a65f0c0db8994073))


### Bug Fixes

* address strict eslint rules ([8eaf5aa](https://github.com/sebastian-software/python2ts/commit/8eaf5aa6a48bc244e3f8dba36764449b403d98ec))


### Code Refactoring

* **pythonlib:** convert fs operations to async API ([d18d2f4](https://github.com/sebastian-software/python2ts/commit/d18d2f45b295c0a809d8d31a131fbfdbdff05156))
* remove eslint non-nullable-type-assertion-style override ([3287d2f](https://github.com/sebastian-software/python2ts/commit/3287d2f0b3af9888c907df6bf1b2d6dccd109bef))


### Documentation

* add Node.js, Bun, and zero dependencies badges ([a6bdb10](https://github.com/sebastian-software/python2ts/commit/a6bdb10c8b8cac44b3321bf578b330d682551b5d))

## [1.0.2](https://github.com/sebastian-software/python2ts/compare/pythonlib-v1.0.1...pythonlib-v1.0.2) (2026-01-21)


### Performance

* **pythonlib:** avoid double array copy with toSorted/toReversed ([5153259](https://github.com/sebastian-software/python2ts/commit/5153259bd29b14bea19c0b43c59a7aca10b51422))


### Code Refactoring

* **pythonlib:** use ES2023 immutable array methods ([3ff8805](https://github.com/sebastian-software/python2ts/commit/3ff8805534d2c84e37766562df000d1be16b4d2a))
* **pythonlib:** use ES2024 Iterator Helpers for map/filter ([3116980](https://github.com/sebastian-software/python2ts/commit/311698055e3e110abcc63b7928270ae92552ff94))
* **pythonlib:** use ES2024 native Set methods ([32e99e0](https://github.com/sebastian-software/python2ts/commit/32e99e0c1e6a65f9cc3fd281e1a6db003627ba9d))


### Documentation

* **pythonlib:** add [@module](https://github.com/module) tags for TypeDoc module descriptions ([64ad074](https://github.com/sebastian-software/python2ts/commit/64ad07426dca16deb3cdf6d9890fe8f8a4187066))
* **pythonlib:** enhance JSDoc with Python docs links and descriptions ([b4b7e0a](https://github.com/sebastian-software/python2ts/commit/b4b7e0abe4f70dbf3f7a17cb4a1d2ce240b37efb))

## [1.0.1](https://github.com/sebastian-software/python2ts/compare/pythonlib-v1.0.0...pythonlib-v1.0.1) (2026-01-20)


### Bug Fixes

* resolve 7 transpiler bugs from issue reports ([952fbe8](https://github.com/sebastian-software/python2ts/commit/952fbe8346e41eaf96246b63e15c9745f37ca4c0))

## [0.2.1](https://github.com/sebastian-software/python2ts/compare/pythonlib-v0.2.0...pythonlib-v0.2.1) (2026-01-19)


### Documentation

* **pythonlib:** add deque and defaultdict keywords ([4bbe027](https://github.com/sebastian-software/python2ts/commit/4bbe02720d72c41848a2051e4f9ee4fbd2257813))


### Tests

* improve coverage to 90% lines, add c8 ignores for unreachable code ([2737bf4](https://github.com/sebastian-software/python2ts/commit/2737bf4a8b0ac9c0be3878fbbfc9d88e6cc55a46))

## [0.2.0](https://github.com/sebastian-software/python2ts/compare/pythonlib-v0.1.0...pythonlib-v0.2.0) (2026-01-19)


### ⚠ BREAKING CHANGES

* All snake_case function names are now camelCase
* Project restructured as monorepo

### Features

* **docs:** add logos, acknowledgments, simplify READMEs ([cb2ce3f](https://github.com/sebastian-software/python2ts/commit/cb2ce3fb5a5c81bec2689ebb81e2469c344da884))
* implement subpath exports architecture (ADR-0009, ADR-0010) ([33415e1](https://github.com/sebastian-software/python2ts/commit/33415e10f8d44f9c169d3ae8d58bdf7db5baf45b))
* migrate pythonlib API to camelCase naming convention ([5052071](https://github.com/sebastian-software/python2ts/commit/5052071cb1d979dd8b37651099de0bd08430df21))
* restructure as pnpm monorepo with Docusaurus docs ([94f44ea](https://github.com/sebastian-software/python2ts/commit/94f44ea0e9cf7bc3c86b802c58c5285f20cc4a19))


### Bug Fixes

* update tests for new direct import structure ([fe00e8e](https://github.com/sebastian-software/python2ts/commit/fe00e8e2f24895209d88f33c1a7056f98e51371c))
