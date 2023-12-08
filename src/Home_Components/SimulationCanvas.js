import styled from "styled-components";
import { useRef, useState, useEffect, useLayoutEffect } from 'react';

import {
  useFDTDInput,
  ColorCode,
  FDTD2D_PML,
  checker_FDTDINPUT
} from './SimulationCanvas_helper';
const Canvas = styled.canvas`
    position: absolute;
    top: 0;
    left: 0;
    opacity: 1.0;
    
`;
const Container = styled.div`
    position: relative;
    width:100%;
    height:100%;
    margin:0px 10px 0px 0px;
`;
const Layout_Wrapper = styled.div`
  border: 1px solid rgb(180, 180, 180); // Border line
  box-shadow: 2px 2px 2px rgb(100, 100, 100); // Shadow effect
  position:relative;
  width:100%;
  height:100%;
`;

var nx;
var ny;
var lpml;
var dx;
const defaultInterval = 90;
let lastTimestamp = 0;
var interval;
const drawcanvasrate = 3;
var filmnum = 100;
var filmcounter = 0;

export const SimulationCanvas = ({ simulationData, showSimulation, setShowSimulation, moveVideo, setMoveVideo, rect }) => {
  const canvas1Ref = useRef(null);
  const ctxRef = useRef(null);
  const FDTD_Input = useFDTDInput(simulationData);
  const colorCodeRef = useRef(null);
  const FDTD2D_PMLRef = useRef(null);
  const layoutWrapperRef = useRef(null);
  const [RECT, setRECT] = useState({ width: 0, height: 0 });
  const movevideoRef = useRef(true);
  const showSimulationRef = useRef(false);

  useEffect(() => {
    movevideoRef.current = true;
    if (ctxRef.current) ctxRef.current.clearRect(0, 0, RECT.width, RECT.height);
    if (!checker_FDTDINPUT(FDTD_Input) || RECT.width === 0) return;
    FDTD2D_PMLRef.current = new FDTD2D_PML(FDTD_Input);
    showSimulationRef.current = true;
    const { nx: inputNx, ny: inputNy, lpml: inputLpml, deltaXLambda, color, amplitudeScaler } = FDTD_Input;
    const { simulationNum } = amplitudeScaler;
    const { colorThreshold, colorGradientIndex } = color;
    colorCodeRef.current = new ColorCode(colorThreshold, colorGradientIndex);

    filmcounter = 0;
    nx = inputNx;
    ny = inputNy;
    lpml = inputLpml;
    interval = defaultInterval / (deltaXLambda) * 20;
    dx = RECT.width / (nx - lpml * 2);
    filmnum = simulationNum / drawcanvasrate;
    requestAnimationFrame(Program);
  }, [FDTD_Input]);

  useEffect(() => {
    const delay = 300; // set the delay time as needed
    if (layoutWrapperRef.current) {
      const timer = setTimeout(() => {
        const Rect = layoutWrapperRef.current.getBoundingClientRect();
        setRECT(Rect);
        ctxRef.current = canvas1Ref.current.getContext('2d');
        canvas1Ref.current.width = Rect.width; canvas1Ref.current.height = Rect.height;
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [layoutWrapperRef, rect])

  useEffect(() => {
    setMoveVideo(true);
    if (!showSimulation) {
      FDTD2D_PMLRef.current = null;
      if (ctxRef.current) ctxRef.current.clearRect(0, 0, RECT.width, RECT.height);
    }
    showSimulationRef.current = showSimulation;
  }, [showSimulation]);
  useEffect(() => {
    movevideoRef.current = moveVideo;
    requestAnimationFrame(Program);
  }, [moveVideo])

  const Program = (timestamp) => {
    if (timestamp - lastTimestamp >= interval && filmcounter < filmnum && showSimulationRef.current && movevideoRef.current) {
      for (let i = 0; i < drawcanvasrate; i++) {
        FDTD2D_PMLRef.current.cal();
      }
      canvas(ctxRef.current);
      requestAnimationFrame(Program);
      lastTimestamp = timestamp;
      filmcounter += 1;
    }
    if (filmcounter >= filmnum) setShowSimulation(false);
    if (showSimulationRef.current && movevideoRef.current) {
      requestAnimationFrame(Program);
    }
  };


  const stopvideo = () => {
    setMoveVideo(!moveVideo);
  }
  const canvas = (ctx) => {
    var Ez = FDTD2D_PMLRef.current.get_Ez();
    for (var i = lpml; i < nx - lpml; i++) {
      for (var n = lpml; n < ny - lpml; n++) {
        ctx.fillStyle = colorCodeRef.current.give(Ez[i][n]);
        ctx.fillRect((i - lpml) * dx, (n - lpml) * dx, dx + 1, dx + 1);
      }
    }
  }
  return (
    <Container>
      <Layout_Wrapper onClick={stopvideo} ref={layoutWrapperRef}>
        <Canvas ref={canvas1Ref} />
      </Layout_Wrapper>
    </Container>
  )
};