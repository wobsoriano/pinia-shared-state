---
'pinia-shared-state': patch
---

Fix vanilla `share()` collisions when multiple keys are shared from the same store. Updates for one key no longer trigger unnecessary broadcasts for other shared keys.
