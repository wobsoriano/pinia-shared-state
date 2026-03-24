# pinia-shared-state

## 2.0.0

### Major Changes

- 1ed12be: This package is now ESM only.

### Patch Changes

- bff637f: Fix object types not being shared across tabs. When a store contains `ref`-wrapped objects, cross-tab updates now correctly merge into the existing reactive object in-place rather than replacing it, preserving reactive references.

## 1.0.1

### Patch Changes

- 0db3569: Remove vue 2 mention in README

## 1.0.0

### Major Changes

- fe3f0e1: Introduce Pinia v3
