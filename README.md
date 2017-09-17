# Generic Lock Plugin for Homebridge

Just experimenting with Homebridge plugins.

This one is for the lock mechanism at my apartment, which only unlocks briefly to let someone in, then locks again.

In your Homebridge config.json, add this to the "accessories" section:

```
"accessories": [
  {
    "accessory": "MyGenericLock",
    "name":"Front Door",
    "postUrl": "https://your.device/unlock"
  }
]
```
