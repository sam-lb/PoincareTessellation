p5.disableFriendlyErrors = true;
let lastMouseX, lastMouseY, runningTime, plot;
const EPSILON = 0.000001;


function sortCounterclockwise(points) {
	// this can likely be simplified to checking whether the difference of the args is
	// greater / less than pi but the goal now is to get it working.
	const f = (A, B) => {
		const reverseAngle = -A.arg();
		// transform so A is on the positive x axis (arg 0)
		const B2 = B.rotate(reverseAngle);
		return B2.arg() <= Math.PI;
	}
	return points.slice().sort(f);
}

function sortPolygonsCC(polygons) {
	const f = (p1, p2) => {
		const A = p1.euclideanCentroid;
		const B = p2.euclideanCentroid;
		const reverseAngle = -A.arg();
		// transform so A is on the positive x axis (arg 0)
		const B2 = B.rotate(reverseAngle);
		return B2.arg() <= Math.PI;
	}
	return polygons.slice().sort(f);
}

function linspace(min, max, n) {
	/* Returns n equally spaced values between min and max (including endpoints) */
	const result = [];
	const range = max - min;
	for (let i=0; i<n; i++) {
		result.push(min + range * i / (n-1));
	}
	return result;
}

function heaviside(x) {
	/* Computes the Heaviside step function of x */
	return (x < 0) ? 0 : 1;
}

function roundTo(x, places) {
	/* Rounds x to the specified number of places after the decimal */
	return Math.round(x * Math.pow(10, places)) / Math.pow(10, places);
}


class InputHandler {

	static handlePQ() {
		const p = parseInt(document.getElementById("polygon-p").value);
		const q = parseInt(document.getElementById("polygon-q").value);
		document.getElementById("polygon-p-display").innerHTML = p + "";
		document.getElementById("polygon-q-display").innerHTML = q + "";
		plot.setPQ(p, q);
	}

	static handleStartingAngle() {
		const startingAngle = parseFloat(document.getElementById("starting-angle").value);
		document.getElementById("starting-angle-display").innerHTML = startingAngle.toFixed(2);
		plot.setStartingAngle(startingAngle);
	}

	static handleModelSelect() {
		const model = document.getElementById("model-select").value;
		plot.setModel(model);
	}

	static handleRecenter() {
		plot.setTessellationCenter(complex(0, 0));
	}

	static handlePolygonStyling() {
		const showOutlines = document.getElementById("stroke-toggle").checked;
		const showFill = document.getElementById("fill-toggle").checked;
		plot.setPolygonStyle(showOutlines, showFill);
	}

}



class Euclid {

	/*
	Collection of Euclidean geometry functions
	*/

	static lineIntersection(p1, v1, p2, v2) {
		/*
		Computes the intersection of the lines p1 + v1 * t and p2 + v2 * t.
		Returns null if the lines do not intersect.
		*/
		const x1 = p1.re, y1 = p1.im;
		const x2 = p1.re + v1.re, y2 = p1.im + v1.im;
		const x3 = p2.re, y3 = p2.im;
		const x4 = p2.re + v2.re, y4 = p2.im + v2.im;

		const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if (denom == 0) return null;

		const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
		return p1.add(v1.scale(t));
	}

	static midpoint(p1, p2) {
		/*
		Computes the midpoint of p1 and p2
		*/
		return p1.add(p2).scale(0.5);
	}

	static circleCenter(p1, p2, p3) {
		/*
		Computes the center of the circle passing through the three points p1, p2, p3
		*/
		return Euclid.lineIntersection(Euclid.midpoint(p1, p2), p2.sub(p1).perp(),
										Euclid.midpoint(p2, p3), p3.sub(p2).perp());
	}

	static centroid(P) {
		/*
		Computes the centroid of the points in P
		*/
		let xTotal = 0, yTotal = 0;
		for (let point of P) {
			xTotal += point.re;
			yTotal += point.im;
		}
		return complex(xTotal / P.length, yTotal / P.length);
	}

	static distance(p1, p2) {
		/*
		Computes the distance between p1 and p2
		*/
		return p2.sub(p1).norm();
	}

