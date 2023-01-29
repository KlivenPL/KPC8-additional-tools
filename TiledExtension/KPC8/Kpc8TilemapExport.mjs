/*
MIT License
Copyright (c) 2020 Egor Nepomnyaschih
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/


/*
KPC8 Tilemap Export
MIT License
2022 Oskar Hacel
*/

const base64abc = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
    "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"
];

function bytesToBase64(bytes) {
    let result = '', i, l = bytes.length;
    for (i = 2; i < l; i += 3) {
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
        result += base64abc[((bytes[i - 1] & 0x0F) << 2) | (bytes[i] >> 6)];
        result += base64abc[bytes[i] & 0x3F];
    }
    if (i === l + 1) { // 1 octet yet to write
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[(bytes[i - 2] & 0x03) << 4];
        result += "==";
    }
    if (i === l) { // 2 octets yet to write
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
        result += base64abc[(bytes[i - 1] & 0x0F) << 2];
        result += "=";
    }
    return result;
}

function toByteArray(map) {
    var bytes = new Uint8Array(40 * 24);
    var alreadySaved = false;

    for (var i = 0; i < map.layerCount; ++i) {
        var layer = map.layerAt(i);
        if (layer.isTileLayer) {
            if (alreadySaved) {
                throw new Error("KPC8 supports only one layer");
            }

            alreadySaved = true;

            if (layer.height != 24 || layer.width != 40) {
                throw new Error("KPC8 supports only 40x24 tilemaps");
            }

            for (var y = 0; y < layer.height; y++) {
                for (var x = 0; x < layer.width; x++) {
                    var tileId = layer.cellAt(x, y).tileId;
                    if (tileId > 255) {
                        throw new Error("KPC8 supports up to 256 tiles IDs");
                    }
                    bytes[y * layer.width + x] = tileId;
                }
            }
        }
    }

    return bytes;
}

var kpc8TilemapFormatBase64 = {
    name: "KPC8 tilemap base64",
    extension: "base64",

    write: function (map, fileName) {
        const bytes = toByteArray(map);
        var file = new TextFile(fileName, TextFile.WriteOnly);
        file.write(bytesToBase64(bytes));
        file.commit();
    },
}

var kpc8TilemapFormatBinary = {
    name: "KPC8 tilemap binary",
    extension: "kpcbin",

    write: function (map, fileName) {
        const bytes = toByteArray(map);
        var file = new BinaryFile(fileName, BinaryFile.WriteOnly);
        file.write(bytes.buffer);
        file.commit();
    },
}

tiled.registerMapFormat("KPC8 Tilemap base64", kpc8TilemapFormatBase64);
tiled.registerMapFormat("KPC8 Tilemap binary", kpc8TilemapFormatBinary);