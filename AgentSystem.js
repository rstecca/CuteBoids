/// An AgentSystem is a set of Agents.
/// It's different from a particle system in that it's ready to implement some individual intelligence that stacks up with the group dynamics.
function AgentSystem(Nagents = 500) {
  this.agents = new Array(Nagents);
  this.flowField = new FlowField(20,20,1);

  // -------------------------------------------------
  // -------------------------------------------------

  this.init = function()
  {
    for(i=0; i<Nagents; i++)
    {
      this.agents[i] = new Agent(createVector(random(0,W), random(0,H)), 1 + random(0,2), 1, this, this.flowField);
    }
  }
  this.init();

  // -------------------------------------------------

  this.update = function()
  {
    for(i=0; i<Nagents; i++)
    {
      this.agents[i].update();
    }
  }

  // -------------------------------------------------

  this.getAgents = function()
  {
    return this.agents;
  }

  this.draw = function()
  {
    this.drawFlowField();
    for(i=0; i<Nagents; i++)
    {
      this.agents[i].draw();
    }
  }

  // -------------------------------------------------

  this.addImpulse = function(position, power)
  {
    for(i=0; i<Nagents; i++)
    {
      this.agents[i].addImpulse(position, power);
    }
  }

  // -------------------------------------------------

  this.drawFlowField = function()
  {
    if(this.flowField === undefined)
    {

    }
    else
    {
      this.flowField.draw();
    }
  }
}
