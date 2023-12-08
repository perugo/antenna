import { useState, useEffect } from 'react';
export const useCanvasAndWidthHeight = (layoutWrapperRef, canvasRefs, ctxRefs, setSide, rect) => {
  const [SIDE, setSIDE] = useState(0);
  useEffect(() => {
    const setupDelay = 100;
    const timer = setTimeout(() => {
      if (!layoutWrapperRef.current) return
      const Rect = layoutWrapperRef.current.getBoundingClientRect();
      const Side = Rect.width;
      const { canvas1Ref, canvas2Ref, canvas3Ref } = canvasRefs;
      const { ctx1Ref, ctx2Ref, ctx3Ref } = ctxRefs;
      ctx1Ref.current = canvas1Ref.current.getContext('2d');
      ctx2Ref.current = canvas2Ref.current.getContext('2d');
      ctx3Ref.current = canvas3Ref.current.getContext('2d');
      if (Side === SIDE) return;
      setSIDE(Side);
      [canvas1Ref, canvas2Ref, canvas3Ref].forEach(canvasRef => {
        canvasRef.current.width = Side;
        canvasRef.current.height = Side;
      });
      setSide(Side);
    }, setupDelay);
    return () => clearTimeout(timer);
  }, [layoutWrapperRef, canvasRefs, ctxRefs, setSide, rect]);
};
export function checker_ANTENNA(obj) {
  if (!obj) return false;

  const requiredFields = {
    DomainWidLambda: (data) => typeof data === 'number',
    antGap: (data) => typeof data === 'number' && typeof obj.DomainWidLambda === 'number' && data < obj.DomainWidLambda,
    phase: (data) => typeof data === 'number' && data % 1 === 0 && data >= 0 && data <= 359,
  }
  return Object.keys(requiredFields).every(key => requiredFields[key](obj[key]));
}
export function checker_ONLYANTGAPorPHASECHANGE(obj1, obj2, side, prevSide) {
  if (!obj1 || !obj2) return false;
  if (side !== prevSide.current) return false;
  const diffFields = ['antGap', 'phase'];
  const sameFields = ['DomainWidLambda'];
  if (!fieldsMatch(obj1, obj2, sameFields)) return false;
  if (fieldsMatch(obj1, obj2, diffFields)) return false;
  return true;
}
export function checker_NOCHANGE(obj1, obj2, side, prevSide) {
  if (!obj1 || !obj2) return false;
  if (side !== prevSide.current) return false;
  const antennaFields = ['DomainWidLambda', 'antGap', 'phase'];
  if (fieldsMatch(obj1, obj2, antennaFields)) return true;
  return false;
}

