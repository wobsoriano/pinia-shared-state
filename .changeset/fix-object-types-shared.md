---
'pinia-shared-state': patch
---

Fix object types not being shared across tabs. When a store contains `ref`-wrapped objects, cross-tab updates now correctly merge into the existing reactive object in-place rather than replacing it, preserving reactive references.