	static project(p1, p2) {
		return p2.scale(p1.dot(p2) / p2.normSq());
	}

}


class Complex {

	/*
	Class for representing complex numbers of the form a + bi
	*/

	constructor(real, imaginary) {
		this.re = real;
		this.im = imaginary;
	}

	conj() {
		/* Computes the complex conjugate */
		return new Complex(this.re, -this.im);
	}

	norm() {
		/* Computes the norm (modulus), as a real number */
		return Math.sqrt(this.re * this.re + this.im * this.im);
	}

	normSq() {
		/* Computes the square of the norm (modulus), as a real number */
		return this.re * this.re + this.im * this.im;
	}

	arg() {
		/*
		Computes the angle (argument), as a real number measured in radians
		0 <= arg(z) < 2 * pi
		*/
		return (Math.atan2(this.im, this.re) + 2 * Math.PI) % (2 * Math.PI);
	}

	unit() {
		/* Computes a unit modulus complex number in the direction of this complex number */
		return this.scale(1 / this.norm());
	}

	scale(k) {
		/* Scales each component by the real constant k */
		return new Complex(this.re * k, this.im * k);
	}

	add(z) {
		/* Computes the sum of this complex number and z */
		return new Complex(this.re + z.re, this.im + z.im);
	}

	sub(z) {
		/* Computes the difference of this complex number and z */
		return new Complex(this.re - z.re, this.im - z.im);	
	}

	mult(z) {
		/* Computes the product of this complex number and z */
		return new Complex(this.re * z.re - this.im * z.im, this.re * z.im + this.im * z.re);
	}

	inv() {
		/* Computes the reciprocal (inverse) */
		return this.conj().scale(1 / this.normSq());
	}

	div(z) {
		/* Computes the quotient of this complex number and z */
		return this.mult(z.inv());
	}

	perp() {
		/* Computes an orthogonal complex number of the same magnitude */
		return new Complex(-this.im, this.re);
	}

	sqrt() {
		/* Computes the principal branch of the square root */
		const normSqrt = Math.sqrt(this.norm());
		const halfArg = 0.5 * this.arg();
		return new Complex(normSqrt * Math.cos(halfArg), normSqrt * Math.sin(halfArg));
	}

	square() {
		/* Computes the square */
		return new Complex(this.re * this.re - this.im * this.im, 2 * this.re * this.im);
	}

	exp() {
		/* Computes the exponential function of this complex number */
		const mag = Math.exp(this.re);
		return new Complex(mag * Math.cos(this.im), mag * Math.sin(this.im));
	}

	ln() {
		/* Computes the principal branch of the natural log */
		return new Complex(Math.log(this.norm()), this.arg());
	}

	acos() {
		/* Computes the principal branch of the inverse cosine */
		this.add(this.square().sub(new Complex(1, 0)).sqrt()).ln().div(complex(0, 1));
	}

	rotate(angle) {
		/* Computes this complex number rotated by angle radians */
		return this.mult((new Complex(0, angle)).exp());
	}

	dot(z) {
		/* Computes the Euclidean dot product of the coefficients of this complex number and z */
		return this.re * z.re + this.im * z.im;
	}

	angleTo(z) {
		/* Computes the angle between this complex number and z */
		/*
		acos u*v/uv = uvcos(t)
		*/
		return Math.acos(this.dot(z) / (this.norm() * z.norm()));
	}

	toString() {
		/* Returns the string representation of the complex number as an ordered pair (re(z), im(z)) */
		return `(${this.re},${this.im})`;
	}

	equals(z) {
		/* Returns true iff z equals this complex number, exactly */
		return (this.re == z.re && this.im == z.im);
	}

	equalsEps(z) {
		/*
		Returns true iff z equals this complex number, within numerical tolerance EPSILON
		For floating point rounding purposes
		*/
		return (Math.abs(this.re - z.re) < EPSILON && Math.abs(this.im - z.im) < EPSILON);
	}

}


function complex(real, imaginary) {
	/* instantiate a Complex without new keyword */
	return new Complex(real, imaginary);
}