export function compare_DOMAINWIDLAMBDACHANGE(obj1, obj2) {

}
export function fieldsMatch(obj1, obj2, fields) {
  return fields.every(field => obj1[field] === obj2[field]);
}
export function drawBackGround(ctx, side, DomainWidLambda) {
  ctx.clearRect(0, 0, side, side);
  line(0, 1, side, 1, 2, "black");
  line(1, 0, 1, side, 2, "black");
  line(0, side - 1, side, side - 1, 2, "black");
  line(side - 1, 0, side - 1, side, 2, "black");

  lineTriangle(0, 0, 0, side, 14, ctx, `${DomainWidLambda} λ`);
  lineTriangle(0, side, side, side, 14, ctx, `${DomainWidLambda} λ`);
  function line(x1, y1, x2, y2, w, col) {
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}
export function drawAntenna(ctx, side, antGap, DomainWidLambda) {
  ctx.clearRect(0, 0, side, side);
  const len = side * antGap / DomainWidLambda;
  circle(side / 2 - len / 2, side / 2, 6);
  circle(side / 2 + len / 2, side / 2, 6);
  const reverseSpace = 25;
  const tip = 2;
  //lineTriangle(side / 2 - len / 2 - tip, side / 2 + reverseSpace, side / 2 + len / 2 + tip, side / 2 + reverseSpace, 9, ctx, "");
  //drawAntGapText();
  drawAntennaText();
  function circle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fillStyle = "rgb(0,250,0)";
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  function drawAntennaText(){
  ctx.font='500 16px times new roman,serif'; 
  ctx.strokeStyle = "rgba(0,0,0,0.6)";
  ctx.fillStyle = "rgba(0,0,0,1)";//塗りつぶしの色

  ctx.textAlign = 'right';
  ctx.fillText("アンテナ1",side/2-len/2,side/2-20);
  ctx.textAlign = 'left';
  ctx.fillText("アンテナ2",side/2+len/2,side/2-20);
  }
  /*
  function drawAntGapText(){
    ctx.fillStyle = "black";
    //ctx.fillText(`アンテナ間の距離: ${dispD(antGap)}`,side/2,side/2+40);
    const smallFont = '500 17px times new roman,serif';
    const bigFont = '500 24px times new roman,serif';
    ctx.font = smallFont;
    const smallText = 'アンテナ間の距離: ';
    const smallTextWidth = ctx.measureText(smallText).width;
  
    ctx.font = bigFont;
    const bigText = dispD(antGap);
    const bigTextWidth = ctx.measureText(bigText).width + 5;
  
    const bigTextBorder = (smallTextWidth - bigTextWidth) / 2 + side / 2 ;
    ctx.font = smallFont;
    ctx.textAlign = 'right';
    ctx.fillText(smallText, bigTextBorder, side / 2 + 35);
  
    ctx.font = bigFont;
    ctx.textAlign = 'left';
    ctx.fillText(bigText, bigTextBorder, side / 2 + 35);
  }
  */
  
}

function lineTriangle(x1, y1, x2, y2, s, ctx1, sentence) {
  const space = 25;
  const tip_space = 3;

  const isVertical = (x1 === x2);

  if (isVertical) {
    x1 += space;
    x2 += space;
    y1 += tip_space;
    y2 -= tip_space;
  } else {
    x1 += tip_space;
    x2 -= tip_space;
    y1 -= space;
    y2 -= space;
  }
  ctx1.strokeStyle = "rgba(0,0,0,0.7)";
  ctx1.lineWidth = 1;
  ctx1.beginPath();
  ctx1.moveTo(x1, y1);
  ctx1.lineTo(x2, y2);
  ctx1.stroke();

  if (sentence != "") {
    drawSentence(x1, y1, x2, y2, sentence, ctx1);
  }
  drawTriangle(x1, y1, s, isVertical ? 0.5 : 0, ctx1);
  drawTriangle(x2, y2, s, isVertical ? 1.5 : 1, ctx1);
}

function drawTriangle(x, y, s, rot, ctx) {
  const vector = 1 / 8;
  ctx.beginPath();
  ctx.moveTo(x, y);
  var cos_x = Math.cos(rot * Math.PI + Math.PI * vector);
  var sin_y = Math.sin(rot * Math.PI + Math.PI * vector);
  ctx.lineTo(x + s * cos_x, y + s * sin_y);
  cos_x = Math.cos(rot * Math.PI - Math.PI * vector);
  sin_y = Math.sin(rot * Math.PI - Math.PI * vector);
  ctx.lineTo(x + s * cos_x, y + s * sin_y);
  ctx.closePath();
  ctx.strokeStyle = "rgba(0,0,0,0.7)"; //枠線の色
  ctx.stroke();
  ctx.fillStyle = "rgba(0,0,0,0.7)";//塗りつぶしの色
  ctx.fill();
}
function drawSentence(x1, y1, x2, y2, sentence, ctx) {
  const isVertical = (x1 === x2);
  const textwidth = 35;
  const textheight = 15;
  if (isVertical) {
    ctx.textBaseline = 'left';
    ctx.fillStyle = "rgba(255,255,255,1.0)";
    ctx.fillRect(10, (y2 - y1) * 0.52 - textwidth, 80, 40);
    ctx.textAlign = 'left';
    ctx.font = '500 26px "Times New Roman", serif';
    ctx.fillStyle = "rgba(0,0,0,1.0)";
    ctx.fillText(sentence, x1 - textwidth / 2, (y2 - y1) * 0.51);
  } else {
    ctx.textBaseline = 'center';
    ctx.fillStyle = "rgba(255,255,255,1.0)";
    ctx.fillRect((x2 - x1) / 2 - 25, y2 - 20, 60, 40);
    ctx.textAlign = 'center';
    ctx.font = '500 26px "Times New Roman", serif';
    ctx.fillStyle = "rgba(0,0,0,1.0)";
    ctx.fillText(sentence, (x2 - x1) / 2, y1 + textheight / 2);
  }
}
export function drawRadiationCircles(ctx, side, DomainWidLambda, antGap, phase) {
  ctx.clearRect(0, 0, side, side);
  const numCircles = DomainWidLambda + 2;
  const radiusIncrement = 1 / DomainWidLambda * side;
  const len = side * antGap / DomainWidLambda;
  ctx.strokeStyle = "rgba(255,0,0,0.6)";
  ctx.lineWidth = 1;
  for (let i = 0; i < numCircles; i++) {
    const radius = i * radiusIncrement;
    ctx.beginPath();
    ctx.arc(side / 2 - len / 2, side / 2, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
  }
  ctx.strokeStyle = "rgba(0,0,255,0.6)";
  for (let i = 0; i < numCircles; i++) {
    const radius = i * radiusIncrement + radiusIncrement * phase / 360;
    ctx.beginPath();
    ctx.arc(side / 2 + len / 2, side / 2, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
  }
}
const fractions = {
  0: "0",
  0.25: "1/4",
  0.5: "1/2",
  0.75: "3/4",
  1.0: "",
  1.25: "5/4",
  1.5: "3/2",
  1.75: "7/4",
  2.0: "2",
}
const dispD = (value) => {
  return (fractions[value] ?? value.toString()) + " λ";
}