var canvas, music, amplitude, gui, config, ftt, stats;

function preload() {
	music = loadSound('assets/sounds/machinedrum.mp3');
}


var myConfig = function() {
	// amplitude circle
	this.k = 1.5;
	this.m = 1200;
	this.r = 300;
	this.part = 2.0;
	this.rad1 = 1.5;
	this.rad2 = 3.9;
	this.mr1 = 1.2;
	this.mr2 = 2.1;
	this.startSize = -2;
	this.stopSize = 2;
	this.dxConst = 129+0.29;
	this.dyConst = 923+0.29;

};

function setup() {

	stats = new Stats();
	stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild(stats.dom);

	canvas = createCanvas(windowWidth, windowHeight);
	// start / stop the sound when canvas is clicked
	canvas.mouseClicked(function() {
		if(music.isPlaying()) music.pause();
		else music.play();
	});

	config = new myConfig();
	datPanel();

	amplitude = new p5.Amplitude();
	fft = new p5.FFT(0.9);

	particles = [];
	for (var i = 0; i < 100; i++) {
		particles.push(new Particle());
	}

	music.jump(240);
	// music.play();


}



function Particle() {

	this.posX = random(0, windowWidth);
	this.posY = random(0, windowHeight);
	this.initialangle = random(0, 7);
	this.size = random(1, 3);
	this.radius = sqrt(random(pow(width / 2, 2)));
	this.xdirection = 1;
	this.ydirection = 1;

	this.update = function(time, spectrum) {
		// x position follows a circle
		let w = 0.1; // angular speed
		let angle = w * time + this.initialangle;

		// Update the position of the shape
		this.posX = windowWidth / 2 + this.radius * sin(angle) * this.xdirection;

		this.posY += pow(this.size, 0.5) * this.ydirection  * spectrum;

		// Test to see if the shape exceeds the boundaries of the screen
		// If it does, reverse its direction by multiplying by -1
		if (this.posX > (windowWidth - this.radius) || this.posX < this.radius) {
			this.xdirection *= -1;
		}
		if (this.posY > (windowHeight - this.radius) || this.posY < this.radius) {
			this.ydirection *= -1;
		}

	};

	this.display = function() {
	  	ellipse(this.posX, this.posY, this.size);
	};
};


function datPanel() {
	gui = new dat.GUI();
	var circle = gui.addFolder('Circle');
	circle.add(config, 'k', 1, 10);
	circle.add(config, 'm', 1000, 5000);
	circle.add(config, 'r', 10, 500);
	circle.add(config, 'rad2', 0, 15);
	circle.add(config, 'mr2', 0, 15);
}

function draw() {
	
	stats.begin();
	background(0);
	push();

	// loop through snowflakes with a for..of loop
	stroke(255);
/*
	var spectrum = fft.analyze();
	particles.forEach(function(particle, i) {
		particle.update(frameCount / 60, spectrum[i]);
		particle.display();
	});

*/
	/*
	translate(0,0);
	stroke(255);
	beginShape();
	for(var i = 0; i < (spectrum.length/2); i++) {
		var y = map(spectrum[i], 0, 1024, windowHeight, -1024) + noise(map(spectrum[i], 0, 1024, windowHeight, 0));
		vertex(i*(windowWidth/512), y);
	}
	endShape();

   */
	amplitudeCircle();	  
	pop();
	stats.end();
}

function amplitudeCircle() {
	
	translate(windowWidth/2,windowHeight/2);
	level = amplitude.getLevel();
	var size = map(level, 0, 1, config.startSize, config.stopSize, true);

	for(var k=0; k<config.k; k++) {
		for(var i=0; i< config.m; i++) {

			var theta = TWO_PI*i/config.m;

			var l = 1+30*ease(
			  constrain(
				  map(
					noise(15 + config.rad1 * cos(theta), 
					config.rad1 * sin(theta), 
					config.mr1 * cos(TWO_PI),
					config.mr1 * sin(TWO_PI)) + 0.25 * sin(TWO_PI*(0.25)) -0.25,
					-1,
					1,
					-1,
					2
				  ), 0, 1
				), 2.0
			);
			
	  		var p = 1.0*i/config.m;

			var dx = l*noise(
				(config.dxConst)*k + config.rad2*cos(TWO_PI*(size*p)),
				(config.rad2)*sin(TWO_PI*(size*p)),
				(config.mr2)*cos(TWO_PI),
				(config.mr2)*sin(TWO_PI)
			);

      		var dy = l*noise(
				(config.dyConst)*k + config.rad2 * cos(TWO_PI*(size*p)),
				config.rad2*sin(TWO_PI*(size*p)),
				config.mr2*cos(TWO_PI),
				config.mr2*sin(TWO_PI)
			);

		  	var x = ( (config.r) +0.25*k)*cos(theta) + dx;
		  	var y = ( (config.r) +0.25*k)*sin(theta) + dy;

		  
		  	stroke(230, 50);
		  	point(x, y);
		}
	}
	
}

function ease(p) {
  return 3*p*p - 2*p*p*p;
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
