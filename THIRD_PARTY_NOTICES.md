# Third-party notices

## OpenChamber SDK (bundled)

`@openchamber/sdk` 2.5.0, MIT License, Copyright (c) 2025 Bohdan Triapitsyn.
Source: <https://github.com/openchamber/openchamber>

The SDK is an npm dependency at build time, and its code is bundled into the
tracked `panel/main.js` and `status/main.js`. Its license text follows.

MIT License

Copyright (c) 2025 Bohdan Triapitsyn

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

## gifenc

`src/vendor/` is a local build of [gifenc](https://github.com/mattdesl/gifenc)
**1.0.3**, by Matt DesLauriers, with the sub-frame support this project uses.
It is vendored because the extension ships a single classic IIFE and does not
install npm dependencies at runtime.

MIT License

Copyright (c) 2021 Matt DesLauriers

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

## Bundled inside gifenc

The vendored encoder also carries these MIT-licensed parts:

- `pnnquant2.js` — Fast pairwise nearest neighbor quantization. Copyright
  (C) 2004–2019 Mark Tyler and Dmitry Groshev; Copyright (c) 2018–2021
  Miller Cy Chan. <https://github.com/mcychan/PnnQuant.js>
- `lzwEncode.js` — LZW encoder. Kevin Weiner, Thibault Imbert,
  Johan Nordberg, Matt DesLauriers, Mathieu Henri, and the authors credited in
  the file header.
- `stream.js`, `palettize.js`, `rgb-packing.js`, `color.js`, `constants.js` —
  part of gifenc, MIT.

## Original idea

The product catalog and the receipts-as-groceries idea come from
[grechka-coding/x5-club-widget](https://github.com/grechka-coding/x5-club-widget).
That repository publishes no license; only the idea and the product
coefficients were reused, not its source code.

## Trademarks

This is an unofficial fan project. X5 and 7-Eleven are trademarks of their
respective owners; this project is not affiliated with or endorsed by them.
Other trademarks belong to their respective owners.
