import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

function Graph({ spatial,amplitudeScaler}) {
  const { width, height } = maker_RECT();
  const [activeTraces, setActiveTraces] = useState([]);
  const [title, setTitle] = useState('');
  const [deltaXLambda, setDeltaXLambda] = useState(0);
  const [slope, setSlope] = useState(0);
  const [shift, setShift] = useState(200);
  const [peakPosition, setPeakPosition] = useState(0);
  const [widthFactor, setWidthFactor] = useState(0);
  const [simulationNum, setSimulationNum] = useState(0);

// y=sin(2\pi f\Delta tx)*\frac{1}{1+e^{(slope*(x-shift))}}
// y=sin(2\pi f\Delta tx)*e^\frac{-(x-peakposition)^2{}}{400*widthfactor}{}
useEffect(() => {
  if (!checker_SPATIAL(spatial) || !checker_AMPLITUDESCALER(amplitudeScaler)) {
    setActiveTraces([]);
    setTitle("error");
    return;
  }
  console.log(amplitudeScaler);
  setTitle("read");

  const { SineWave: { slope: inputSlope, shift: inputShift }, Pulse: { peakPosition: inputPeakPosition, widthFactor: inputWidthFactor }, simulationNum: inputSimulationNum } = amplitudeScaler;
  const { deltaXLambda: inputDeltaXLambda } = spatial;
  setDeltaXLambda(inputDeltaXLambda);
  setSlope(inputSlope);
  setShift(inputShift);
  setPeakPosition(inputPeakPosition);
  setWidthFactor(inputWidthFactor);
  setSimulationNum(inputSimulationNum);
  if (amplitudeScaler.Select === 'SineWave') {
    setTitle('正弦波');
  } else {
    setTitle('変調パルス波');
  }
}, [spatial, amplitudeScaler])
useEffect(()=>{
  if(title==='正弦波'){
  setActiveTraces([trace1, markerTrace, symmetricalPointAnnotation]); // Only show trace1, markerTrace
  }
  if(title==='変調パルス波'){
    setActiveTraces([trace2, markerTrace2, gaussianPeakAnnotation]); // Only show trace2, markerTrace2
  }
},[deltaXLambda,slope,shift,peakPosition,widthFactor,simulationNum])

  const trace1 = {
    type: 'line',
    x: Array.from({ length: simulationNum+1 }, (_, i) => i),
    y: Array.from({ length: simulationNum+1 }, (_, i) => Math.sin(1.27279 * 3.141 * i /deltaXLambda)*
    (1/(1+Math.exp(slope*(i-shift))))),
    mode: 'lines',
    line: { color: 'rgba(0,0,255,0.4)', width: 2 },
    name:"正弦波"
  };
  const trace2 = {
    type: 'line', 
    x: Array.from({ length: simulationNum+1 }, (_, i) => i),
    y: Array.from({ length: simulationNum+1 }, (_, i) => Math.sin(1.27279 * 3.141 * i /deltaXLambda)*
    Math.exp(-Math.pow((i - peakPosition), 2) / (widthFactor * 400))),
    mode: 'lines',
    line: { color: 'rgba(255,0,0,0.4)', width: 2 },
    name:"変調パルス波"
  };
  const markerTrace = {
    type: 'scatter',
    x: [shift],
    y: [1 *(1 / (1 + Math.exp(0)))],
    mode: 'markers',
    marker: { size: 10, color: 'rgba(0,0,255,1)' },
    showlegend:false,
  };
  const markerTrace2 = {
    type: 'scatter',
    x: [peakPosition],
    y: [1],
    mode: 'markers',
    marker: { size: 10, color: 'rgba(255,0,0,1)' },
    showlegend:false,
  };
  const symmetricalPointAnnotation = {
    x: shift + 40,
    y: 1 * (1 / (1 + Math.exp(0))),
    xref: 'x',
    yref: 'y',
    text: '対称点 ',
    font: {
      color: 'blue',
      size: 16,
    },
    showarrow: false,
  };
  const gaussianPeakAnnotation = {
    x: peakPosition + 90,
    y: 1,
    xref: 'x',
    yref: 'y',
    text: '変調パルス波の最大値',
    font: {
      color: 'red',
      size: 16,
    },
    showarrow: false,
  };
  return (
    <Plot
      data={activeTraces}
      layout={{
        width: width,
        height: height,
        title: title,
        margin: { l: 50, r: 50, b: 50, t: 50, pad: 0 },  // Adjusted margins
        xaxis: {
          title: 'シミュレーション回数',
          range: [0, simulationNum],  // Adjust domain as needed
        },
        yaxis: {
          title: '波形',
          range: [-1.2, 1.2],  // Adjust domain as needed
        },

        annotations: [
          ...(title === '正弦波' ? [symmetricalPointAnnotation] : [gaussianPeakAnnotation])
        ],
        showlegend:false
      }}
      config={{ displayModeBar: false, staticPlot: true }}
    />
  );
}

export function maker_RECT() {

  const availableWidth = window.innerWidth - 580<400 ? 600 : window.innerWidth - 540;
  const availableHeight = window.innerHeight*0.9<500? 500:window.innerHeight*0.9;

  // Calculate the maximum canvasDx that satisfies both conditions

  const RECT = {
    width: availableWidth,
    height: availableHeight,
  };

  return RECT;
}
export default Graph;


export function checker_AMPLITUDESCALER(obj) {
  if (!obj) return false;
  const requiredAmplitudeScalerFields = ['Select', 'simulationNum', 'SineWave', 'Pulse'];
  if (!requiredAmplitudeScalerFields.every(field => obj[field] !== undefined)) return false;
  const { SineWave, Pulse } = obj;
  const sinewaveFields = ['slope', 'shift']; const pulseFields = ['peakPosition', 'widthFactor'];
  if (!sinewaveFields.every(field => typeof SineWave[field] === 'number')) return false;
  if (!pulseFields.every(field => typeof Pulse[field] === 'number')) return false;
  return true;


}
export function checker_SPATIAL(obj) {
  if (!obj) return false;
  const settingFields = ['lambda', 'deltaXLambda'];
  return settingFields.every(field => typeof obj[field] === 'number');
}