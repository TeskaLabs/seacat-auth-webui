// Based on https://github.com/apaleyes/penrose-tiling
// LICENCE: MIT License

var GOLDEN_RATIO = 0.6180339887498948482;

// Used to represent both points and vectors for simplicity
var vector = ( x, y ) => {
	return [x, y]
}

var vectorFromPoints = (start, end) => {
	return [(end[0] - start[0]), (end[1] - start[1])];
}

var multiplyVector = (multiplier ,vector) => {
	return [(vector[0] * multiplier), (vector[1] * multiplier)];
}

var add = (vector, anotherVector) => {
	return [(vector[0] + anotherVector[0]), (vector[1] + anotherVector[1])];
}

var draw = (ctx, triangle) => {
	// Store fill style in a temp variable, to set it back later
	var tempFillStyle = ctx.fillStyle;

	ctx.fillStyle = triangle.fillColor;
	ctx.beginPath();
	ctx.moveTo(triangle.v1[0], triangle.v1[1]);
	ctx.lineTo(triangle.v2[0], triangle.v2[1]);
	ctx.lineTo(triangle.v3[0], triangle.v3[1]);
	ctx.lineTo(triangle.v1[0], triangle.v1[1]);
	// ctx.fill();

	ctx.strokeStyle = "rgba(149, 156, 167, 0.15)";
	ctx.lineWidth = 0.5;
	ctx.beginPath();
	ctx.moveTo(triangle.v1[0], triangle.v1[1]);
	ctx.lineTo(triangle.v2[0], triangle.v2[1]);
	ctx.stroke();
	ctx.moveTo(triangle.v1[0], triangle.v1[1]);
	ctx.lineTo(triangle.v3[0], triangle.v3[1]);
	ctx.stroke();

	ctx.fillStyle = tempFillStyle;
}

// thin & thick triangles' fill color
var color2 = '#9bd9eb'
var color1 = '#74c9e8'

var thinLeftTriangle = (v1, v2, v3, fillColor=color2, type='thinLeftTriangle') => {
	return { v1, v2, v3, fillColor, type }
};

var splitThinLeftTriangle = (v1, v2, v3) => {
	var vector_13 = multiplyVector(GOLDEN_RATIO, vectorFromPoints(v1, v3))
	var split_point_13 = add(v1, vector_13)

	let new_triangles = []
	new_triangles.push(thinLeftTriangle(v2, v3, split_point_13));
	new_triangles.push(thickLeftTriangle(split_point_13, v1, v2));

	return new_triangles;
};

var thinRightTriangle = (v1, v2, v3, fillColor=color2, type='thinRightTriangle') => {
	return { v1, v2, v3, fillColor, type }
};

var splitThinRightTriangle = (v1, v2, v3) => {
	var vector_12 = multiplyVector(GOLDEN_RATIO, vectorFromPoints(v1, v2));
	var split_point_12 = add(v1, vector_12);

	let new_triangles = [];
	new_triangles.push(thinRightTriangle(v3, split_point_12, v2));
	new_triangles.push(thickRightTriangle(split_point_12, v3, v1));

	return new_triangles;
};

var thickLeftTriangle = (v1, v2, v3, fillColor=color1, type='thickLeftTriangle') => {
	return { v1, v2, v3, fillColor, type };
};

splitThickLeftTriangle = (v1, v2, v3) => {
	var vector_32 = multiplyVector(GOLDEN_RATIO, vectorFromPoints(v3, v2));
	var split_point_32 = add(v3, vector_32);

	var vector_31 = multiplyVector(GOLDEN_RATIO, vectorFromPoints(v3, v1));
	var split_point_31 = add(v3, vector_31);

	let new_triangles = [];
	new_triangles.push(thickRightTriangle(split_point_31, split_point_32, v3));
	new_triangles.push(thinRightTriangle(split_point_32, split_point_31, v1));
	new_triangles.push(thickLeftTriangle(split_point_32, v1, v2));

	return new_triangles;
};

var thickRightTriangle = (v1, v2, v3, fillColor=color1, type='thickRightTriangle') => {
		return { v1, v2, v3, fillColor, type };
}

splitThickRightTriangle = (v1, v2, v3) => {
	var vector_21 = multiplyVector(GOLDEN_RATIO, vectorFromPoints(v2, v1));
	var split_point_21 = add(v2, vector_21);

	var vector_23 = multiplyVector(GOLDEN_RATIO, vectorFromPoints(v2, v3));
	var split_point_23 = add(v2, vector_23);

	let new_triangles = [];
	new_triangles.push(thickRightTriangle(split_point_23, v3, v1));
	new_triangles.push(thinLeftTriangle(split_point_23, v1, split_point_21));
	new_triangles.push(thickLeftTriangle(split_point_21, v2, split_point_23));

	return new_triangles;
}

function applyBackgroundEffect() {
	// no. of rounds defines pattern's density
	var rounds = 7;
	document.querySelector(".bg-canv")?.remove()
	let main = document.getElementsByClassName("main")[0];
	let canvas = document.createElement("canvas");
	canvas.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -10;";
	canvas.classList.add("bg-canv")
	main.appendChild(canvas);
	var width = window.innerWidth;
	var height = window.innerHeight;
	canvas.width = width;
	canvas.height = height;

	let ctx = canvas.getContext('2d');

	let triangles = [];

	let side = Math.max(canvas.width * 1.35, canvas.height * 1.35);
	let r = side / 2;
	var grad_increment = 36 * (Math.PI / 180);
	var center = vector(width / 2, height / 2);

	// creates large triangles
	for (let i = 0; i < 10; i++) {
		let v1 = add(center, multiplyVector(r, vector(Math.cos(grad_increment * i), Math.sin(grad_increment * i))))
		let v2 =  add(center, multiplyVector(r, vector(Math.cos(grad_increment * (i+1)), Math.sin(grad_increment * (i+1)))));
		let trig_class

		if (i % 2 == 0) {
			trig_class = thinRightTriangle(center, v2, v1);
		} else {
			trig_class = thinLeftTriangle(center, v2, v1);
		}
		triangles.push(trig_class);
	}

	triangles.forEach(function(t){
		draw(ctx, t);
	})

	//creates new fractions of previously created triangles each round
	for (let round = 0; round < rounds; round++) {
		let new_triangles = [];
		for (let i = 0; i < triangles.length; i++) {
			let trig = triangles[i];
			if (trig.type === 'thinLeftTriangle') {
					new_triangles = new_triangles.concat(splitThinLeftTriangle(trig.v1, trig.v2, trig.v3));
				}
			if (trig.type === 'thinRightTriangle') {
					new_triangles = new_triangles.concat(splitThinRightTriangle(trig.v1, trig.v2, trig.v3));
			}
			if (trig.type === 'thickLeftTriangle') {
					new_triangles = new_triangles.concat(splitThickLeftTriangle(trig.v1, trig.v2, trig.v3));
			}
			if (trig.type === 'thickRightTriangle') {
					new_triangles = new_triangles.concat(splitThickRightTriangle(trig.v1, trig.v2, trig.v3));
			}
		}

		triangles = new_triangles;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		triangles.forEach(function(t){
			draw(ctx, t);
		})
	}
}

applyBackgroundEffect();
