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