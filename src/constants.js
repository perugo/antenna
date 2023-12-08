export const BREAD={
  HOME:[{ title: "二素子アレーアンテナ", link: "home" }],
  SETTING:{
    INPUTWAVE:[{ title: "二素子アレーアンテナ", link: "home" }, { title: "アンテナの設定", link: "settingInputWave" }],
  }
}
export const ANTENNA_PRESETS=[
  { antGap: 0.5, phase: 0},
  { antGap: 0.5, phase: 180},
  { antGap: 0.25, phase: 90}
];
export const DEFAULT={
  ANTENNA:{ DomainWidLambda: 6, antGap: 0.5, phase: 0},
  COLOR:{
    colorThreshold:0.08,
    colorGradientIndex:1
  },
  SPATIAL:{lambda:0.003,deltaXLambda:20},
  AMPLITUDESCALER: {
    "Select": "SineWave", "simulationNum": 700,
    "SineWave": { "slope": -0.06, "shift": 70 },
    "Pulse": { "peakPosition": 110, "widthFactor": 2.0 }
  }
}