class Poincare {

	/* Collection of functions for computations in the poincare disk model of the hyperbolic plane */

	static translatePToOrigin(z, P) {
		/*
		Computes a mobius transformation on z that takes P to 0 and preserves the unit disk
		*/
		return z.sub(P).div(complex(1, 0).sub(P.conj().mult(z)));
	}

	static translateOriginToP(z, P) {
		/*
		Computes a mobius transformation on z taking 0 to P and preserves the unit disk
		(inverse of translatePToOrigin) */
		return z.add(P).div(complex(1, 0).add(P.conj().mult(z)));
	}

	static segment(t, A, B) {
		/*
		Evaluates a parameterization of the geodesic segment between A and B at time t.
		segment(0, A, B) = A.
		segment(1, A, B) = B.
		*/
		return Poincare.translateOriginToP(Poincare.translatePToOrigin(B, A).scale(t), A);
	}

	static line(t, A, B) {
		/*
		Evaluates a parameterization of the geodesic through A and B at time t.
		line(0, A, B) = start of line (beginning point on circle at infinity)
		line(1, A, B) = end of line (terminal point on circle at infinity)
		Note that line(0, A, B) and line(1, A, B) are not actually points on the geodesic.
		*/
		return Poincare.translateOriginToP(Poincare.translatePToOrigin(B, A).unit().scale(2 * t - 1), A);	
	}

	static regPolyDist(p, q) {
		/*
		Computes the (Euclidean) distance to vertices of a regular p-gon with interior
		angle 2*pi/q (for (p, q) tessellation).
		Note: (p-2) * (q-2) must be greater than 4
		*/
		if ((p-2) * (q-2) <= 4) {
			console.error(`Error: cannot compute regular polygon distance for p=${p}, q=${q}`);
			return;
		}

		const tan1 = Math.tan(Math.PI / 2 - Math.PI / q);
		const tan2 = Math.tan(Math.PI / p);
		return Math.sqrt((tan1 - tan2) / (tan1 + tan2));
	}

	static polygon(T, verts) {
		/*
		Evaluates a parameterization of the hyperbolic polygon with given vertices at
		the times in list T.
		let n be the number of vertices.
		polygon(0, verts) = first vertex
		polygon(1 / n, verts) = second vertex
		polygon(2 / n, verts) = third vertex
		...
		polygon(1, verts) = first vertex
		*/
		if (verts.length < 2) {
			console.error("Error: cannot draw polygon with fewer than 2 points");
			return;
		}

		const result = [];
		const n = verts.length;
		verts = verts.slice();
		verts.push(verts[0]);
		let endpoint1, endpoint2, index, proportion, t;
		for (let i=0; i<T.length; i++) {
			t = T[i];
			if (t != 1) {
				index = Math.floor(n * t); // floor(t / (1/n))
				proportion = n * (t % (1 / n));
				// console.log(index, n, t);
				result.push(Poincare.segment(proportion, verts[index], verts[index + 1]));
			} else {
				result.push(verts[0]);
			}
		}
		return result;
	}

	static rotate(z, P, angle) {
		/* Computes the hyperbolic rotation of z about P by angle radians */
		return Poincare.translateOriginToP(Poincare.translatePToOrigin(z, P, true).rotate(angle), P, true);
	}

	static rotateMultiple(Z, P, angle) {
		/* Computes the hyperbolic rotation of all the points in Z about P by angle radians */
		const result = [];
		for (let vert of Z) {
			result.push(this.rotate(vert, P, angle));
		}
		return result;
	}

	static unitCircleInvert(z) {
		/* Computes the inversion of z through the unit circle */
		return z.conj().inv();
	}

	static circleInvert(z, r, P) {
		/* Computes the inversion of z through the circle of radius r centered at P */
		return P.add(complex(r * r, 0).div(z.sub(P).conj()));
	}

