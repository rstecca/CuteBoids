/// FLOW FIELD
function FlowField(_Nx, _Ny, _type) {
  this.Nx = _Nx;
  this.Ny = _Ny;
  this.type = _type;
  this.N = _Nx * _Ny;
  this.xStep = W/_Nx;
  this.yStep = H/_Ny;

  // -------------------------------------------------
  // -------------------------------------------------

  this.make2Darray = function()
  {
    var arr = [];
    for(i=0; i<this.N; i++)
    {
      arr[i] = [];
    }
    return arr;
  }

  this.forces = this.make2Darray();

  // -------------------------------------------------

  this.init = function()
  {
    var noiseScale = 2;
    for(i=0; i<this.Nx; i++)
    {
      for(j=0; j<this.Ny; j++)
      {
        switch(this.type)
        {
          case 0:
            var theta = map(noise(i * noiseScale, j * noiseScale), 0, 1, 0, TWO_PI);
            this.forces[i][j] = p5.Vector.fromAngle(theta);
          break;
          case 1:
            this.forces[i][j] = new p5.Vector(random(-1,1), random(-1,1)).normalize();
        }

      }
    }
  }
  this.init();

  // -------------------------------------------------

  // here we convert a position to discrete cell coordinates
  this.positionToIndex = function(x,y)
  {
    return new p5.Vector(
      floor(x/(this.xStep+0.5)), // add 0.5 to avoid rounding to the last grid cell + 1 and cause an out of bound
      floor(y/(this.yStep+0.5))
    );
  }

    // -------------------------------------------------

  /// should ideally return an interpolated value of all adjacent cells (in quadricentric coordinates)
  this.getForceAtPosition = function(x,y)
  {
    var IJ = this.positionToIndex(x,y);
    return this.getForce(IJ.x, IJ.y);
  }

  // -------------------------------------------------

  /// GET FORCE FROM CELL i,j
  this.getForce = function(i,j)
  {
    return(this.forces[i][j].copy());
  }

  // -------------------------------------------------

  this.setForceAtPosition = function(x,y, force)
  {
    var IJ = this.positionToIndex(x,y);
    this.setForce(IJ.x, IJ.y, force);
  }

  // -------------------------------------------------

  /// SET THE CELL i,j WITH force
  this.setForce = function(i,j,force)
  {
    this.forces[i][j] = force;
  }

  // -------------------------------------------------

  this.sumForceAtPosition = function(x,y, force)
  {
    var IJ = this.positionToIndex(x,y);
    this.sumForce(IJ.x, IJ.y, force);
  }

  // -------------------------------------------------

  /// SUM A FORCE TO TEH CURRENT ONE IN CELL i,j AND NORMALIZE
  this.sumForce = function(i,j,force)
  {
    var __F = this.getForce(i,j);
    if(__F === undefined)
      console.log("Error trying to access force in cell " + i + ", " + j);
    this.setForce(i,j,__F.add(force).normalize());
  }

  // -------------------------------------------------

  this.draw = function()
  {
    //console.log(this.forces[10][10]);
    rectMode(CENTER);
    for(i=0; i<this.Nx; i++)
    {
      for(j=0; j<this.Ny; j++)
      {
        var centerOffset = createVector(this.xStep * 0.5, this.ystep * 0.5);
        var lx = i * this.xStep + centerOffset.x;
        var ly = j * this.yStep + centerOffset.y;
        var _F = this.forces[i][j];
        _F.setMag(10);
        stroke(100);
        fill(150);
        rect(lx, ly, 2,2);
        line(lx, ly, lx + _F.x, ly + _F.y);
      }
    }
  }
}
