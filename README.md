# NUI

**A collection of experiments in interface design and interaction.**

Live studies in interaction, typography, sound, and play by [Adi Dizdarevic](https://adidizdarevic.com/). Each piece asks one question about how software should feel, and answers it as a working interface you can touch.

**Browse the collection live: [adidizdarevic.com/nui](https://www.adidizdarevic.com/nui/)**

## How it's built

Every experiment is a single, self-contained HTML file. No framework, no build step, nothing to install: clone the repo and open any file directly in a browser.

That constraint is the method. One file keeps a study honest (everything it does is on one page), portable (it runs anywhere a browser runs), and readable (view-source is the documentation).

A few house rules run through all of it:

- Hand-rolled canvas and WebGL rendering, 60fps or better
- Motion that settles: exponential easing, nothing springs or bounces for its own sake
- A strict monochrome palette with one charged accent that marks the single element you're acting on
- Sound synthesized in real time with the Web Audio API, never sampled

## The domains

| Folder | The question it asks |
|---|---|
| [`interaction/`](interaction/) | What could dragging, throwing, pressing, and measuring mean? Pointer and gesture mechanics beyond click. |
| [`typography/`](typography/) | What is type that is set live? Kinetic typesetting, including the Pretext line-breaking work. |
| [`games/`](games/) | What happens when an interface has stakes? Real play loops built from the collection's primitives. |
| [`sound/`](sound/) | What if every control had a voice? Interface elements paired with generative real-time sound. |
| [`layout/`](layout/) | What if the arrangement is the animation? Packing, subdivision, and compositional systems. |
| [`canvas/`](canvas/) | Generative motion studies: the render shelf. |
| [`navigation/`](navigation/) | Browsing and wayfinding surfaces. |
| [`intelligence/`](intelligence/) | AI-shaped interfaces. Reserved: this is where the work is headed next. |

The repository holds the published subset of the work. Pieces are published deliberately, one at a time, as they are finished; the curated showcase at [adidizdarevic.com/nui](https://www.adidizdarevic.com/nui/) is the front door, and every piece there is readable via view-source. [`REGISTRY.md`](REGISTRY.md) indexes what is here.

## License and use

© 2024–2026 Adi Dizdarevic. Licensed under [CC BY-NC 4.0](LICENSE).

You are welcome to explore, study, and build on this work for non-commercial purposes, with attribution. For commercial use, or to license a specific piece or engine, get in touch: [adidizdarevic.com](https://adidizdarevic.com/).
