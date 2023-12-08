
var ctx;
var ctx2;
var WIDTH = 700; //canvasの横幅 [ px ]
var HEIGHT = 700; //canvasの縦幅 [ px ]
var forwardORstopVideo = true;
function init() {
  ctx = document.getElementById('cv').getContext('2d');
  ctx2 = document.getElementById('cv2').getContext('2d');
  SETTING = {
    fieldX: 0.48, //解析領域(totalField,scatteredField)のx軸の幅 [ m ]
    fieldY: 0.48, //解析領域(totalField,scatteredField)のy軸の幅 [ m ]
    totalPoints: 100, //totalFieldの格子の数
    scatteredPoints: 40, //scatteredFieldの格子の数
    freq: 7.8e9, //周波数 [ Hz ]
    theta: 60,
  };
  const AMPLITUDESCALER = { //正弦波の立ち上がりの振幅調整

    simulationNum: 300, //シュミレーション回数
    sinewave: { //正弦波の波の立ち上がりの設定
      "slope": -0.08, //正弦波の立ち上がる勾配 (値が高いほど、立ち上がりが早い)
      "shift": 70 //正弦波の対称点　（シミュレーション回数120回目で電界の値が0.5になる。）
    }
  };
  const colorCodeRef = new ColorCode(1.1, 0);
  const fdtdInput = makeFDTDInput(SETTING, AMPLITUDESCALER);
  var fdtd2D_TFSFRef = new FDTD2D_TFSF(fdtdInput);//FDTD1D_PMLのコンストラクタメソッドでPML層の設置など初期設定を行う
  simulation(fdtd2D_TFSFRef, fdtdInput, colorCodeRef);  //FDTD1D_PMLのシミュレーション実行と描写を行う

}

function makeFDTDInput(setting, amplitudeScaler) {
  let pmlL = 20;
  const { fieldX, fieldY, totalPoints, scatteredPoints, freq, theta } = setting;
  let nx = totalPoints + 2 * scatteredPoints + 2 * pmlL;
  let dx = fieldX / nx;
  let ny = Math.ceil(fieldY / dx);

  const boundary = {
    TopLeft: { x: pmlL + scatteredPoints, y: pmlL + scatteredPoints },
    TopRight: { x: pmlL + scatteredPoints + totalPoints, y: pmlL + scatteredPoints },
    BottomRight: { x: pmlL + scatteredPoints + totalPoints, y: pmlL + scatteredPoints + totalPoints },
    BottomLeft: { x: pmlL + scatteredPoints, y: pmlL + scatteredPoints + totalPoints }
  };

  const obj = {
    nx: nx,
    ny: ny,
    pmlL: pmlL,
    boundary: boundary,
    totalPoints: totalPoints,
    scatteredPoints: scatteredPoints,
    dx: dx,
    freq: freq,
    theta: theta,
    amplitudeScaler, amplitudeScaler
  };
  return obj;
}



