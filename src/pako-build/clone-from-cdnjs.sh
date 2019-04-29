#!/bin/bash
VER="1.0.10"
DEST="dist"

mkdir -p $DEST

curl https://cdnjs.cloudflare.com/ajax/libs/pako/$VER/pako_deflate.js -o $DEST/pako_deflate.js
curl https://cdnjs.cloudflare.com/ajax/libs/pako/$VER/pako_deflate.min.js -o $DEST/pako_deflate.min.js
curl https://cdnjs.cloudflare.com/ajax/libs/pako/$VER/pako_inflate.js -o $DEST/pako_inflate.js
curl https://cdnjs.cloudflare.com/ajax/libs/pako/$VER/pako_inflate.min.js -o $DEST/pako_inflate.min.js
curl https://cdnjs.cloudflare.com/ajax/libs/pako/$VER/pako.js -o $DEST/pako.js
curl https://cdnjs.cloudflare.com/ajax/libs/pako/$VER/pako.min.js -o $DEST/pako.min.js
