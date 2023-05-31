p5.disableFriendlyErrors = true;
let lastMouseX, lastMouseY, runningTime, plot;


function sortClockwise(points) {
	const center = polygonMidpoint(points);
	const f = (A, B) => {
		return Math.atan2(A.y - center.y, A.x - center.x) - Math.atan2(B.y - center.y, B.x - center.x);
	}
	const sorted = points.sort(f);
	return sorted;
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
	return (x < 0) ? 0 : 1;
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
		/* Computes the angle (argument), as a real number measured in radians */
		return Math.atan2(this.im, this.re);
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

	toString() {
		/* Returns the string representation of the complex number as an ordered pair (re(z), im(z)) */
		return `(${this.re},${this.im})`;
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

		// const c1 = plot.coordinateTransform(center);
		// const c2 = plot.coordinateTransform(p1);
		// fill(0);
		// circle(c1.re,c1.im,10);
		// noFill();
		// circle(c1.re, c1.im, 2*dist(c1.re,c1.im,c2.re,c2.im));
		// console.log(p1,p2);

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

}


class Plot {

	constructor(diskSize=0.8, p=5, q=4, tessellationCenter=null) {
		this.setDiskSize(diskSize);
		this.setPQ(p, q);
		this.setStartingAngle(0);
		if (tessellationCenter == null) {
			this.setTessellationCenter(complex(0, 0));
		} else {
			this.setTessellationCenter(tessellationCenter);
		}
		this.setModel("poincare-disk");
		this.needsUpdate = true;
	}

	setDiskSize(diskSize) {
		this.diskSize = diskSize;
		this.maxSquareSize = min(width, height);
		this.halfMaxSquare = this.maxSquareSize / 2;
		this.diskPixelSize = this.maxSquareSize * this.diskSize;

		this.xOffset = width / 2 - this.halfMaxSquare;
		this.yOffset = height / 2 - this.halfMaxSquare;
		this.needsUpdate = true;
	}

	setPQ(p, q) {
		this.p = p;
		this.q = q;
		this.needsUpdate = true;
	}

	setStartingAngle(angle) {
		this.startingAngle = angle;
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

	drawHyperbolicPolygon(verts, N, h=null) {
		/*
		draw a hyperbolic polygon through the vertices in the list verts.
		N defines how many points to sample (the resolution of the polygon)
		*/
		const T = linspace(0, 1, N);
		const polyData = Poincare.polygon(T, verts);

		push();
		strokeWeight(1);
		// noStroke();
		if (h==null) {
			noFill();
		} else {
			fill(h[0], h[1], h[2]);
		}
		beginShape();
		let transformedPoint;
		for (let point of polyData) {
			transformedPoint = this.coordinateTransform(this.recenter(point));
			vertex(transformedPoint.re, transformedPoint.im);
		}
		endShape();
		pop();
	}

	_reflectionEdge(p, q, x) {
		/* Compute the xth reflection edge in a layer of a (p, q) tessellation */
		// yeah (x + p) % p looks ridiculous but for some reason in JS % is remainder, not mod
		const edgeIndex = (Math.abs(x % 2 - 1) - heaviside(x % 6 - 3) + p) % p;
		// const edgeIndex = (Math.abs(x % 2 - 1) - heaviside(x % (q + 1) - (q + 1) / 2) + p) % p;
		return [edgeIndex, (edgeIndex + 1) % p];
	}

	drawPQTessellation(p, q, N) {
		let vertices = [];
		const d = Poincare.regPolyDist(p, q);
		let angle;

		for (let i=0; i<p; i++) {
			angle = 2 * i * PI / p + this.startingAngle;
			vertices.push(complex(Math.cos(angle), Math.sin(angle)).scale(d));
		}

		this.drawHyperbolicPolygon(vertices, p*80, [25,0,0]);
		for (let j=0; j<p; j++) {
			let i0 = j, j0 = (j+1)%p;
			let newVertices = vertices.slice();
			for (let i=0; i<(q-2); i++) {
				newVertices = Poincare.reflectMultiple(newVertices, newVertices[i0], newVertices[j0]);
				const c = 50 + 205 * (j * (q-2) + i) / (p * (q-2));
				this.drawHyperbolicPolygon(newVertices, p*80, [c, 0, 0]);
				i0 = (i0 + pow(-1,i) + p) % p;
				j0 = (j0 + pow(-1,i) + p) % p;
			}
		}
		// vertices = Poincare.reflectMultiple(vertices, vertices[0], vertices[1]);
		// this.drawHyperbolicPolygon(vertices, 1000);

		// let pollies = [vertices];
		// let newPoly;
		// for (let i=0; i<7; i+=3) {
		// 	let newPollies = [];
		// 	for (let poly of pollies) {
		// 		for (let j=0; j<poly.length; j++) {
		// 			newPoly = Poincare.reflectMultiple(poly, poly[j], poly[(j+1)%poly.length]);
		// 			this.drawHyperbolicPolygon(newPoly, 1000);
		// 			newPollies.push(newPoly);
		// 		}
		// 	}
		// 	pollies = newPollies.slice();
		// }


		// let layerEdge = [vertices[0], vertices[1]];
		// vertices = Poincare.reflectMultiple(vertices, layerEdge[0], layerEdge[1]);
		// let reflectEdge = [vertices[1], vertices[2]];
		// let temp;
		// const f=p*(1+q-3)-1;
		// let edge;
		// const l = [
		// 	[1, 2],
		// 	[0, 1],
		// 	[2,3],
		// 	[1,2],
		// 	[3,4],
		// 	[1,2]
		// ];
		// for (let i=0; i<l.length; i++) {
		// 	edge = l[i];
		// 	console.log(edge);
		// 	// edge = this._reflectionEdge(p, q, i);
		// 	reflectEdge = [vertices[edge[0]], vertices[edge[1]]];
		// 	vertices = Poincare.reflectMultiple(vertices, reflectEdge[0], reflectEdge[1]);

		// 	this.drawHyperbolicPolygon(vertices, 1000);
		// 	this.drawHyperbolicPolygon(reflectEdge, 1000, 255);
		// }
		
		// push();
		// fill(255,0,0);
		// circle(this.coordinateTransform(vertices[0]).re, this.coordinateTransform(vertices[0]).im, 10);
		// circle(this.coordinateTransform(vertices[1]).re, this.coordinateTransform(vertices[1]).im, 10);
		// const h = this.coordinateTransform(Poincare.reflect(vertices[3], vertices[0], vertices[1]));
		// circle(h.re, h.im, 10);
		// pop();

		// for (let j=0; j<p; j++) {
		// 	const startI = (j == 0) ? 1 : 2;
		// 	for (let i=startI; i<q; i++) {
		// 		angle = 2 * i * PI / q;
		// 		this.drawHyperbolicPolygon(Poincare.rotateMultiple(vertices, vertices[j], angle), 1000);
		// 	}
		// }

		/*
		idea: generate one loop at a time using reflections in a ring
		like reflect, then reflect the result around the image of the side opposite to the side you reflected by
		(must have a way to identify the two distinct reflection edges (there are always exactly 2!))

		generate the next layer by a reflection through any one of the polygons in that layer
		(must have a way to figure out an edge that is outer)

		I think inner edges, reflection edges, and outer edges can be distinguished as follows:
		let k = # of vertices of the edge that are equal to vertices in a polygon in the previous layer (So k is in 0,1,2)
		if k=0: the edge is an outer edge
		if k=1: the edge is a reflection edge (edge that you can use to seed the successive reflections for a new layer)
		if k=2: the edge is an inner edge (outer edge of previous layer)

		this successive reflection must be performed one less time than there are polygons in that layer
		(the remaining polygon is generated by a reflection from the previous layer)
		
		| layer | #pollies |
		| ---   | ---      |
		| 1     | 1        | (initial polygon)
		| 2     | p+p(q-3) | (p direct reflections from previous layer, q-2 other polygons between them)

		layer 3+ gets really complicated but a closed form is probably attainable with enough thought.
		the alternative is to continue until some empirical check says to stop:
			1. reflect
			2. compute barycenter
			3. compute distance to that layer's initial polygon's barycenter
			4. halt if the distance is under some threshold, continue to next layer
		incidentally this approach also provides a termination condition for the tessellation as a whole.
		by setting the distance threshold to some desired "minimum polygon size" (maybe the distance
		corresponding to 1 or 2 pixels in screen space), the generated tessellation will fill the disk
		to the point where no white space can be seen.
		*/
	}

	draw() {
		background(255);
		noFill();
		stroke(0);
		strokeWeight(1);
		circle(width / 2, height / 2, this.diskPixelSize);

		this.drawPQTessellation(this.p, this.q, 1000);
		fill(255);
		const tessellationCenter = this.coordinateTransform(this.tessellationCenter);
		circle(tessellationCenter.re, tessellationCenter.im, 10);
	}

	update() {
		if (this.needsUpdate) {
			this.draw();
			this.needsUpdate = false;
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