class FDTD2D_TFSF {
  c;
  nx;
  ny;
  dx;
  pmlL;
  simulationNum;
  omega;
  t;
  Ez; Ezx; Ezy;
  Hx; Hy;
  ae; be; am; bm;
  aexpml; bexpml; amxpml; bmxpml; aeypml; beypml; amypml; bmypml;
  pmlBlocks;
  freq;
  theta;
  boundary;
  totalPoints;
  scatteredPoints;
  k0;
  theta;
  Ta;
  constructor(fdtd_input) {
    var c = 3.0e8;
    this.nx = fdtd_input.nx;
    this.ny = fdtd_input.ny;
    this.dx = fdtd_input.dx;
    this.pmlL = fdtd_input.pmlL;
    this.freq = fdtd_input.freq;
    this.theta = fdtd_input.theta;
    this.scatteredPoints = fdtd_input.scatteredPoints;
    this.totalPoints = fdtd_input.totalPoints;
    const { TopLeft, TopRight, BottomRight, BottomLeft } = fdtd_input.boundary;
    this.TopLeft = TopLeft;
    this.TopRight = TopRight;
    this.BottomRight = BottomRight;
    this.BottomLeft = BottomLeft;
    this.Ta = (this.dx / c)*0.7;

    this.dt = (this.dx / (c * Math.sqrt(2))) * 0.9;
    this.simulationNum = 0;
    this.t = 0;
    /* thisを省く為に thisで宣言した変数と重なるvar変数 を宣言する*/
    const nx = this.nx;
    const ny = this.ny;
    const pmlL = this.pmlL;
    const dx = this.dx;
    const E0 = 8.8541878128e-12;  //真空中の誘電率[F/m]
    const M0 = 1.2566370621e-6; //真空中の透磁率 [H/m]
    this.Z0 = Math.sqrt(M0 / E0);
    const dt = this.dt;
    this.k0 = 2.0 * Math.PI / (c / this.freq);

    this.ll = Math.sqrt(2.0) * (this.nx - 2 * this.scatteredPoints+1.5) / 2 * dx; //解析領域の一辺の幅に√2/2をかけたもの
    this.omega = 2 * Math.PI * this.freq;
    this.y = []; this.z = [];
    for (let i = 0; i < nx; i++)this.y[i] = (i - nx / 2) * this.dx;
    for (let n = 0; n < ny; n++)this.z[n] = (n - ny / 2) * this.dx;

    this.Ez = Array.from({ length: nx }).map(() => Array.from({ length: ny }).fill(0));
    this.Ezx = Array.from({ length: nx }).map(() => Array.from({ length: ny }).fill(0));
    this.Ezy = Array.from({ length: nx }).map(() => Array.from({ length: ny }).fill(0));
    this.Hx = Array.from({ length: nx }).map(() => Array.from({ length: ny }).fill(0));
    this.Hy = Array.from({ length: nx }).map(() => Array.from({ length: ny }).fill(0));

    this.ae = Array.from({ length: nx }).map(() => Array.from({ length: ny }).fill(0));
    this.be = Array.from({ length: nx }).map(() => Array.from({ length: ny }).fill(0));
    this.am = Array.from({ length: nx }).map(() => Array.from({ length: ny }).fill(0));
    this.bm = Array.from({ length: nx }).map(() => Array.from({ length: ny }).fill(0));
    var de = dt / E0 / dx;
    var dm = dt / M0 / dx;
    
    this.chien=((this.TopRight.x-this.TopLeft.x)*dx)%(c/this.freq);
    this.chien=-0.5*(this.chien/(c/this.freq))*dt;
   // this.chien=0;

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
    var pml_conductivity_max = -(E0 / (2.0 * dt)) * (-8.0) * (order + 1.0) / pmlL;
    var pml_magnetic_max = (M0 / E0) * pml_conductivity_max;
    this.pmlBlocks = [];
    this.pmlBlocks.push({ sx: 0, sy: 0, ex: pmlL, ey: ny });
    this.pmlBlocks.push({ sx: nx - pmlL, sy: 0, ex: nx, ey: ny });
    this.pmlBlocks.push({ sx: pmlL, sy: 0, ex: nx - pmlL, ey: pmlL });
    this.pmlBlocks.push({ sx: pmlL, sy: ny - pmlL, ex: nx - pmlL, ey: ny });

    const set_pml = () => {
      const tmp_aepml = 1.0;
      const tmp_bepml = dt / E0 / dx;
      const tmp_ampml = 1.0;
      const tmp_bmpml = dt / M0 / dx;

      for (let i = 0; i < this.nx; i++) {
        this.aexpml[i] = tmp_aepml;
        this.bexpml[i] = tmp_bepml;
        this.amxpml[i] = tmp_ampml;
        this.bmxpml[i] = tmp_bmpml;
      }
      for (let n = 0; n < this.ny; n++) {
        this.aeypml[n] = tmp_aepml;
        this.beypml[n] = tmp_bepml;
        this.amypml[n] = tmp_ampml;
        this.bmypml[n] = tmp_bmpml;
      }
      let l = pmlL - 1.0;

      //左側のPMl
      for (let i = 0; i < pmlL; i++) {

        const te = (l + 1.0) / pmlL;
        const tm = (l + 0.5) / pmlL;

        const sigxe = pml_conductivity_max * Math.pow(te, order);
        const sigxm = pml_magnetic_max * Math.pow(tm, order);
        const a = (2.0 * E0 - sigxe * dt) / (2.0 * E0 + sigxe * dt);
        const b = ((2.0 * dt) / (2.0 * E0 + sigxe * dt)) / dx;
        const c = (2.0 * M0 - sigxm * dt) / (2.0 * M0 + sigxm * dt);
        const d = ((2.0 * dt) / (2.0 * M0 + sigxm * dt)) / dx;
        this.aexpml[i] = a;
        this.bexpml[i] = b;
        this.amxpml[i] = c;
        this.bmxpml[i] = d;
        l -= 1.0;
      }
      //右側のPMl
      l = 0.0;
      for (let i = nx - pmlL; i < nx; i++) {
        const te = (l + 1.0) / pmlL;
        const tm = (l + 0.5) / pmlL;
        const sigxe = pml_conductivity_max * Math.pow(te, order);
        const sigxm = pml_magnetic_max * Math.pow(tm, order);
        const a = (2.0 * E0 - sigxe * dt) / (2.0 * E0 + sigxe * dt);
        const b = ((2.0 * dt) / (2.0 * E0 + sigxe * dt)) / dx;
        const c = (2.0 * M0 - sigxm * dt) / (2.0 * M0 + sigxm * dt);
        const d = ((2.0 * dt) / (2.0 * M0 + sigxm * dt)) / dx;

        this.aexpml[i] = a;
        this.bexpml[i] = b;
        this.amxpml[i] = c;
        this.bmxpml[i] = d;
        l += 1.0;
      }
      //上側のpml
      l = pmlL - 1.0;
      for (let n = 0; n < pmlL; n++) {
        const te = (l + 1.0) / pmlL;
        const tm = (l + 0.5) / pmlL;
        const sigxe = pml_conductivity_max * Math.pow(te, order);
        const sigxm = pml_magnetic_max * Math.pow(tm, order);
        const a = (2.0 * E0 - sigxe * dt) / (2.0 * E0 + sigxe * dt);
        const b = ((2.0 * dt) / (2.0 * E0 + sigxe * dt)) / dx;
        const c = (2.0 * M0 - sigxm * dt) / (2.0 * M0 + sigxm * dt);
        const d = ((2.0 * dt) / (2.0 * M0 + sigxm * dt)) / dx;

        this.aeypml[n] = a;
        this.beypml[n] = b;
        this.amypml[n] = c;
        this.bmypml[n] = d;

        l -= 1.0;
      }
      //下側のpml
      l = 0.0;
      for (let n = ny - pmlL; n < ny; n++) {
        const te = (l + 1.0) / pmlL;
        const tm = (l + 0.5) / pmlL;
        const sigxe = pml_conductivity_max * Math.pow(te, order);
        const sigxm = pml_magnetic_max * Math.pow(tm, order);
        const a = (2.0 * E0 - sigxe * dt) / (2.0 * E0 + sigxe * dt);
        const b = ((2.0 * dt) / (2.0 * E0 + sigxe * dt)) / dx;
        const c = (2.0 * M0 - sigxm * dt) / (2.0 * M0 + sigxm * dt);
        const d = ((2.0 * dt) / (2.0 * M0 + sigxm * dt)) / dx;

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
      this.bmxpml[0] = dt / M0 / dx;
      this.bmypml[0] = dt / M0 / dx;
      this.aexpml[nx - 1] = -1.0;
      this.aeypml[ny - 1] = -1.0;
      this.bexpml[nx - 1] = 0.0;
      this.beypml[ny - 1] = 0.0;
      this.amxpml[nx - 1] = 1.0;
      this.amypml[ny - 1] = 1.0;
      this.bmxpml[nx - 1] = dt / M0 / dx;
      this.bmypml[ny - 1] = dt / M0 / dx;
    }
    set_pml();
  }


  get_Ez() {
    return this.Ez;
  }
  cal_Ez() {
    for (var i = this.pmlL; i < this.nx - this.pmlL; i++) {
      for (var n = this.pmlL; n < this.ny - this.pmlL; n++) {
        this.Ez[i][n] = this.ae[i][n] * this.Ez[i][n] + this.be[i][n] * (this.Hy[i][n] - this.Hy[i - 1][n])
          - this.be[i][n] * (this.Hx[i][n] - this.Hx[i][n - 1]);
      }
    }
  }
  cal_Hx() {
    for (var i = this.pmlL; i < this.nx - this.pmlL; i++) {
      for (var n = this.pmlL; n < this.ny - this.pmlL; n++) {
        this.Hx[i][n] = this.am[i][n] * this.Hx[i][n] - this.bm[i][n] * (this.Ez[i][n + 1] - this.Ez[i][n]);
      }
    }
  }
  cal_Hy() {
    for (var i = this.pmlL; i < this.nx - this.pmlL; i++) {
      for (var n = this.pmlL; n < this.ny - this.pmlL; n++) {
        this.Hy[i][n] = this.am[i][n] * this.Hy[i][n] + this.bm[i][n] * (this.Ez[i + 1][n] - this.Ez[i][n]);
      }
    }
  }
  cal_Ez_SFTF() {
    const k0 = this.k0;
    const omega = this.omega;
    const dx = this.dx;
    const ll = this.ll;
    const theta_in = this.theta * Math.PI / 180;
    const cosT = Math.cos(theta_in);
    const sinT = Math.sin(theta_in);

    const z_front = -ll + (omega / k0) * this.t;
    //左のEz
    for (let n = this.TopLeft.y; n <= this.BottomLeft.y; n++) {
      const i = this.TopLeft.x;
      const yy = this.y[n]; const xx = this.z[i] - 0.5 * dx;
      const lt = yy * sinT + xx * cosT;

      if (lt < z_front) {
        const Hy_inc = 1 / this.Z0 * Math.sin(omega * (this.t+this.Ta) - k0 * (lt + ll))*cosT;
        this.Ez[i][n] += this.be[i][n] * Hy_inc;
      }
    }

    //右のEz
    for (let n = this.TopRight.y; n <= this.BottomRight.y; n++) {
      const i = this.TopRight.x;
      const yy = this.y[n]; const xx = this.z[i] + 0.5 * dx;
      const lt = yy * sinT + xx * cosT;
      if (lt < z_front) {
        const Hy_inc = 1 / this.Z0 * Math.sin(omega * (this.t+this.Ta) - k0 * (lt + ll)) * cosT;
        this.Ez[i][n] += this.be[i][n] * -Hy_inc;
      }
    }
    
    //上のEz
    for (let i = this.TopLeft.x; i <= this.TopRight.x; i++) {
      const n = this.TopLeft.y;
      const yy = this.y[n] - 0.5 * dx; const xx = this.z[i];
      const lt = yy * sinT + xx * cosT;
      if (lt < z_front) {
        const Hy_inc = (1 / this.Z0) * Math.sin(omega * (this.t+this.Ta) - k0 * (lt + ll)) * sinT;
        this.Ez[i][n] += this.be[i][n] * Hy_inc;
      }
    }
    //下のEz
    for (let i = this.BottomLeft.x; i <= this.BottomRight.x; i++) {
      const n = this.BottomLeft.y;
      const yy = this.y[n] + 0.5 * dx; const xx = this.z[i];
      const lt = yy * sinT + xx * cosT;
      if (lt < z_front) {
        const Hy_inc = (1 / this.Z0) * Math.sin(omega * (this.t+this.Ta) - k0 * (lt + ll)) * sinT;
        this.Ez[i][n] += this.be[i][n] * -Hy_inc;
      }
    }
    
  }
  cal_Hy_SFTF() {
    const k0 = this.k0;
    const omega = this.omega;
    const dx = this.dx;
    const ll = this.ll;

    const theta_in = this.theta * Math.PI / 180;
    const cosT = Math.cos(theta_in);
    const sinT = Math.sin(theta_in);
    const z_front = -ll + (omega / k0) * (this.t);

    //左のHy
    for (let n = this.TopLeft.y; n <= this.BottomLeft.y; n++) {
      const i = this.TopLeft.x-1;
      const yy = this.y[n] - 0.5 * dx; const xx = this.z[i + 1];
      const lt = yy * sinT + xx * cosT;
      if (lt < z_front) {
        const Ex_inc = Math.sin(omega * (this.t+this.Ta) - k0 * (lt + ll));
        this.Hy[i][n] += this.bm[i][n] * -Ex_inc;
      }
    }
    //右のHy
    for (let n = this.TopRight.y; n <= this.BottomRight.y; n++) {
      const i = this.TopRight.x;
      const yy = this.y[n]; const xx = this.z[i];
      const lt = yy * sinT + xx * cosT;
      if (lt < z_front) {
        const Ex_inc = Math.sin(omega * (this.t+this.Ta) - k0 * (lt + ll));
        this.Hy[i][n] += this.bm[i][n] * Ex_inc;
      }
    }
  }
  cal_Hx_SFTF() {
    const k0 = this.k0;
    const omega = this.omega;
    const dx = this.dx;
    const ll = this.ll;

    const theta_in = this.theta * Math.PI / 180;
    const cosT = Math.cos(theta_in);
    const sinT = Math.sin(theta_in);
    const z_front = -ll + (omega / k0) * (this.t);
    //上のHx
    for (let i = this.TopLeft.x; i <= this.TopRight.x; i++) {
      const n = this.TopLeft.y-1;
      const yy = this.y[n + 1]; const xx = this.z[i];
      const lt = yy * sinT + xx * cosT;
      if (lt < z_front) {
        const Ex_inc = Math.sin(omega * (this.t+this.Ta) - k0 * (lt + ll));
        this.Hx[i][n] += this.bm[i][n] * Ex_inc;
      }
    }
    //下のHx
    for (let i = this.BottomLeft.x; i <= this.BottomRight.x; i++) {
      const n = this.BottomLeft.y;
      const yy = this.y[n]; const xx = this.z[i];
      const lt = yy * sinT + xx * cosT;
      if (lt < z_front) {
        const Ex_inc = Math.sin(omega * (this.t+this.Ta) - k0 * (lt + ll));
        this.Hx[i][n] += this.bm[i][n] * -Ex_inc;
      }
    }
  }
  cal_Ezpml() {
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
  cal_Hxpml() {
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
  }
  cal_Hypml() {
    var limiti;
    var limitn;
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
  }

  cal() {
    this.cal_Ez();
    this.cal_Ez_SFTF();
    this.cal_Ezpml();

    this.t += this.dt / 2.0;

    this.cal_Hy();
    this.cal_Hy_SFTF();
    this.cal_Hypml();

    this.cal_Hx();
    this.cal_Hx_SFTF();
    this.cal_Hxpml();



    this.t += this.dt / 2.0;
    this.simulationNum++;
  }
}


function simulation(fdtd2D_TFSFRef, fdtdInput, colorCodeRef) {
  const interval = 120; //80msごとにcal()を呼び出す
  const drawCanvasRate = 4; //FDTDのシミュレーション cal() を何回行う毎に描写を行うか
  var filmNum = fdtdInput.amplitudeScaler.simulationNum;
  var filmCounter = 0;
  var lastTimestamp = 0;

  const nx = fdtdInput.nx;
  const ny = fdtdInput.ny;
  const boundary = fdtdInput.boundary;
  const pmlL = fdtdInput.pmlL;
  const dx = WIDTH / (nx - 2 * pmlL);
  const pmlW = pmlL * dx;
  drawBackGround();

  const program = (timestamp) => {
    if (timestamp - lastTimestamp >= interval && filmCounter < filmNum && forwardORstopVideo) {
      for (let i = 0; i < drawCanvasRate; i++) {
        fdtd2D_TFSFRef.cal();
      }
      canvas();

      lastTimestamp = timestamp;
      filmCounter += 1;
    }
    if (filmCounter < filmNum && forwardORstopVideo) {
      requestAnimationFrame(program);
    }
  };
  requestAnimationFrame(program);

  const canvas = () => {
    ctx.clearRect(0, 0, WIDTH, HEIGHT); // Clear the canvas before drawing
    ctx.fillStyle = "rgb(255,0,0)";
    var Ez = fdtd2D_TFSFRef.get_Ez();
    for (var i = pmlL; i < nx - pmlL; i++) {
      for (var n = pmlL; n < ny - pmlL; n++) {
        ctx.fillStyle = colorCodeRef.give(Ez[i][n]);
        ctx.fillRect((i - pmlL) * dx, (n - pmlL) * dx, dx + 1, dx + 1);
      }
    }
  }

  function drawBackGround() {
    line(boundary.TopLeft.x * dx - pmlW, boundary.TopLeft.y * dx - pmlW, boundary.TopRight.x * dx - pmlW, boundary.TopRight.y * dx - pmlW, 1, "rgba(100,100,100,0.3)");
    line(boundary.TopRight.x * dx - pmlW, boundary.TopRight.y * dx - pmlW, boundary.BottomRight.x * dx - pmlW, boundary.BottomRight.y * dx - pmlW, 1, "rgba(100,100,100,0,3)");
    line(boundary.BottomRight.x * dx - pmlW, boundary.BottomRight.x * dx - pmlW, boundary.BottomLeft.x * dx - pmlW, boundary.BottomLeft.y * dx - pmlW, 1, "rgba(100,100,100,0.3)");
    line(boundary.BottomLeft.x * dx - pmlW, boundary.BottomLeft.y * dx - pmlW, boundary.TopLeft.x * dx - pmlW, boundary.TopLeft.y * dx - pmlW, 1, "rgba(100,100,100,0,3)");

    line(1, 1, WIDTH, 1, 1, "rgb(100,100,100)");
    line(WIDTH - 1, 1, WIDTH - 1, HEIGHT, 1, "rgb(100,100,100)");
    line(WIDTH, HEIGHT - 1, 0, HEIGHT - 1, 1, "rgb(100,100,100)");
    line(1, HEIGHT, 1, 1, 1, "rgb(100,100,100)");

    function line(x1, y1, x2, y2, w, col) {
      ctx2.strokeStyle = col;
      ctx2.lineWidth = w;
      ctx2.beginPath();
      ctx2.moveTo(x1, y1);
      ctx2.lineTo(x2, y2);
      ctx2.stroke();
    }
  };
}
const onClick_forwardORstopVideo = () => {
  forwardORstopVideo = false;
}
class ColorCode {
  m;
  colormap;
  constructor(max, index) {
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
    if (index === 0) {
      slopeF = -0.26;
      shiftF = 30.0;
      slopeL = -0.08;
      shiftL = 65.0;
    } else {
      slopeF = -0.3;
      shiftF = 35.0;
      slopeL = -0.11;
      shiftL = 75.0;
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
