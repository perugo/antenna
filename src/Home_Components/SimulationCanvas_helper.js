
import { useState, useEffect } from 'react';

export const useFDTDInput = (simulationData) => {
  const [FDTD_Input, setFDTDInput] = useState({});

  useEffect(() => {
    if (!checker_SIMULATIONDATA(simulationData)) return;
    const object = makeFDTDInput(simulationData);
    setFDTDInput(object);
  }, [simulationData]);

  return FDTD_Input;
}

function checker_SIMULATIONDATA(obj) {
  if (!obj) return false;
  const antennaFields = ['DomainWidLambda', 'antGap', 'phase'];
  const spatialFields = ['deltaXLambda', 'lambda'];
  const requiredAmplitudeScalerFields = ['Select', 'simulationNum', 'SineWave', 'Pulse'];
  const sinewaveFields = ['slope', 'shift'];
  const pulseFields = ['peakPosition', 'widthFactor'];
  const requiredFields = {
    antenna: (data) => {
      if (!data || !antennaFields.every(field => typeof data[field] === 'number')) return false;
      if (data.antGap >= data.DomainWidLambda) return false;
      return true;
    },
    spatial: (data) => {
      return data && spatialFields.every(field => typeof data[field] === 'number')
    },
    color: (data) => {return true
    },
    amplitudeScaler: (data) => {
      if (!data) return false;
      if (!requiredAmplitudeScalerFields.every(field => data[field] !== undefined)) return false;
      const { SineWave, Pulse } = data;
      if (!sinewaveFields.every(field => typeof SineWave[field] === 'number')) return false;
      if (!pulseFields.every(field => typeof Pulse[field] === 'number')) return false;
      return true;
    },
  }
  for (const [key, validator] of Object.entries(requiredFields)) {
    if (!validator(obj[key])) return false;
  }

  return true;
}
function makeFDTDInput(data) {
  const c = 3.0e8;
  const lpml = 20;
  const { DomainWidLambda, antGap, phase } = data.antenna;
  const { lambda, deltaXLambda } = data.spatial;

  const pec = Math.floor(DomainWidLambda * deltaXLambda);
  const halfAntGap = deltaXLambda * antGap / 2.0;
  const sourcey = lpml + Math.floor(pec / 2.0);
  const feq = c / lambda;

  const left_pulse = {
    x: lpml + Math.floor(pec / 2 - halfAntGap),
    y: sourcey,
    phase: 0
  };
  const right_pulse = {
    x: lpml + Math.floor(pec / 2 + halfAntGap),
    y: sourcey,
    phase: phase
  };
  const feedPoints = [left_pulse, right_pulse];
  const obj = {
    nx: pec + 2 * lpml,
    ny: pec + 2 * lpml,
    lpml: lpml,
    lattice_width: lambda / deltaXLambda,
    feq: feq,
    deltaXLambda:deltaXLambda,
    color: data.color,
    amplitudeScaler: data.amplitudeScaler,
    FeedPoints: feedPoints
  };
  return obj;
}
export function checker_FDTDINPUT(obj1) {
  if (!obj1) return false;
  const fields = ['nx', 'ny', 'lpml', 'lattice_width', 'feq', 'color', 'amplitudeScaler', 'FeedPoints','deltaXLambda'];
  if (!fields.every(field => obj1.hasOwnProperty(field))) {
    return false;
  }
  return true;
}
export class ColorCode {
  m;
  colormap;
  constructor(max,index) {
    this.m = max;
    this.colormap = new Array(200);
    this.calculateColors(index);
  }
  setM(max) {
    this.m = max;
  }
  calculateColors(index) {
    let r, g, b;

    let slopeF;
    let shiftF;
    let slopeL;
    let shiftL;
    if(index===0){
      slopeF = -0.2;
      shiftF = 27.0;
      slopeL = -0.08;
      shiftL = 73.0;
    }else{
      slopeF = -0.25;
      shiftF = 29.0;
      slopeL = -0.08;
      shiftL = 73.0;
    }
    for (let i = 0; i < 100; i++) {
      b = 255;
      r = Math.round(255.0 - 255.0 / (1 + Math.exp(slopeF * (i - shiftF))));
      g = Math.round(255.0 - 255.0 / (1 + Math.exp(slopeL * (i - shiftL))));
      this.colormap[100 - i] = `rgb(${r},${g},${b})`;
    }
    for (let i = 0; i < 100; i++) {
      r = 255;
      b = Math.round(255.0 - 255.0 / (1 + Math.exp(slopeF * (i - shiftF))));
      g = Math.round(255.0 - 255.0 / (1 + Math.exp(slopeL * (i - shiftL))));
      this.colormap[100 + i] = `rgb(${r},${g},${b})`;
    }
  }

