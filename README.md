# Generic Lock Plugin for Homebridge

This is a fork from philipkocandas Homebridge Plugin.
I added HTTPS Support, Basic HTTP Authentication and updated the Readme.

This one is for the lock mechanism at my apartment, which only unlocks briefly to let someone in, then locks again.

In your Homebridge config.json, add this to the "accessories" section:

```
"accessories": [
  {
    "accessory": "GenericLock",
    "name": "Front Door",
    "postUrl": "https://your.device:3000/open",
    "key": "/location/to/key.pem",
    "cert": "/location/to/cert.pem",
    "passphrase": "supersecret",
    "username": "John",
    "password": "supersecret"
  }
]
```

# Changelog

## 0.0.26

- HTTPS Support (@bushco)