	static reflect(z, p1, p2) {
		/* Computes the inversion of z through the geodesic passing through p1 and p2 */
		const center = Euclid.circleCenter(p1, p2, Poincare.unitCircleInvert(p1));

		if (center == null || center.norm() > 1000) {
			// the points are presumably on a radial line through the origin
			return p1.add(Euclid.project(z.sub(p1), p2.sub(p1))).scale(2).sub(z);
		}
		return Poincare.circleInvert(z, Euclid.distance(p1, center), center);
	}

	static reflectMultiple(Z, p1, p2) {
		/* Computes the inversion of all points in Z through the geodesic passing through p1 and p2 */
		const result = [];
		for (let vert of Z) {
			result.push(this.reflect(vert, p1, p2));
		}
		return result;
	}

	static inverseCayley(z) {
		/*
		Inverse of the Cayley transform (map from upper half plane to unit disk)
		See https://en.wikipedia.org/wiki/Cayley_transform#Complex_homography
		and https://www.desmos.com/calculator/ucug6yw6bh
		*/
		const one = complex(1, 0);
		return one.add(z).div(one.sub(z)).mult(complex(0, 1));
	}

	static hypDistance(z1, z2) {
		/*
		Given two points, compute the hyperbolic distance between them according to the Poincare metric
		*/
		const z = z1.sub(z2);
		const euclideanDistanceToOrigin = z.norm();
		return Math.log((1 + euclideanDistanceToOrigin) / (1 - euclideanDistanceToOrigin));
	}

}


class HyperbolicPolygon {

	constructor(vertices, initiallyOuter=false, chicken=false) {
		this.vertices = sortCounterclockwise(vertices.slice());
		this.outer = [];
		for (let i=0; i<this.vertices.length; i++) {
			this.outer[i] = initiallyOuter;
		}
		this.length = this.vertices.length;
		this.chicken = chicken;

		this.euclideanCentroid = Euclid.centroid(this.vertices);
	}

	setOuter(i) {
		this.outer[i] = true;
	}

	get(i) {
		return this.vertices[i];
	}

	isOuter(i) {
		return this.outer[i];
	}

}


class Plot {

	constructor(diskSize=0.8, p=5, q=4, tessellationCenter=null, maxSamplesPerEdge=350) {
		this.setDiskSize(diskSize);
		this.setPQ(p, q);
		this.setStartingAngle(0);
		if (tessellationCenter == null) {
			this.setTessellationCenter(complex(0, 0));
		} else {
			this.setTessellationCenter(tessellationCenter);
		}
		this.setModel("poincare-disk");

		this.polygons = [];
		this.polysGenerated = false;
		this.maxSamplesPerEdge = maxSamplesPerEdge;

		this.showOutlines = true;
		this.showFill = true;

		this.needsUpdate = true;
		this.drawIndex = 0;
	}

	setDiskSize(diskSize) {
		this.diskSize = diskSize;
		this.maxSquareSize = min(width, height);
		this.halfMaxSquare = this.maxSquareSize / 2;
		this.diskPixelSize = this.maxSquareSize * this.diskSize;

		this.xOffset = width / 2 - this.halfMaxSquare;
		this.yOffset = height / 2 - this.halfMaxSquare;
		this.polysGenerated = false;
		this.needsUpdate = true;
	}

	setPQ(p, q) {
		this.p = p;
		this.q = q;
		this.polysGenerated = false;
		this.needsUpdate = true;
	}

	setStartingAngle(angle) {
		this.startingAngle = angle;
		this.polysGenerated = false;
		this.needsUpdate = true;
	}

	setTessellationCenter(tessellationCenter) {
		this.tessellationCenter = tessellationCenter;
		this.needsUpdate = true;
	}

	setModel(model) {
		this.model = model;
		this.needsUpdate = true;
	}

	setPolygonStyle(outlines, fill) {
		this.showOutlines = outlines;
		this.showFill = fill;
		this.needsUpdate = true;
	}

	onResize() {
		this.setDiskSize(this.diskSize);
		this.needsUpdate = true;
	}

	recenter(z) {
		return Poincare.translateOriginToP(z, this.tessellationCenter);
	}