  give(value) {
    let v = value / this.m;
    if (v >= 1.0) v = 1.0;
    if (v <= -1.0) v = -1.0;
    const intv = Math.round(v * 99.0) + 100;
    return !isNaN(value) ? this.colormap[intv] : 'rgb(0,0,0)';
  }
}

export class FDTD2D_PML {
  c;
  nx;
  ny;
  lattice_width;
  lpml;
  FeedPoints;
  simulationNum;
  t;
  Ez; Ezx; Ezy;
  Hx; Hy;
  ae; be; am; bm;
  aexpml; bexpml; amxpml; bmxpml; aeypml; beypml; amypml; bmypml;
  pmlBlocks;
  amplitudeScaler;
  feq;

  constructor(fdtd_input) {
    if (!checker_FDTDINPUT(fdtd_input)) {
      console.error("AT FDTD2D_PML　無効なFDTD_INPUTの入力がありました");
      console.error(fdtd_input);
    }
    console.log(fdtd_input);
    var c = 3.0e8;
    this.nx = fdtd_input.nx;
    this.ny = fdtd_input.ny;
    this.lattice_width = fdtd_input.lattice_width;
    this.lpml = fdtd_input.lpml;
    this.FeedPoints = fdtd_input.FeedPoints;
    this.amplitudeScaler = fdtd_input.amplitudeScaler;
    this.feq = fdtd_input.feq;

    this.dt = (this.lattice_width / (c * Math.sqrt(2))) * 0.9;
    this.simulationNum = 0;
    this.t = 0;
    /* thisを省く為に thisで宣言した変数と重なるvar変数 を宣言する*/
    var nx = this.nx;
    var ny = this.ny;
    var lpml = this.lpml;
    var lattice_width = this.lattice_width;
    var E0 = 8.8541878128e-12;  //真空中の誘電率[F/m]
    var M0 = 1.2566370621e-6; //真空中の透磁率 [H/m]
    var dt = this.dt;


    this.Ez = Array.from({ length: nx }).map(() => Array.from({ length: ny }).fill(0));
    this.Ezx = Array.from({ length: nx }).map(() => Array.from({ length: ny }).fill(0));
    this.Ezy = Array.from({ length: nx }).map(() => Array.from({ length: ny }).fill(0));
    this.Hx = Array.from({ length: nx }).map(() => Array.from({ length: ny }).fill(0));
    this.Hy = Array.from({ length: nx }).map(() => Array.from({ length: ny }).fill(0));

    this.ae = Array.from({ length: nx }).map(() => Array.from({ length: ny }).fill(0));
    this.be = Array.from({ length: nx }).map(() => Array.from({ length: ny }).fill(0));
    this.am = Array.from({ length: nx }).map(() => Array.from({ length: ny }).fill(0));
    this.bm = Array.from({ length: nx }).map(() => Array.from({ length: ny }).fill(0));
    var de = dt / E0 / lattice_width;
    var dm = dt / M0 / lattice_width;
    for (var i = 0; i < nx - 1; i++) {
      for (var n = 0; n < ny - 1; n++) {
        this.ae[i][n] = 1.0;
        this.be[i][n] = de;
        this.am[i][n] = 1.0;
        this.bm[i][n] = dm;
      }
    }

    this.aexpml = new Array(nx).fill(0);
    this.bexpml = new Array(nx).fill(0);
    this.amxpml = new Array(nx).fill(0);
    this.bmxpml = new Array(nx).fill(0);
    this.aeypml = new Array(ny).fill(0);
    this.beypml = new Array(ny).fill(0);
    this.amypml = new Array(ny).fill(0);
    this.bmypml = new Array(ny).fill(0);

    var order = 4.0;
    var pml_conductivity_max = -(E0 / (2.0 * dt)) * (-8.0) * (order + 1.0) / lpml;
    var pml_magnetic_max = (M0 / E0) * pml_conductivity_max;
    this.pmlBlocks = [];
    this.pmlBlocks.push({ sx: 0, sy: 0, ex: lpml, ey: ny });
    this.pmlBlocks.push({ sx: nx - lpml, sy: 0, ex: nx, ey: ny });
    this.pmlBlocks.push({ sx: lpml, sy: 0, ex: nx - lpml, ey: lpml });
    this.pmlBlocks.push({ sx: lpml, sy: ny - lpml, ex: nx - lpml, ey: ny });

    const set_pml = () => {
      var tmp_aepml = 1.0;
      var tmp_bepml = dt / E0 / lattice_width;
      var tmp_ampml = 1.0;
      var tmp_bmpml = dt / M0 / lattice_width;

      for (var i = 0; i < this.nx; i++) {
        this.aexpml[i] = tmp_aepml;
        this.bexpml[i] = tmp_bepml;
        this.amxpml[i] = tmp_ampml;
        this.bmxpml[i] = tmp_bmpml;
      }
      for (var n = 0; n < this.ny; n++) {
        this.aeypml[n] = tmp_aepml;
        this.beypml[n] = tmp_bepml;
        this.amypml[n] = tmp_ampml;
        this.bmypml[n] = tmp_bmpml;
      }
      var l = lpml - 1.0;

      //左側のPMl
      for (var i = 0; i < lpml; i++) {

        var te = (l + 1.0) / lpml;
        var tm = (l + 0.5) / lpml;

        var sigxe = pml_conductivity_max * Math.pow(te, order);
        var sigxm = pml_magnetic_max * Math.pow(tm, order);
        var a = (2.0 * E0 - sigxe * dt) / (2.0 * E0 + sigxe * dt);
        var b = ((2.0 * dt) / (2.0 * E0 + sigxe * dt)) / lattice_width;
        var c = (2.0 * M0 - sigxm * dt) / (2.0 * M0 + sigxm * dt);
        var d = ((2.0 * dt) / (2.0 * M0 + sigxm * dt)) / lattice_width;
        this.aexpml[i] = a;
        this.bexpml[i] = b;
        this.amxpml[i] = c;
        this.bmxpml[i] = d;
        l -= 1.0;
      }
      //右側のPMl
      l = 0.0;
      for (var i = nx - lpml; i < nx; i++) {
        var te = (l + 1.0) / lpml;
        var tm = (l + 0.5) / lpml;
        var sigxe = pml_conductivity_max * Math.pow(te, order);
        var sigxm = pml_magnetic_max * Math.pow(tm, order);
        var a = (2.0 * E0 - sigxe * dt) / (2.0 * E0 + sigxe * dt);
        var b = ((2.0 * dt) / (2.0 * E0 + sigxe * dt)) / lattice_width;
        var c = (2.0 * M0 - sigxm * dt) / (2.0 * M0 + sigxm * dt);
        var d = ((2.0 * dt) / (2.0 * M0 + sigxm * dt)) / lattice_width;

        this.aexpml[i] = a;
        this.bexpml[i] = b;
        this.amxpml[i] = c;
        this.bmxpml[i] = d;
        l += 1.0;
      }
      //上側のpml
      l = lpml - 1.0;
      for (var n = 0; n < lpml; n++) {
        var te = (l + 1.0) / lpml;
        var tm = (l + 0.5) / lpml;
        var sigxe = pml_conductivity_max * Math.pow(te, order);
        var sigxm = pml_magnetic_max * Math.pow(tm, order);
        var a = (2.0 * E0 - sigxe * dt) / (2.0 * E0 + sigxe * dt);
        var b = ((2.0 * dt) / (2.0 * E0 + sigxe * dt)) / lattice_width;
        var c = (2.0 * M0 - sigxm * dt) / (2.0 * M0 + sigxm * dt);
        var d = ((2.0 * dt) / (2.0 * M0 + sigxm * dt)) / lattice_width;

        this.aeypml[n] = a;
        this.beypml[n] = b;
        this.amypml[n] = c;
        this.bmypml[n] = d;

        l -= 1.0;
      }
      //下側のpml
      l = 0.0;
      for (var n = ny - lpml; n < ny; n++) {
        var te = (l + 1.0) / lpml;
        var tm = (l + 0.5) / lpml;
        var sigxe = pml_conductivity_max * Math.pow(te, order);
        var sigxm = pml_magnetic_max * Math.pow(tm, order);
        var a = (2.0 * E0 - sigxe * dt) / (2.0 * E0 + sigxe * dt);
        var b = ((2.0 * dt) / (2.0 * E0 + sigxe * dt)) / lattice_width;
        var c = (2.0 * M0 - sigxm * dt) / (2.0 * M0 + sigxm * dt);
        var d = ((2.0 * dt) / (2.0 * M0 + sigxm * dt)) / lattice_width;

        this.aeypml[n] = a;
        this.beypml[n] = b;
        this.amypml[n] = c;
        this.bmypml[n] = d;

        l += 1.0;
      }


      this.aexpml[0] = -1.0;
      this.aeypml[0] = -1.0;
      this.bexpml[0] = 0.0;
      this.beypml[0] = 0.0;
      this.amxpml[0] = 1.0;
      this.amypml[0] = 1.0;
      this.bmxpml[0] = dt / M0 / lattice_width;
      this.bmypml[0] = dt / M0 / lattice_width;
      this.aexpml[nx - 1] = -1.0;
      this.aeypml[ny - 1] = -1.0;
      this.bexpml[nx - 1] = 0.0;
      this.beypml[ny - 1] = 0.0;
      this.amxpml[nx - 1] = 1.0;
      this.amypml[ny - 1] = 1.0;
      this.bmxpml[nx - 1] = dt / M0 / lattice_width;
      this.bmypml[ny - 1] = dt / M0 / lattice_width;
    }
    set_pml();
  }


