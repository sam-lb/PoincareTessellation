# Poincaré Disk Image Tiling

This is a web application that generates interactive {p, q} tilings in the hyperbolic plane. The model of focus is the Poincaré disk, but the program also supports the Klein disk and the upper half plane.

You can choose a square image to serve as a pattern for a static tiling. We use the Schwarz-Christoffel map and its inverse as part of a process to conformally map square images to regular hyperbolic p-gons.

This program started development as part of a research project in hyperbolic geometry under the mentorship of Dr. Jason DeBlois and with funding from the University of Pittsburgh's Painter Research Fellowship.

## How to run

For index.html: Either run on a local server or just visit the file location in a browser.

For shaders.html: Run an HTML server (using something like `python -m http.server [port]`) and set `PORT=[port]` in shaders.js. Note that this requires software that can run a simple server such as python or node.

## Example

![My cat on the hyperbolic plane](https://raw.githubusercontent.com/sam-lb/PoincareTessellation/master/assets/grid.png)
