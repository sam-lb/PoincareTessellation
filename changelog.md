# Changelog for this project

*Note: changes before June 09, 2023 are not recorded*

## 06/09/2023

- Fixed a bug with polygon generation that caused rotations to be performed in the wrong direction in certain layers
- Big performance updates (these will still help once converted to WebGL):
	- Polygon vertex positions are now cached instead of being recomputed at each redraw
	- Polygon edge resolution adapts to how large it appears on the screen. Note that this may not work properly in upper half plane mode. The tool is primarily designed for the projective disk model, though this will likely be fixed in the future.
		- If a polygon is sufficiently small, it is removed completely. This is a *massive* performance gain. For high values of p and q, this cuts back a huge amount of the rendering. For example, with (p, q) = (9, 9), it renders on average rougly 0.25% of the polygons generated for the tessellation at any given time.
- Updated polygon generation so the tessellation fills the entire disk with little overlap.
- Created changelog

## 06/10/2023

- Fixed a bug causing some hyperbolic polygons to be drawn incorrectly
- Added polygon shading based on distance according to the Poincare disk Riemannian metric
- Added a UI for toggling polygon shading and outlines

# 06/11/2023

- Added code to animate the generation of polygons
- Added option for polygon coloring based on the way it was generated (reflection or rotation)
- Reduced the amount of overlap
	- Removed one of the causes of overlap: two reflections or a reflection and a rotation causing a polygon to be generated twice where two of the polygons in the previous layer share an edge 

# 06/12/2023

- Fixed a bug in the updated polygon generation algorithm implemented yesterday causing overlap. Tilings are now rendered to the third layer without any overlap at all for all values of p and q.