	coordinateTransform(z) {
		/* Convert from Cartesian space to pixel space */
		if (this.model === "half-plane") z = Poincare.inverseCayley(z);
		return complex(this.xOffset + this.halfMaxSquare * (1 + z.re * this.diskSize),
						this.yOffset + this.halfMaxSquare * (1 - z.im * this.diskSize));
	}

	reverseCoordinateTransform(p) {
		/* Convert from pixel space to Cartesian space */
		return complex(((p.re - this.xOffset) / this.halfMaxSquare - 1) / this.diskSize,
						(1 - (p.im - this.yOffset) / this.halfMaxSquare) / this.diskSize);
	}

	drawHyperbolicPolygon(verts, N, t=255) {
		/*
		draw a hyperbolic polygon through the vertices in the list verts.
		N defines how many points to sample (the resolution of the polygon)
		*/
		const T = linspace(0, 1, N);
		const polyData = Poincare.polygon(T, verts);

		push();

		if (this.showOutlines) {
			strokeWeight(1);
		} else {
			noStroke();
		}

		if (this.showFill) {
			// const cent = Euclid.centroid(verts);
			// const d = Math.min(10, Poincare.hypDistance(cent, complex(0, 0))) / 10;
			// const shade = Math.floor(100 + 128 * d);
			// fill(0, shade, 255-shade);
			
			fill(t,0,0,50);
		} else {
			noFill();
		}

		beginShape();
		let transformedPoint;
		for (let point of polyData) {
			transformedPoint = this.coordinateTransform(this.recenter(point));
			vertex(transformedPoint.re, transformedPoint.im);
		}
		endShape(CLOSE);
		pop();
	}

	drawPQTessellation() {
		if (!this.polysGenerated) {
			this.generatePQTessellation(this.p, this.q);
		}

		let count = 0;
		// for (let i=0; i<this.drawIndex; i++) {
		for (let i=0; i<this.polygons.length; i++) {
			const poly = this.polygons[i];
			const res = this.calculateResolution(poly);
			if (res > 10) {
				// const h = i/this.polygons.length * 255;
				const h = poly.chicken ? 255 : 0;
				this.drawHyperbolicPolygon(poly.vertices, res, h);
				count++;
			}
		}
		// console.log(count, this.polygons.length, roundTo(count / this.polygons.length * 100, 4));
	}

	generatePQTessellation(p, q, numLayers=3) {
		let angle, vertices = [];
		const d = Poincare.regPolyDist(p, q);
		this.polygons = [];

		for (let i=0; i<p; i++) {
			angle = 2 * i * PI / p + this.startingAngle;
			vertices.push(complex(Math.cos(angle), Math.sin(angle)).scale(d));
		}

		const initialPoly = new HyperbolicPolygon(vertices, true);
		let lastPollies = [initialPoly];
		this.polygons.push(initialPoly);
		for (let layer=1; layer<numLayers; layer++) { // for each additional layer past layer 0:
			const newPollies = [];
			for (let poly of lastPollies) { // for each polygon in the last layer:
				for (let i=0; i<poly.length; i++) { // for each vertex of the polygon:
					const index1 = i, index2 = (i + 1) % poly.length;
					const specIndex = (layer % 2 == 1) ? (Math.min(index1, index2) - 1 + p) % p : (Math.max(index1, index2) + 1 + p) % p;
					if (poly.isOuter(index1) && poly.isOuter(index2)) {
						// these two vertices form a reflection edge into the next layer; reflect
						const v1 = poly.get(index1);
						const v2 = poly.get(index2);
						let newPoly = new HyperbolicPolygon(Poincare.reflectMultiple(poly.vertices, v1, v2), false, false);

						for (let j=0; j<newPoly.length; j++) {
							if (j !== index1 && j !== index2) {
								newPoly.setOuter(j);
							}
						}

						// add the reflected polygon to the new layer

						if (poly.isOuter(specIndex)) {
							newPollies.push(newPoly);
							this.polygons.push(newPoly);
						}

						/*
						do the rotations corresponding to one of the vertices of the reflection edge
						we choose as convention the vertex with the highest argument (reflection edges
						are never both on the same radius of the disk - reflecting about a radius remains
						in the same layer)
						*/
						const rotationVertex = sortCounterclockwise([v1, v2])[layer % 2];
						const rotationIndex = (rotationVertex.equals(v1) ? index1 : index2);
						const rotationAngle = (2 * Math.PI) / q;
						for (let k=0; k<q-3; k++) {
							newPoly = new HyperbolicPolygon(Poincare.rotateMultiple(newPoly.vertices, rotationVertex, rotationAngle), false, true);
							for (let l=0; l<newPoly.length; l++) {
								if (l != rotationIndex) newPoly.setOuter(l);
							}
							// add the rotated polygon to the new layer
							newPollies.push(newPoly);
							this.polygons.push(newPoly);
						}
					}
				}
			}
			// advance to next layer
			lastPollies = sortPolygonsCC( newPollies.slice());
		}

		this.polysGenerated = true;
	}

