# Future plans

- Look into switching to a Wythoff construction approach
- Convert rendering to glsl for use with WebGL
- Allow generation of arbitrary "circle limit"-esque images from pictures uploaded by a user
	- These should also be manipulable in real time, thus the need for WebGL
	- However, the app should allow single renderings at perfect quality for export, or perhaps even animated gifs or mp4s using ffmpeg (Desmodder style).
- Optimize performance at all costs. The goal of this application is to run smoothly in real time on the browser on an average grade device.
	- One easy optimization would be caching generated polygons, as generation is now the bottleneck after the changes that fix overlap. There are <81 tilings to cache due to the limits on p and q.

## If time allows

- Other models of Hyperbolic space
	- Upper half plane (already partly implemented)
	- Klein disk
- Spherical and Euclidean tilings (these are free if Wythoff construction is used)