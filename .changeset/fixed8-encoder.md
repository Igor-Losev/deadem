---
'@deademx/engine': patch
'deadem': patch
---

Decode `fixed8`-encoded fields and register the Deadlock `CUtlBinaryBlock` type.

Build 10932 tags most small integer and enum fields with the `fixed8` variable encoder; reading them as variable-length integers desynced entity deltas and aborted the parse. `CUtlBinaryBlock` is a new Deadlock field type. Together these let build-10932 replays parse again.
