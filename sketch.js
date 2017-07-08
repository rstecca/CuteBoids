var W = 800;
var H = 500;

var previousTime; // absolute previous time
var dt; // delta time

var AS01;

var separationSlider;
var cohesionSlider;
var alignmentSlider;
var flowfieldSlider;
var roamSlider;

// -------------------------------------------------
// -------------------------------------------------

function setup()
{
  previousTime = new Date().getTime();
  dt = 0.01;
  createCanvas(W, H);
  background(0);
  AS01 = new AgentSystem(100);

  separationSlider = createSlider(0.1,3,2,0.05).parent('separation');
  cohesionSlider   = createSlider(0,3,0.1,0.05).parent('cohesion');
  alignmentSlider  = createSlider(0,1,0,0.05).parent('alignment');
  flowfieldSlider  = createSlider(0,1,1,0.05).parent('flowfield');
  flowfwritebackSlider  = createSlider(0.001,1,0.5,0.05).parent('ffwriteback');
  roamSlider  = createSlider(0,1,1,0.05).parent('roam');
}

// -------------------------------------------------

update = function() // called from draw()
{
  AS01.update();
  updateTime();
}

// -------------------------------------------------

function draw()
{
  update();

  background(0);

  AS01.draw();
}

// -------------------------------------------------

updateTime = function()
{
  // update delta time
  var T = new Date().getTime();
  dt = (T - previousTime) * 0.001;
  previousTime = T;
}

// -------------------------------------------------

function mousePressed()
{
  AS01.addImpulse(createVector(mouseX, mouseY), 5);
}

// -------------------------------------------------

function mouseReleased()
{

}
