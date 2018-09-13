var canvas, music, amplitude, gui, config, ftt, stats;

function preload() {
	music = loadSound('assets/sounds/machinedrum.mp3');
}


var myConfig = function() {
	// amplitude circle
	this.k = 4;
	this.m = 300;
	this.r = 300;
	this.part = 2.0;
	this.rad1 = 1.5;
	this.rad2 = 3.9;
	this.mr1 = 1.2;
	this.mr2 = 2.1;
	this.startSize = -2;
	this.stopSize = 2;
	this.dxConst = 129.29;
	this.dyConst = 923.29;
	this.lineDistance = 30;

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
		fill(255);
	  	ellipse(this.posX, this.posY, this.size);
	};
};


function datPanel() {
	gui = new dat.GUI();
	var circle = gui.addFolder('Circle');
	circle.add(config, 'k', 1, 10);
	circle.add(config, 'm', 0, 5000);
	circle.add(config, 'r', 10, 500);
	circle.add(config, 'rad1', 0, 15);
	circle.add(config, 'rad2', 0, 15);
	circle.add(config, 'mr2', 0, 15);
	var dots = gui.addFolder('Dots');
	dots.add(config, 'lineDistance', 5, 500);
}

function draw() {
	
	stats.begin();
	background(0);
	// push();

	// loop through snowflakes with a for..of loop
	stroke(200);
	
	var spectrum = fft.analyze();
	particles.forEach(function(particle, i) {
		particle.update(frameCount/200, spectrum[i]);
		particle.display();
		particles.forEach(function(lpart, p) {
			if(particle == lpart) return;
			let dis = int(dist(particle.posX, particle.posY, lpart.posX, lpart.posY));
			if(dis <= config.lineDistance) line(particle.posX, particle.posY, lpart.posX, lpart.posY);
		});
	});

	
	translate(0,0);
	//beginShape();
	for(var i = 0; i < (spectrum.length/2); i++) {
		// var y = map(spectrum[i], 0, 50, windowHeight, -50) + noise(map(spectrum[i], 0, 50, windowHeight, 0));
		// vertex(i*(windowWidth/512), y);
	}
	// endShape();

   
	amplitudeCircle();	  
	// pop();
	stats.end();
}

function amplitudeCircle() {
	
	translate(windowWidth/2,windowHeight/2);

	// retrieve sound info
	level = amplitude.getLevel();
	var size = map(level, 0, 1, config.startSize, config.stopSize, true);

	noFill();
	color(255);
	beginShape();
	
	var frameMap = map((frameCount/60), 0, 100, 0, 300, true);	

	for(var k=0; k<config.k; k++) {
		for(var i=0; i< config.m; i++) {

			var theta = TWO_PI*i/config.m;

			var p = 1.0*i/config.m;

			var l = 1+30*ease(
			  constrain(
				  map(
					noise(
						(config.rad1 * cos(theta)) * size,
						(config.rad2 * sin(theta)) * size
						// config.mr1 * sin(TWO_PI)
					), // + 0.25 * sin(TWO_PI*(0.25)) -0.25, // value
					-1, // start 1
					1, // stop 1
					-1, // start 2
					1, // stop 2
					1
				  ), 0, 1
				)
			);
			
			
			var dx = l*noise(
				(config.dxConst)*k + cos(frameMap),
				sin(frameMap) *sin(TWO_PI/(size*p)),
			);

      		var dy = l*noise(
				(config.dyConst)*k + sin(frameMap),
				cos(frameMap) *sin(TWO_PI/(size*p)),
			);

		  	var x = (config.r) * cos(theta) + dx;
		  	var y = (config.r) * sin(theta) + dy;
		  
		  	stroke(230, 50);
		  	vertex(x, y);
		}
	}
	endShape(CLOSE);
	
}

function ease(p) {
  return 3*p*p - 2*p*p*p;
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
