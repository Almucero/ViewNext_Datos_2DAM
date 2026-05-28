define(['exports', './size-b5dca858', './colorUtils-97321203'], (function(i,t,e){"use strict";const n=["height","maxHeight","maxWidth","minHeight","minWidth","width"],s=i=>n=>{const s=n[i];return e.isNil(n[i])?{}:{[i]:t.sizeToCSS(s)}},o=n.reduce(((i,t)=>Object.assign(i,{[t]:s(t)})),{});i.dimensionInterpolations=o,i.dimensions=n}));
//# sourceMappingURL=dimensions-b9296623.js.map
