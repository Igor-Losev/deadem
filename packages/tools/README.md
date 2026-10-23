# @deademx/tools

Internal repository scripts.

## Proto

```sh
# all
npm run proto:build # building static descriptors from local .proto files
npm run proto:sync  # synching local .proto files with the upstream (`SteamTracking`)

# cs2
npm run proto:build -- --workspaces=cs2 
npm run proto:sync -- --workspaces=cs2

# dota2
npm run proto:build -- --workspaces=dota2 
npm run proto:sync -- --workspaces=dota2

# deadlock
npm run proto:build -- --workspaces=deadlock 
npm run proto:sync -- --workspaces=deadlock
```
