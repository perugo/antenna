import styled from "styled-components";
import { useState, useEffect, useRef } from 'react';
import { BREAD, ANTENNA_PRESETS, DEFAULT } from './constants';
import { useSetInitialRect, useUpdateLinkBread } from './helper';
import { RightBar } from './Home_Components/RightBar';
import { AntennaCanvas } from './Home_Components/AntennaCanvas';
import { SimulationCanvas } from './Home_Components/SimulationCanvas';
import { Link } from './Link';
import { Home as SettingInputWave } from './SettingPage_InputWave/Home';

const Container = styled.div`
  margin-left:10px;
  position:relative;
  display:flex;
  flex-direction:column;
`
const Body = styled.div`
  position:relative;
`
const ContainerHome = styled.div`
  position:relative;
  display: inline-block;
  display:flex;
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  opacity: ${props => props.$show ? 1 : 0};
  flex-direction:row;
  @media screen and (max-width: 1250px) {
    flex-direction: column;
  }
`
const Wrapper = styled.div`
  position: absolute;
  width:100%; height:100%;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  opacity: ${props => props.$show ? 1 : 0};
`;
const LeftBar = styled.div`
  position:relative;
`

export const Home = () => {
  const { ANTENNA, SPATIAL, COLOR, AMPLITUDESCALER } = DEFAULT;
  const [LinkBread, setLinkBread] = useState([]);
  const [showWindow, setShowWindow] = useState("home");
  const [antenna, setAntenna] = useState(ANTENNA);
  const [spatial, setSpatial] = useState(SPATIAL);
  const [rect, setRect] = useState({ width: 0, height: 0 });
  const [amplitudeScaler, setAmplitudeScaler] = useState(AMPLITUDESCALER);
  const [simulationData, setSimulationData] = useState({});
  const [showSimulation, setShowSimulation] = useState(false);
  const [moveVideo, setMoveVideo] = useState(false);
  const [color,setColor]=useState(COLOR);

  useSetInitialRect(setRect);
  useUpdateLinkBread(BREAD, setLinkBread, showWindow);
  const antennaCanvasProps = {
    antenna,
    rect
  }
  const simulationCanvasProps = {
    simulationData,
    showSimulation, setShowSimulation,
    moveVideo, setMoveVideo,
    rect
  }
  const rightBarProps = {
    antennaPresets: ANTENNA_PRESETS,
    antenna, setAntenna,
    spatial, setSpatial,
    color,setColor,
    amplitudeScaler,setAmplitudeScaler,
    moveVideo, setMoveVideo,
    showSimulation, setShowSimulation,
    setShowWindow
  }
  const settingInputWaveProps = {
    antenna,setAntenna,
    spatial,setSpatial,
    amplitudeScaler,setAmplitudeScaler,
    setShowWindow
  }
  useEffect(()=>{
    setShowSimulation(false);
  },[antenna,spatial,color,amplitudeScaler])
  const push = () => {
    const obj = {
      antenna: antenna,
      spatial: spatial,
      color: color,
      amplitudeScaler, amplitudeScaler
    }
    setSimulationData(obj);
    setShowSimulation(true);
  }
  const reset = () => {
    setAntenna(ANTENNA);
    setSpatial(SPATIAL);
    setColor(COLOR);
    setAmplitudeScaler(AMPLITUDESCALER);
    setShowSimulation(false);

  }

  const componentMap = {
    settingInputWave: <SettingInputWave {...settingInputWaveProps} />,
  };
  
  return (
    <Container>

      <Link setShowWindow={setShowWindow} linkobject={LinkBread} />
      <Body>
        <ContainerHome $show={showWindow === "home"}>
          <LeftBar style={{ width: rect.width + "px", height: rect.height + "px" }}>
            <Wrapper $show={!showSimulation}>
              <AntennaCanvas {...antennaCanvasProps} />
            </Wrapper>
            <Wrapper $show={showSimulation}>
              <SimulationCanvas {...simulationCanvasProps} />
            </Wrapper>
          </LeftBar>

          <RightBar {...rightBarProps} push={push} reset={reset} />
        </ContainerHome>
        <Wrapper $show={showWindow !== "home"}>
          {componentMap[showWindow]}
        </Wrapper>
      </Body>
    </Container>
  );
}
/*



*/