	calculateResolution(poly) {
		/*
		Given a polygon, this calculates an estimate for the minimum resolution (samples per edge)
		at which the polygon can be drawn (apparently) faithfully to the screen given its size in
		pixel space
		*/
		const roughSize = Euclid.distance(this.recenter(poly.euclideanCentroid),
										this.recenter(poly.vertices[0]));
		return Math.max(3, Math.floor(this.maxSamplesPerEdge * roughSize * poly.length));
	}

	draw() {
		background(255);
		noFill();
		stroke(0);
		strokeWeight(1);
		circle(width / 2, height / 2, this.diskPixelSize);

		this.drawPQTessellation();
		fill(255);
		const tessellationCenter = this.coordinateTransform(this.tessellationCenter);
		circle(tessellationCenter.re, tessellationCenter.im, 10);
	}

	update() {
		if (this.needsUpdate) {
			this.draw();
			this.drawIndex = (this.drawIndex + .1) % this.polygons.length;
			this.needsUpdate = true;
		}
	}

}





function setup() {
	const canvas = createCanvas(windowWidth*.7, windowHeight);
	canvas.parent("canvas-div");
	document.getElementById("gui-div").style.height = windowHeight.toString() + "px";

	lastMouseX = mouseX;
	lastMouseY = mouseY;
	runningTime = 0;

	plot = new Plot();
	InputHandler.handlePQ();
	InputHandler.handleStartingAngle();
	InputHandler.handleModelSelect();
	InputHandler.handlePolygonStyling();

	// test();
}

function test() {

	z1 = complex(0, 1);
	z2 = complex(3, -2);

	console.log(z1+"");
	console.log(z1.conj()+"");
	console.log(z1.norm()+"");

	console.log(z2+"");
	console.log(z2.conj()+"");
	console.log(z2.norm()+"");

}

function windowResized() {
  resizeCanvas(windowWidth * 0.7, windowHeight);
  document.getElementById("gui-div").style.height = windowHeight.toString() + "px";
  plot.onResize();
}

function mouseDragged() {
	if ((0 <= mouseX && mouseX <= width) && (0 <= mouseY && mouseY <= height)) {
		lastMouseX = mouseX;
		lastMouseY = mouseY;
		let cartMouse = plot.reverseCoordinateTransform(complex(mouseX, mouseY));
		cartMouse = (cartMouse.normSq() <= 0.9025) ? cartMouse : cartMouse.unit().scale(0.95);
		plot.setTessellationCenter(cartMouse);
	}
}

function mousePressed() {
	if ((0 <= mouseX && mouseX <= width) && (0 <= mouseY && mouseY <= height)) {
		lastMouseX = mouseX;
		lastMouseY = mouseY;
		let cartMouse = plot.reverseCoordinateTransform(complex(mouseX, mouseY));
		cartMouse = (cartMouse.normSq() <= 0.9025) ? cartMouse : cartMouse.unit().scale(0.95);
		plot.setTessellationCenter(cartMouse);
	}
	// console.log(plot.reverseCoordinateTransform(complex(mouseX, mouseY)) + "");
}

function mouseReleased() {
	lastMouseX = 0;
	lastMouseY = 0;
}

function draw() {
	plot.update();
	runningTime += 1/frameRate();
}