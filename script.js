p5.disableFriendlyErrors = true;
let lastMouseX, lastMouseY, runningTime, plot;
const EPSILON = 0.000001;

function sortCounterclockwise(points) {
	// this can likely be simplified to checking whether the difference of the args is
	// greater / less than pi but the goal now is to get it working.
	const cent = Euclid.centroid(points);
	const f = (A, B) => {
		const originA = A.sub(cent), originB = B.sub(cent);
		const reverseAngle = -originA.arg();
		// transform so A is on the positive x axis (arg 0)
		const B2 = originB.rotate(reverseAngle);
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

function oddlySpecificSortingFunction(poly) {
	let indices = [];
	for (let i=0; i<poly.vertices.length; i++) {
		indices[i] = i;
	}
	const newVerts = [];
	const newOuter = [];
	indices = indices.sort((i1, i2) => {
		const A = poly.get(i1).sub(poly.euclideanCentroid);
		const B = poly.get(i2).sub(poly.euclideanCentroid);
		const reverseAngle = -A.arg();
		// transform so A is on the positive x axis (arg 0)
		const B2 = B.rotate(reverseAngle);
		return B2.arg() <= Math.PI;
	});
	for (let j=0; j<indices.length; j++) {
		newVerts[j] = poly.get(indices[j]);
		newOuter[j] = poly.get(indices[j]);
	}
	return {
		verts: newOuter,
		outer: newOuter
	};
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

function toPolyList(pollies) {
	const result = [];
	let temp_result = "\\left[";
	let total = 0;
	for (let p of pollies) {
		total += 1; // for the separating I
		if (total + p.vertices.length >= 10000) {
			result.push(temp_result.slice(0,-1) + "\\right]");
			total = p.vertices.length;
			temp_result = "\\left[" + p.toLatex();
		} else {
			temp_result += p.toLatex();
			total += p.vertices.length;
		}
		temp_result += ",I,";
	}
	result.push(temp_result.slice(0,-1) + "\\right]");
	for (let res of result) {
		console.log(res);
	}
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

	static HASH_REALLENGTH = 11; // half the length of the hash of a single complex number
	static HASH_WEIGHT = 1265055685;
	static HASH_OFFSET = 81913;

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

	toLatex() {
		/* Returns latex representation of the complex number */
		const rx = roundTo(this.re, 3), ry = roundTo(this.im, 3);
		return `\\left(${rx},${ry}\\right)`
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

	static realHash(x) {
		/*
		helper function for hash(). Returns a (non-unique) has representing the real number x
		*/
		x = (x + Complex.HASH_OFFSET) * Complex.HASH_WEIGHT; // ensure e.g. 12 and 120 get different hashes
		let repr = x.toFixed(Complex.HASH_REALLENGTH); // ensure the hash is at at least the required length
		// keep decimal point, if applicable, as an extra measure to distinguish e.g. 12.5 and 1.25. i.e. do not do repr.replace(".", "")
		return repr.slice(0, Complex.HASH_REALLENGTH); // cut the hash to the required length
	}

	hash() {
		/*
		Returns a string hash representing the complex number
		This hash is by no means unique, but it should be sufficient for the purposes of this program.
		It is very unlikely that two distinct complex numbers return the same hash during execution.
		If a hash collision occurs, the program will still produce correct output, but it may experience
		performance hits.

		Obviously, it is not possible to construct an injection from C to the set of fixed length strings
		with a countable (finite) character set, so this is as good as one can expect from a hash function
		*/
		// compute the hashes of the real and complex parts as real numbers
		let re = Complex.realHash(this.re), im = Complex.realHash(this.im);

		// interleave the hashes of the real and imaginary parts
		// let result = "";
		// for (let i=0; i < re.length; i++) {
		// 	result += re[i];
		// 	result += im[i];
		// }
		// return result;

		// concatenate the hashes of the real and imaginary parts
		return re + im;
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

	// static polygon(T, verts) {
	// 	/*
	// 	Evaluates a parameterization of the hyperbolic polygon with given vertices at
	// 	the times in list T.
	// 	let n be the number of vertices.
	// 	polygon(0, verts) = first vertex
	// 	polygon(1 / n, verts) = second vertex
	// 	polygon(2 / n, verts) = third vertex
	// 	...
	// 	polygon(1, verts) = first vertex
	// 	*/
	// 	if (verts.length < 2) {
	// 		console.error("Error: cannot draw polygon with fewer than 2 points");
	// 		return;
	// 	}

	// 	const result = [];
	// 	const n = verts.length;
	// 	verts = verts.slice();
	// 	verts.push(verts[0]);
	// 	let endpoint1, endpoint2, index, proportion, t;
	// 	for (let i=0; i<T.length; i++) {
	// 		t = T[i];
	// 		if (t != 1) {
	// 			index = Math.floor(n * t); // floor(t / (1/n))
	// 			proportion = n * (t % (1 / n));
	// 			// console.log(index, n, t);
	// 			result.push(Poincare.segment(proportion, verts[index], verts[index + 1]));
	// 		} else {
	// 			result.push(verts[0]);
	// 		}
	// 	}
	// 	return result;
	// }

	static polygon(N, verts) {
		// make a hyperbolic polygon with as close to N points as possible while guaranteeing all corners
		if (verts.length < 2) {
			console.error("Error: can't draw polygon with less than 2 points")
		}
		const result = [];
		const nPerSide = Math.ceil(N / verts.length);
		
		verts = verts.slice();
		verts.push(verts[0]);
		for (let i=0; i<verts.length-1; i++) {
			const space = linspace(0, 1, nPerSide);
			for (let value of space) {
				result.push(Poincare.segment(value, verts[i], verts[i+1]));
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

		if (center == null || center.norm() > 1000 || isNaN(center.re) || isNaN(center.im)) {
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

	static toKleinDisk(z) {
		/*
		Take a point z in the Poincaré disk to the Klein disk
		(Inverse stereographic projection to hemisphere then orthogonal projection to disk)
		*/
		const denom = 0.5 * (1 + z.normSq());
		return complex(z.re / denom, z.im / denom);
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
		// this.vertices = sortCounterclockwise(vertices.slice());
		this.vertices = vertices.slice();
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

	hash() {
		/*
		Returns the hash of the euclidean centroid of this polygon
		*/
		return this.euclideanCentroid.hash();
	}

	toLatex() {
		let result = ""
		for (let vert of this.vertices) {
			result += vert.toLatex();
			result += ",";
		}
		return result.slice(0,-1)
	}

	invert() {
		const arr = [];
		if (this.euclideanCentroid.norm() < 0.01) return null;
		for (let vert of this.vertices) {
			arr.push(Poincare.unitCircleInvert(vert));
		}
		return new HyperbolicPolygon(arr);
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
		if (this.model === "half-plane") {
			z = Poincare.inverseCayley(z);
		} else if (this.model === "klein-disk") {
			z = Poincare.toKleinDisk(z);
		}
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
		// const T = linspace(0, 1, N);
		const polyData = Poincare.polygon(N, verts);

		push();

		if (this.showOutlines) {
			strokeWeight(1);
		} else {
			noStroke();
		}

		if (this.showFill) {
			let d;
			const cent = Euclid.centroid(verts);
			if (cent.norm() > 0.99) {
				d = 1;
			} else {
				d = Math.min(10, Poincare.hypDistance(cent, complex(0, 0))) / 10;
			}
			const shade = Math.floor(100 + 128 * d);
			fill(0, shade, 255-shade);
			
			// if (cent.norm() < 0.1) {
			// 	fill(255, 0, 0);
			// } else if (cent.norm() < 0.9) {
			// 	fill(0, 255, 0);
			// } else if (cent.norm() < 1) {
			// 	fill(0,0,255);
			// }
			// else {
			// 	return;
			// 	fill(0, 0, 0);
			// }
			
			// fill(t,0,0,50);
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
		// endShape();
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
			if (res > 2) {
				// const h = i/this.polygons.length * 255;
				const h = poly.chicken ? 255 : 0;
				this.drawHyperbolicPolygon(poly.vertices, res, h);
				// fill(0);
				// const cent = this.coordinateTransform(this.recenter(poly.euclideanCentroid));
				// text(i+"", cent.re,cent.im);
				// if (i == 1) {
				// 	const v1 = this.coordinateTransform(this.recenter(poly.get(0)));
				// 	const v2 = this.coordinateTransform(this.recenter(poly.get(1)));
				// 	fill(255,0,0);
				// 	circle(v1.re,v1.im, 10);
				// 	fill(0,0,255);
				// 	circle(v2.re,v2.im,10);

				// }
				count++;
			}
		}
		// console.log(count, this.polygons.length, roundTo(count / this.polygons.length * 100, 4));
	}

	drawTrianglulatedPolygon(p, q, N=100) {
		let angle, vertices = [];
		const d = Poincare.regPolyDist(p, q);
		for (let i=0; i<p; i++) {
			angle = 2 * i * PI / p + this.startingAngle;
			vertices.push(complex(Math.cos(angle), Math.sin(angle)).scale(d));
		}
		const euclideanCentroid = Euclid.centroid(vertices);
		// this.drawHyperbolicPolygon(vertices, 100);

		/*
		draw a hyperbolic polygon through the vertices in the list verts.
		N defines how many points to sample (the resolution of the polygon)
		*/
		const T = linspace(0, 1, N);
		const polyData = Poincare.polygon(T, vertices);

		push();
		strokeWeight(1);
		fill(0, 128, 128);
		noFill();

		beginShape();
		let transformedPoint, transformedPoints = [];
		for (let point of polyData) {
			transformedPoint = this.coordinateTransform(this.recenter(point));
			vertex(transformedPoint.re, transformedPoint.im);
			transformedPoints.push(transformedPoint);
		}
		transformedPoints.push(transformedPoints[0]);
		endShape(CLOSE);

		// noFill();
		let counter = 0;
		const transformedCent = this.coordinateTransform(this.recenter(euclideanCentroid));
		for (let i=0; i<transformedPoints.length-1; i++) {
			beginShape();
			// console.log(transformedCent);
			vertex(transformedPoints[i].re, transformedPoints[i].im);
			vertex(transformedCent.re, transformedCent.im);
			vertex(transformedPoints[i + 1].re, transformedPoints[i + 1].im);
			endShape(CLOSE);
			counter++;
		}
		// console.log(counter);
		pop();
	}

	generatePQTessellation(p, q, numLayers=null, coverage=0.986) {
		this.polygons = [];
		let angle, vertices = [];
		const d = Poincare.regPolyDist(p, q);

		for (let i=0; i<p; i++) {
			angle = 2 * i * PI / p + this.startingAngle;
			vertices.push(complex(Math.cos(angle), Math.sin(angle)).scale(d));
		}

		const initial = new HyperbolicPolygon(vertices);
		this.polygons.push(initial);
		const centroidTable = new Map();
		centroidTable.set(initial.hash(), 1);

		let iterations = 12-p;
		if (p == 3) iterations = 14;
		let lastLayer = [vertices];
		let count=0;
		for (let i=0; i<iterations; i++) {
			let layer = [];
			for (let vertexSet of lastLayer) {
				for (let k=0; k<vertexSet.length; k++) {
					const newVerts = Poincare.reflectMultiple(vertexSet, vertexSet[k], vertexSet[(k + 1) % vertexSet.length]);
					const newPoly = new HyperbolicPolygon(newVerts);
					const hash = newPoly.hash();
					if (centroidTable.get(hash) === undefined) {					
						centroidTable.set(hash, 1);
						this.polygons.push(newPoly);
						layer.push(newVerts);
					}
					count++;
				}
			}
			lastLayer = layer.slice();
		}
		console.log(this.polygons.length, count);
		this.polysGenerated = true;
	}

	// generatePQTessellation3(p, q, numLayers=null, coverage=0.986) {
	// 	this.polygons = [];
	// 	let angle, vertices = [];
	// 	const d = Poincare.regPolyDist(p, q);

	// 	for (let i=0; i<p; i++) {
	// 		angle = 2 * i * PI / p + this.startingAngle;
	// 		vertices.push(complex(Math.cos(angle), Math.sin(angle)).scale(d));
	// 	}

	// 	const maxWordLength = 10;
	// 	if (maxWordLength > 16) {
	// 		console.error("don't have that many words. use the word generator or just deal ig");
	// 		return;
	// 	}

	// 	const initial = new HyperbolicPolygon(vertices);
	// 	this.polygons.push(initial);
	// 	const centroidTable = new Map();
	// 	centroidTable.set(initial.hash(), 1);

	// 	const l1 = [ // geodesic bisecting first edge
	// 		complex(0, 0),
	// 		complex(Math.cos( this.startingAngle + PI / p ), Math.sin( this.startingAngle + PI / p ))
	// 	];
	// 	const l2 = [ // geodesic bisecting first vertex
	// 		complex(0, 0),
	// 		complex(Math.cos( this.startingAngle ), Math.sin( this.startingAngle ))
	// 	];
	// 	const l3 = [ // first geodesic edge
	// 		vertices[0], vertices[1]
	// 	];
	// 	this.uniqueWords = [];
		
	// 	const wordss = {
	// 		// 5: ["cbabc"],
	// 		// 6: ["cbabca", "cbabcb"],
	// 		// 7: ["cbabcba"]
	// 		7: ["cbcbcbc"],
	// 		8: ["ccbcbcba"]
	// 	};
	// 	// const wordInfo = generateWords(maxWordLength, "abc", p, q);
	// 	const wordInfo = generateWords(maxWordLength, "rfc", p, q);
	// 	const words = wordInfo.words;
	// 	console.log(wordInfo.numWords, "raw");

	// 	for (let k=1; k<=maxWordLength; k++) {
	// 		const kWords = words[k];
	// 		if (kWords === undefined) continue;
	// 		for (let word of kWords) {
	// 			let newVerts = vertices.slice();
	// 			// for (let action of word) {
	// 			// 	if (action === "a") {
	// 			// 		// l1 reflection
	// 			// 		newVerts = Poincare.reflectMultiple(newVerts, l1[0], l1[1]);
	// 			// 	} else if (action === "b") {
	// 			// 		// l2 reflection
	// 			// 		newVerts = Poincare.reflectMultiple(newVerts, l2[0], l2[1]);
	// 			// 	} else {
	// 			// 		// l3 reflection
	// 			// 		newVerts = Poincare.reflectMultiple(newVerts, l3[0], l3[1]);
	// 			// 	}
	// 			// }

	// 			for (let action of word) {
	// 				if (action === "r") {
	// 					newVerts = Poincare.rotateMultiple(newVerts, complex(0, 0), 2 * PI / p);
	// 				} else if (action == "f") {
	// 					newVerts = Poincare.rotateMultiple(newVerts, vertices[0], 2 * PI / q);
	// 				} else {
	// 					newVerts = Poincare.reflectMultiple(newVerts, l3[0], l3[1]);
	// 				}
	// 			}
	// 			const newPoly = new HyperbolicPolygon(newVerts);
	// 			const hash = newPoly.hash();
	// 			if (centroidTable.get(hash) === undefined) {
	// 				this.uniqueWords.push(word);					
	// 				centroidTable.set(hash, 1);
	// 				this.polygons.push(newPoly);

	// 				// for (let ref=0; ref<2; ref++) {
	// 				// 	for (let k=0; k<p; k++) {
	// 				// 		for (let l=0; l<q; l++) {
	// 				// 			let subVerts = Poincare.rotateMultiple(Poincare.rotateMultiple(newVerts.slice(), vertices[0], l * 2 * PI / q),
	// 				// 													complex(0, 0), k * 2 * PI / p);
	// 				// 			if (ref == 0) subVerts = Poincare.reflectMultiple(subVerts, l3[0], l3[1]);
	// 				// 			const subPoly = new HyperbolicPolygon(subVerts);
	// 				// 			const subHash = subPoly.hash();
	// 				// 			if (centroidTable.get(subHash) === undefined) {
	// 				// 				centroidTable.set(subHash, 1);
	// 				// 				this.polygons.push(subPoly);
	// 				// 			}
	// 				// 		}
	// 				// 	}
	// 				// }
	// 			}
	// 		}
	// 	}
	// 	console.log(this.uniqueWords.length, "unique");
	// 	console.log("efficiency: ", this.uniqueWords.length / wordInfo.numWords * 100);
	// 	this.polysGenerated = true;
	// }

	// generatePQTessellation2(p, q, numLayers=null, coverage=0.986) {
	// 	let angle, vertices = [];
	// 	const d = Poincare.regPolyDist(p, q);
	// 	this.polygons = [];

	// 	if (numLayers === null) {
	// 		const hypDistToOrigin = Math.log((1 + d) / (1 - d));
	// 		const hypDistForCoverage = Math.log((1 + coverage) / (1 - coverage));
	// 		numLayers = Math.ceil(hypDistForCoverage / hypDistToOrigin);
	// 		console.log(d, numLayers, Math.log((1 + d) / (1 - d)));
	// 	}

	// 	for (let i=0; i<p; i++) {
	// 		angle = 2 * i * PI / p + this.startingAngle;
	// 		vertices.push(complex(Math.cos(angle), Math.sin(angle)).scale(d));
	// 	}

	// 	const initialPoly = new HyperbolicPolygon(vertices, true);
	// 	const centroidTable = new Map();
	// 	let lastPollies = [initialPoly];
	// 	this.polygons.push(initialPoly);
	// 	centroidTable.set(initialPoly.hash(), 1);
	// 	for (let layer=1; layer<numLayers; layer++) { // for each additional layer past layer 0:
	// 		const newPollies = [];
	// 		for (let poly of lastPollies) { // for each polygon in the last layer:
	// 			for (let i=0; i<poly.length; i++) { // for each vertex of the polygon:
	// 				const index1 = i, index2 = (i + 1) % poly.length;


	// 				// const specIndex = (layer % 2 == 1) ? (Math.min(index1, index2) - 1 + p) % p : (Math.max(index1, index2) + 1 + p) % p;
	// 				// const specIndex = (layer % 2 == 1) ? (index1 - 1 + p) % p : (index2 + 1 + p) % p;
	// 				const specIndex = (layer % 2 == 1) ? (index1 - layer +1 + p) % p : (index2 + layer - 1 + p) % p;

	// 				// const specIndex1 = (Math.min(index1, index2) - 1 + p) % p;
	// 				// const specIndex2 = (Math.max(index1, index2) + 1 + p) % p;
	// 				if (poly.isOuter(index1) && poly.isOuter(index2)) {
	// 					// these two vertices form a reflection edge into the next layer; reflect
	// 					const v1 = poly.get(index1);
	// 					const v2 = poly.get(index2);
	// 					let newPoly = new HyperbolicPolygon(Poincare.reflectMultiple(poly.vertices, v1, v2), false, false);
	// 					let hash = newPoly.hash();

	// 					for (let j=0; j<newPoly.length; j++) {
	// 						if (j !== index1 && j !== index2) {
	// 							newPoly.setOuter(j);
	// 						}
	// 					}

	// 					// add the reflected polygon to the new layer

	// 					if ((centroidTable.get(hash) === undefined) && poly.isOuter(specIndex)) {
	// 					// if (poly.get(specIndex).norm() > poly.euclideanCentroid.norm()) {
	// 					// if (true) {
	// 					// if (poly.isOuter(specIndex1) && poly.isOuter(specIndex2)) {
	// 						// const result = oddlySpecificSortingFunction(newPoly);
	// 						// newPoly.vertices = result.verts;
	// 						// newPoly.outer = result.outer;
	// 						newPollies.push(newPoly);
	// 						this.polygons.push(newPoly);

	// 						// const inverted = newPoly.invert();
	// 						// if (inverted !== null) this.polygons.push(inverted);

	// 						centroidTable.set(hash, 1);
	// 						// console.log(this.polygons.length, specIndex, index1, index2, layer, "drawn");
	// 					} else {
	// 						// console.log("XX", specIndex, index1, index2, layer, "ignored");
	// 					}

	// 					/*
	// 					do the rotations corresponding to one of the vertices of the reflection edge
	// 					we choose as convention the vertex with the highest argument (reflection edges
	// 					are never both on the same radius of the disk - reflecting about a radius remains
	// 					in the same layer)
	// 					*/
	// 					const rotationVertex = sortCounterclockwise([v1, v2])[layer % 2];
	// 					const rotationIndex = (rotationVertex.equals(v1) ? index1 : index2);
	// 					const rotationAngle = (2 * Math.PI) / q;
	// 					for (let k=0; k<q-3; k++) {
	// 						newPoly = new HyperbolicPolygon(Poincare.rotateMultiple(newPoly.vertices, rotationVertex, rotationAngle), false, true);
	// 						hash = newPoly.hash();
	// 						if (centroidTable.get(hash) === undefined) {
	// 							for (let l=0; l<newPoly.length; l++) {
	// 								if (l != rotationIndex) newPoly.setOuter(l);
	// 							}
	// 							// add the rotated polygon to the new layer
	// 							// const result = oddlySpecificSortingFunction(newPoly);
	// 							// newPoly.vertices = result.verts;
	// 							// newPoly.outer = result.outer;
								
	// 							newPollies.push(newPoly);
	// 							this.polygons.push(newPoly);

	// 							// const inverted = newPoly.invert();
	// 							// if (inverted !== null) this.polygons.push(inverted);

	// 							centroidTable.set(newPoly.hash(), 1);
	// 						}
	// 					}
	// 				}
	// 			}
	// 		}
	// 		// advance to next layer
	// 		// lastPollies = sortPolygonsCC(newPollies.slice());
	// 		lastPollies = newPollies.slice();
	// 	}

	// 	this.polysGenerated = true;
	// }

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
		if (this.model == "poincare-disk") {
			stroke(0);
			strokeWeight(1);
			circle(width / 2, height / 2, this.diskPixelSize);
		}

		// this.drawTrianglulatedPolygon(this.p, this.q);
		this.drawPQTessellation();
		fill(255);
		const tessellationCenter = this.coordinateTransform(this.tessellationCenter);
		circle(tessellationCenter.re, tessellationCenter.im, 10);
	}

	update() {
		if (this.needsUpdate) {
			this.draw();
			this.drawIndex = (this.drawIndex + .025) % this.polygons.length;
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