import { createElement, useState } from 'react';

const h = createElement;
const scenes = [
  { id: 'first', title: '初见', sub: '第一束光没有声响，只把玫瑰照亮了一点。', color: '#ffd5e8' },
  { id: 'rose', title: '玫瑰', sub: '花瓣安静层叠，像把一句话藏在心口。', color: '#ff6f9f' },
  { id: 'moon', title: '月光', sub: '月色落在花沿，像一封没有寄出的信。', color: '#ffe3b5' },
  { id: 'aurora', title: '极光', sub: '青绿色的光从远处绕过来，停在玫瑰背后。', color: '#a7fff0' },
  { id: 'future', title: '未来', sub: '一枚柔和的光环，把未来轻轻收住。', color: '#ffbf76' }
];

const petal = (key: string, d: string, fill: string, opacity = 1, stroke = 'rgba(255,220,232,.32)') =>
  h('path', { key, d, fill: `url(#${fill})`, stroke, strokeWidth: 1.1, opacity });

function RoseSvg({ accent }: { accent: string }) {
  return h('svg', { className: 'velvet-rose-svg', viewBox: '0 0 760 760', role: 'img', 'aria-label': 'velvet rose' }, [
    h('defs', { key: 'defs' }, [
      h('radialGradient', { key: 'g1', id: 'roseDeep', cx: '46%', cy: '36%', r: '72%' }, [
        h('stop', { offset: '0%', stopColor: '#ffedf4' }), h('stop', { offset: '32%', stopColor: '#e45a83' }), h('stop', { offset: '70%', stopColor: '#7d1532' }), h('stop', { offset: '100%', stopColor: '#28050f' })
      ]),
      h('linearGradient', { key: 'g2', id: 'roseSoft', x1: '0%', x2: '100%', y1: '0%', y2: '100%' }, [
        h('stop', { offset: '0%', stopColor: '#fff0f6' }), h('stop', { offset: '44%', stopColor: '#ff80ad' }), h('stop', { offset: '100%', stopColor: '#5b0d24' })
      ]),
      h('linearGradient', { key: 'g3', id: 'roseDark', x1: '0%', x2: '100%', y1: '0%', y2: '100%' }, [
        h('stop', { offset: '0%', stopColor: '#cb315f' }), h('stop', { offset: '52%', stopColor: '#67142d' }), h('stop', { offset: '100%', stopColor: '#21050c' })
      ]),
      h('linearGradient', { key: 'g4', id: 'stem', x1: '0%', x2: '100%' }, [
        h('stop', { offset: '0%', stopColor: '#1c402e' }), h('stop', { offset: '50%', stopColor: '#91d6a7' }), h('stop', { offset: '100%', stopColor: '#163625' })
      ]),
      h('filter', { key: 'glow', id: 'softGlow', x: '-30%', y: '-30%', width: '160%', height: '160%' }, [
        h('feGaussianBlur', { stdDeviation: 10, result: 'blur' }), h('feColorMatrix', { in: 'blur', type: 'matrix', values: '1 0 0 0 1  0 0.4 0 0 0.18  0 0 0.8 0 0.32  0 0 0 0.65 0' }), h('feBlend', { in: 'SourceGraphic' })
      ])
    ]),
    h('ellipse', { key: 'halo', cx: 380, cy: 384, rx: 245, ry: 205, fill: accent, opacity: .085, filter: 'url(#softGlow)' }),
    h('g', { key: 'stem', opacity: .95 }, [
      h('path', { d: 'M385 455 C378 530 378 615 395 705', fill: 'none', stroke: 'url(#stem)', strokeWidth: 13, strokeLinecap: 'round' }),
      h('path', { d: 'M392 590 C322 558 280 580 225 628 C292 641 337 630 392 590Z', fill: '#2b6d45', opacity: .78, stroke: 'rgba(210,255,220,.2)' }),
      h('path', { d: 'M394 630 C468 595 520 610 575 655 C510 675 452 666 394 630Z', fill: '#204b35', opacity: .86, stroke: 'rgba(210,255,220,.18)' })
    ]),
    h('g', { key: 'rose', filter: 'url(#softGlow)' }, [
      petal('p1','M382 114 C315 132 270 198 283 270 C228 236 174 246 133 294 C189 319 242 330 292 309 C231 374 238 455 305 501 C329 430 360 380 404 353 C390 428 423 494 493 519 C505 447 492 389 453 351 C523 372 595 342 635 280 C556 271 500 279 452 313 C474 244 448 168 382 114Z','roseDeep',.94),
      petal('p2','M357 151 C301 170 273 226 290 283 C248 270 204 288 174 331 C223 346 265 345 301 322 C264 370 274 426 318 460 C337 407 364 373 402 350 C393 405 421 453 473 472 C482 418 469 378 438 350 C490 357 542 330 570 283 C517 273 475 282 440 311 C451 252 421 185 357 151Z','roseSoft',.96),
      petal('p3','M383 190 C335 193 306 231 314 276 C281 279 252 309 242 352 C282 352 314 341 337 316 C322 358 337 404 373 427 C378 385 392 356 419 335 C424 376 455 408 498 414 C491 376 474 350 447 333 C486 320 511 285 509 241 C470 251 443 271 429 303 C425 249 415 212 383 190Z','roseDeep',.98),
      petal('p4','M376 230 C345 238 329 263 335 295 C311 300 293 323 289 356 C320 350 340 337 353 314 C351 344 370 371 400 382 C397 350 409 327 429 314 C446 340 476 355 508 348 C489 319 466 303 439 301 C459 275 458 245 436 223 C414 246 399 269 396 296 C394 267 389 244 376 230Z','roseSoft',1),
      petal('p5','M393 275 C369 275 353 292 354 316 C338 324 333 345 344 365 C363 353 377 340 382 322 C389 344 411 359 436 358 C429 336 416 322 397 316 C419 306 431 286 425 264 C410 267 399 271 393 275Z','roseDark',1),
      h('circle', { key: 'core', cx: 392, cy: 318, r: 20, fill: '#fff0f6', opacity: .55 })
    ]),
    h('g', { key: 'sparkles', opacity: .85 }, Array.from({ length: 28 }).map((_, i) => {
      const a = i * 2.399; const r = 250 + (i % 7) * 22; const x = 380 + Math.cos(a) * r; const y = 342 + Math.sin(a) * r * .68;
      return h('circle', { key: i, cx: x, cy: y, r: 1.2 + (i % 3), fill: i % 4 ? '#ffd2e4' : accent, opacity: .38 });
    }))
  ]);
}

export function RomanceOrbitApp() {
  const [scene, setScene] = useState(scenes[1]);
  return h('main', { className: 'velvet-stage', style: { ['--accent' as any]: scene.color } }, [
    h('div', { key: 'bg', className: 'velvet-bg' }),
    h('section', { key: 'copy', className: 'velvet-copy' }, [
      h('p', { key: 'eyebrow' }, 'ROMANCE ORBIT · VELVET ROSE'),
      h('h1', { key: 'title' }, scene.title),
      h('p', { key: 'sub' }, scene.sub),
      h('div', { key: 'buttons', className: 'velvet-buttons' }, scenes.map(s => h('button', { key: s.id, className: scene.id === s.id ? 'active' : '', onClick: () => setScene(s) }, s.title)))
    ]),
    h('div', { key: 'rose', className: 'velvet-rose-wrap' }, h(RoseSvg, { accent: scene.color })),
    h('aside', { key: 'card', className: 'velvet-card' }, [
      h('span', { key: 'k' }, 'CURRENT SCENE'),
      h('strong', { key: 't' }, scene.title),
      h('p', { key: 'd' }, scene.sub)
    ])
  ]);
}
