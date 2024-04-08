This module was created to create a mechanism for broadcasting events globally (e.g. to all services)

It also resolves the directionality of Events in nest's default system.

For example, for core to listen for scrim updates, it must handle that
with it's own connector library, which breaks where Matchmaking code
should live.