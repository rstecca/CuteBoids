/// Agent class

function Agent(_pos, _mass, _maxSpeed, _agentSystem, _flowField = undefined) {
  this.pos = _pos;
  this.mass = _mass;
  this.F = createVector(0,0);
  this.a = createVector(0,0);
  this.v = createVector(0,0);
  this.agentSystem = _agentSystem;
  this.maxSpeed = _maxSpeed;
  this.flowField = _flowField;
  this.maxSteeringForce = 1;

  // -------------------------------------------------
  // -------------------------------------------------

  this.init = function()
  {
    // nothing particular...
  }
  this.init();

  // -------------------------------------------------

  this.update = function()
  {
    if(mouseX>0 && mouseX<W && mouseY>0 && mouseY<H)
    {
      this.seek(createVector(mouseX, mouseY), true); // follow mouse with ARRIVE behaviour enabled
      //this.flowField.sumForceAtPosition(this.pos.x, this.pos.y, this.F * 0.1);
      //this.separation(this.agentSystem.getAgents(), separationSlider.value());
      this.allreynolds(this.agentSystem.getAgents(), separationSlider.value(), cohesionSlider.value(), alignmentSlider.value());
    }
    else
    {
      this.roam(roamSlider.value());
      this.followFlowField(flowfieldSlider.value(), true);
      //this.separation(this.agentSystem.getAgents(), separationSlider.value() * 4);
      this.allreynolds(this.agentSystem.getAgents(), separationSlider.value() * 2, cohesionSlider.value(), alignmentSlider.value());
    }

    this.integrate();
    this.applyBounds();
  }

  // -------------------------------------------------

  this.draw = function()
  {
    var size = 2 + this.mass * 2.5; // size goes with mass

    // draw head
    fill(255,255,255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, size, size);

    //draw tail
    var r = size * 0.5;
    var theta = this.v.heading() + PI/2;
    push();
    translate(this.pos.x,this.pos.y);
    rotate(theta);
    beginShape();
    vertex(-r, 0);
    vertex(r, 0);
    vertex(0, r*4 * this.v.mag());
    endShape(CLOSE);
    pop();
  }

  // -------------------------------------------------

  /// Physics integration step
  /// Here we go from force to position
  this.integrate = function()
  {
    var _F = this.F.copy();
    this.a = _F.div(this.mass).mult(dt);
    this.v.add(this.a).limit(this.maxSpeed);
    this.pos.add(this.v);
    this.F.mult(0);
  }

  // -------------------------------------------------

  /// Tells whether the Agent is visible
	this.isVisible = function()
	{
		if(this.position.x < W && this.position.x > 0)
		{
			if(this.position.y < H && this.position.y > 0)
			{
				return true;
			}
		}
		return false;
	}

	
	// -------------------------------------------------
	
	/// APPLY FORCE ///
	this.applyForce = function(F1)
	{
		this.F.add(F1);
	}
	
  // -------------------------------------------------

  /// ADDS A SUDDEN IMPULSE THAT FALLS WITH DISTANCE
  this.addImpulse = function(_position, _power)
  {
    var tmpPos = this.pos.copy()
    var diff = tmpPos.sub(_position);
    var d = diff.mag();
    this.F.add(diff.normalize().mult(_power).div(d*0.001));
  }

  /// ----------
  /// BEHAVIOURS
  /// ----------

  // -------------------------------------------------
  /// ROAM ///
  this.roam = function(strength = 1)
  {
    this.applyForce(new p5.Vector(random(-this.mass,this.mass), random(-this.mass,this.mass)).mult(strength));
  }

  // -------------------------------------------------
  /// SEEK ///
  this.seek = function(target, arrive = true)
  {
    var diff = target.sub(this.pos);
    var dm = diff.mag();
    var desired = diff; //diff.limit(this.maxSpeed);
    if(dm < 100 && arrive)
    {
      desired.setMag( map(dm, 0, 100, 0, this.maxSpeed) );
    }
    else
    {
      desired.setMag(this.maxSpeed);
    }
    this.applyForce( p5.Vector.sub(desired , this.v).limit(this.maxSteeringForce) ); // STEERING
  }


  // -------------------------------------------------
  /// FOLLOW FLOW FIELD ///
  this.followFlowField = function(influence = 1, leaveTrace = false)
  {
    if(this.flowField === undefined)
    {
      return;
    }
	
    this.applyForce(this.flowField.getForceAtPosition(this.pos.x, this.pos.y).mult(influence)); // get flow field force
    if(leaveTrace)
    {
      /// WRITE BACK TO THE FLOWFIELD
      if(this.F.mag()>1)
      {
        var tmpF = this.F.copy();
        this.flowField.sumForceAtPosition(this.pos.x, this.pos.y, tmpF.mult(flowfwritebackSlider.value()));
      }
    }
  }

  // -------------------------------------------------
  /// SEPARATE /// Separation only
  this.separation = function(neighbours, sepForce = 2) // neighbours should be found basing on a spatial subdivision to avoid all to all
  {
    var sumF = this.v.copy(); // initialize as current velocity.
    for(n=0; n<neighbours.length; n++)
    {
      var nPos = neighbours[n].pos.copy();
      var d = nPos.sub(this.pos);
      if(d.mag()<50)
        sumF.sub(d);
    }
    this.applyForce(sumF.normalize().mult(sepForce));
  }

  // -------------------------------------------------
  /// ALL REYNOLDS RULES COMPUTED ALL AT ONCE ///
  // Since we are not using any particular optimizations to find neighbours,
  // it is best to find all forces in one go, passing all other agents only once.
  this.allreynolds = function(neighbours, _sepForce = 1, _cohForce = 1, _aliForce = 1)
  {
    var sum_sepForce = this.v.copy(); // initialize as current velocity.
    var sum_cohesion = createVector(0,0);
    var sum_alignment = createVector(0,0);

    for(n=0; n<neighbours.length; n++)
    {
      var nPos = neighbours[n].pos.copy();
      var diff = nPos.sub(this.pos);
      var d = diff.mag();

      if(d < 50)
      {
        // SEPARATION
        sum_sepForce.sub(diff);

        // ALIGNMENT
        sum_alignment.add(neighbours[n].v); // sum velocity instead of force
      }

      // COHESION
      if(d > 40 && d < 100)
        sum_cohesion.add(diff);
    }
	
	// I tweaked the rules a bit to meet a more force based approach
	var sepDesired = sum_sepForce.normalize().mult(_sepForce);
    this.applyForce(sepDesired); // I'm not taking off velocity as I am adding up the intention in a force based manner.
	var cohDesired = sum_cohesion.normalize().mult(_cohForce);
    this.applyForce(cohDesired); // I'm not taking off velocity as I am adding up the intention in a force based manner.
    //this.F.lerp(sum_alignment.x, sum_alignment.y, 0, 0.01); // lerping way
	this.applyForce(sum_alignment.mult(_aliForce));
  }

  // -------------------------------------------------
  /// BOUNDS /// Applies bouncy boundary constraints
  this.applyBounds = function()
  {
    if(this.pos.x < 0)
    {
      this.pos.x = 0;
      this.v.x = -this.v.x;
    }
    else if(this.pos.x > W)
    {
      this.pos.x = W;
      this.v.x = -this.v.x;
    }

    if(this.pos.y < 0)
    {
      this.pos.y = 0;
      this.v.y = -this.v.y;
    }
    else if(this.pos.y > H)
    {
      this.pos.y = H;
      this.v.y = -this.v.y;
    }
  }

}
