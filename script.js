p5.disableFriendlyErrors = true;
let lastMouseX, lastMouseY, runningTime, plot;
const EPSILON = 0.000001;

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
}

function mouseReleased() {
	lastMouseX = 0;
	lastMouseY = 0;
}

function draw() {
	plot.update();
	runningTime += 1/frameRate();
}