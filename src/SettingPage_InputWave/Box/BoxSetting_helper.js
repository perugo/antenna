import { useState, useEffect } from 'react';
export const validateInput = (type, value) => {
  const regexPatterns = {
    signedDecimal: /^-?\d*\.?\d*$/, // Only allow one minus sign at the start and one decimal point
    integer: /^\d*$/,
    decimal: /^\d*\.?\d*$/ // Only allow one decimal point
  };

  // Early return if the value doesn't match the allowed characters
  return regexPatterns[type].test(value);
}
export function checker_amplitudeScaler(obj) {
  if (!obj) return false;
  const requiredAmplitudeScalerFields = ['Select', 'simulationNum', 'SineWave', 'Pulse'];
  if (!requiredAmplitudeScalerFields.every(field => obj[field] !== undefined)) return false;
  if (typeof obj['simulationNum'] !== 'number') return false;
  if (!(obj['Select'] === 'Rise' || obj['Select'] === 'Pulse')) return false;
  const { SineWave, Pulse } = obj;
  const sinewaveFields = ['slope', 'shift']; const pulseFields = ['peakPosition', 'widthFactor'];
  if (!sinewaveFields.every(field => typeof SineWave[field] === 'number')) return false;
  if (!pulseFields.every(field => typeof Pulse[field] === 'number')) return false;
  return true;

}
export const isValidKey = (key, type) => {
  const regexPatterns = {
    signedDecimal: /[0-9.-]/,
    integer: /[0-9]/,
    decimal: /[0-9.]/
  };

  return regexPatterns[type].test(key) ||
    ['Backspace', 'ArrowRight', 'ArrowLeft', 'Tab', 'Delete', 'Minus'].includes(key);
};

// A single function to handle keydown events for different input types
export const handleKeyDown = (type) => (e) => {
  if (!isValidKey(e.key, type)) {
    e.preventDefault();
  }
};
export const setToDefault = (defaultAmplitudeScaler,setStrAmplitudeScaler) => {
  const { SineWave: { slope, shift }, Pulse: { peakPosition, widthFactor }, simulationNum } = defaultAmplitudeScaler;
  const stringAmplitudeScaler = {
    simulationNum: simulationNum.toString(),
    slope: slope.toString(),
    shift: shift.toString(),
    peakPosition: peakPosition.toString(),
    widthFactor: widthFactor.toString()
  };
  setStrAmplitudeScaler(stringAmplitudeScaler);
}
export const updateStringStates = (amplitudeScaler, setStrAmplitudeScaler) => {
  const { SineWave: { slope, shift }, Pulse: { peakPosition, widthFactor }, simulationNum } = amplitudeScaler;
  setStrAmplitudeScaler({
    simulationNum: simulationNum.toString(),
    slope: slope.toString(),
    shift: shift.toString(),
    peakPosition: peakPosition.toString(),
    widthFactor: widthFactor.toString()
  });
}
export function isStateComplete(amplitudeScaler) {
  return checker_amplitudeScaler(amplitudeScaler)
}
export function isValidNumber(input) {
  let str = String(input); // Convert the input to a string
  if (!str.length) return false;

  if (/e/i.test(str)) return false; // Scientific notation is invalid

  if (/[^0-9.-]/.test(str)) return false; // Invalid characters detected
  if (str === '' || str === '.') return false;
  if (str === '' || str === '-') return false;

  if ((str.match(/\./g) || []).length > 1) {
    return false; // More than one period
  }
  if (str.startsWith('-')) {
    str = str.substring(1); // Remove leading minus for the remaining checks
  }
  if (str.startsWith('0') && str !== "0" && !str.startsWith('0.')) {
    return false; // Leading zeros are not allowed
  }
  if (str.endsWith('.')) {
    return false; // Trailing period is not allowed
  }

  if (str.startsWith('.')) {
    return false; // Decimal point at the start is not allowed
  }
  //str = str.replace(/(^\d*)0+(\d)/, '$1$2');

  //const totalSignificantFigures = countSignificantFigures(str);
  //if (totalSignificantFigures > 6) {
  //  return false; // Too many significant figures
  //}

  const num = parseFloat(String(input));
  return !isNaN(num) && isFinite(num);
}

function countSignificantFigures(str) {
  let integralPart = '';
  let decimalPart = '';
  if (str.includes('.')) {
    [integralPart, decimalPart] = str.split('.');
    integralPart = integralPart.replace(/^0+/, ''); // 先頭のゼロを取り除く
    decimalPart = decimalPart.replace(/0+$/, ''); // 末尾のゼロを取り除く
  } else {
    integralPart = str.replace(/^0+|0+$/g, '');
  }
  const significantIntegral = integralPart.length === 0 || parseInt(integralPart, 10) === 0 ? 0 : integralPart.length;

  // 小数部分と整数部分の有効数字を合算して返す
  return significantIntegral + decimalPart.length;
}