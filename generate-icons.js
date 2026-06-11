// Run: node generate-icons.js
// Generates valid PWA icons as simple colored squares with a heart

const fs = require('fs');

// Minimal PNG generator - creates a solid colored square PNG
function createPNG(size, r, g, b) {
  // PNG file structure
  const width = size;
  const height = size;
  
  // Raw pixel data (RGBA)
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte for each row
    for (let x = 0; x < width; x++) {
      // Create a simple gradient heart shape
      const cx = x - width / 2;
      const cy = y - height / 2.5;
      const heartX = cx / (width / 3);
      const heartY = cy / (height / 3);
      
      // Heart equation: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
      const heart = Math.pow(heartX * heartX + heartY * heartY - 1, 3) - heartX * heartX * heartY * heartY * heartY;
      
      if (heart <= 0) {
        rawData.push(r, g, b, 255); // heart color
      } else {
        rawData.push(30, 15, 25, 255); // dark background
      }
    }
  }

  // Deflate the raw data (use zlib)
  const zlib = require('zlib');
  const deflated = zlib.deflateSync(Buffer.from(rawData));

  // Build PNG
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeBuffer = Buffer.from(type);
    const crc = require('zlib').crc32(Buffer.concat([typeBuffer, data]));
    const crcBuffer = Buffer.alloc(4);
    crcBuffer.writeUInt32BE(crc >>> 0);
    return Buffer.concat([len, typeBuffer, data, crcBuffer]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = chunk('IHDR', ihdr);
  const idatChunk = chunk('IDAT', deflated);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate icons
const icon192 = createPNG(192, 232, 69, 107); // Primary rose color
const icon512 = createPNG(512, 232, 69, 107);

fs.writeFileSync('public/icons/icon-192x192.png', icon192);
fs.writeFileSync('public/icons/icon-512x512.png', icon512);

console.log(`✅ icon-192x192.png: ${icon192.length} bytes`);
console.log(`✅ icon-512x512.png: ${icon512.length} bytes`);