  get_Ez() {
    return this.Ez;
  }
  cal_E() {
    for (var i = this.lpml; i < this.nx - this.lpml; i++) {
      for (var n = this.lpml; n < this.ny - this.lpml; n++) {
        this.Ez[i][n] = this.ae[i][n] * this.Ez[i][n] + this.be[i][n] * (this.Hy[i][n] - this.Hy[i - 1][n])
          - this.be[i][n] * (this.Hx[i][n] - this.Hx[i][n - 1]);
      }
    }
  }
  cal_H() {
    for (var i = this.lpml; i < this.nx - this.lpml; i++) {
      for (var n = this.lpml; n < this.ny - this.lpml; n++) {
        this.Hx[i][n] = this.am[i][n] * this.Hx[i][n] - this.bm[i][n] * (this.Ez[i][n + 1] - this.Ez[i][n]);
      }
    }
    for (var i = this.lpml; i < this.nx - this.lpml; i++) {
      for (var n = this.lpml; n < this.ny - this.lpml; n++) {
        this.Hy[i][n] = this.am[i][n] * this.Hy[i][n] + this.bm[i][n] * (this.Ez[i + 1][n] - this.Ez[i][n]);
      }
    }
  }
  cal_Epml() {
    var addi;
    var addn;
    addi = 0; addn = 0;

    addi = 0; addn = 0;
    //Ez pml
    for (var x = 0; x < this.pmlBlocks.length; x++) {
      var p_b = this.pmlBlocks[x];
      if (x == 0) { addi = 1; } else { addi = 0; }
      if (x == 0 || x == 1 || x == 2) { addn = 1; } else { addn = 0; }
      for (var i = p_b.sx + addi; i < p_b.ex; i++) {
        for (var n = p_b.sy + addn; n < p_b.ey; n++) {
          this.Ezx[i][n] = this.aexpml[i] * this.Ezx[i][n] + this.bexpml[i] * (this.Hy[i][n] - this.Hy[i - 1][n]);
          this.Ezy[i][n] = this.aeypml[n] * this.Ezy[i][n] - this.beypml[n] * (this.Hx[i][n] - this.Hx[i][n - 1]);
          this.Ez[i][n] = this.Ezx[i][n] + this.Ezy[i][n];
        }
      }
    }
  }
  cal_Hpml() {
    var limiti;
    var limitn;
    limiti = 0; limitn = 0;
    //Hx pml
    for (var x = 0; x < this.pmlBlocks.length; x++) {
      var p_b = this.pmlBlocks[x];

      if (x == 0 || x == 1 || x == 3) { limitn = 1; } else { limitn = 0; }
      for (var i = p_b.sx; i < p_b.ex; i++) {
        for (var n = p_b.sy; n < p_b.ey - limitn; n++) {
          this.Hx[i][n] = this.amypml[n] * this.Hx[i][n] - this.bmypml[n] * (this.Ez[i][n + 1] - this.Ez[i][n]);
        }
      }
    }
    limiti = 0; limitn = 0;
    //Hy pml
    for (var x = 0; x < this.pmlBlocks.length; x++) {
      var p_b = this.pmlBlocks[x];
      if (x == 1) { limiti = 1; } else { limiti = 0; }
      for (var i = p_b.sx; i < p_b.ex - limiti; i++) {
        for (var n = p_b.sy; n < p_b.ey; n++) {
          this.Hy[i][n] = this.amxpml[i] * this.Hy[i][n] + this.bmxpml[i] * (this.Ez[i + 1][n] - this.Ez[i][n]);
        }
      }
    }
    limiti = 0; limitn = 0;
  }
  func_AmplitudeScaler(simulationnum) {
    if (this.amplitudeScaler.Select === "SineWave") {
      return 1 / (1 + Math.exp(this.amplitudeScaler.SineWave.slope * (simulationnum - this.amplitudeScaler.SineWave.shift)));
    }
    if (this.amplitudeScaler.Select === "Pulse") {
      return Math.exp(-Math.pow((simulationnum - this.amplitudeScaler.Pulse.peakPosition), 2) / (this.amplitudeScaler.Pulse.widthFactor * 400));
    }
    return 100000;
  }
  feed() {
    this.FeedPoints.forEach((f) => {
      this.Ez[f.x][f.y] += 1.0 * Math.sin(2.0 * Math.PI * this.feq * this.t + Math.PI * f.phase / 180) * this.func_AmplitudeScaler(this.simulationNum);
    })
  }
  cal() {
    this.cal_E();
    this.feed();
    this.cal_Epml();
    this.t += this.dt / 2.0;
    this.cal_H();
    this.cal_Hpml();
    this.t += this.dt / 2.0;
    this.simulationNum++;
  }
}
