import styled from "styled-components";
import React, { useState, useEffect, useRef } from 'react';
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';
import './../../Components/SliderOverride.css';
import {
  Box, FrontHeader, FrontHeaderInner, TitleWrapper, CustomH3, FrontBody,
  ColumnLayout, GridColumn, FrontHeaderLeft, SliderWrapper,

  RadioButton,RadioButtonInput
} from './StyledBoxComponents';



const TextRow = styled.div`
display:flex;
flex-direction:row;
line-height:16px;
`
const Text = styled.div`
font-size:18px;
margin:0;
padding:0;
`

export const BoxDomainGrid = ({ antenna, setAntenna, spatial, setSpatial }) => {
  const timeoutIdRef = useRef();
  const [dispDWL, setDispDWL] = useState(0);
  const [dispDXL, setDispDXL] = useState(0);
  const [DWLMarks, setDWLMarks] = useState({});
  const [DWLMax, setDWLMax] = useState(0);
  const [DWLMin, setDWLMin] = useState(0);
  const [DXLMarks, setDXLMarks] = useState({});
  const [DXLMin, setDXLMin] = useState(0);
  const [DXLMax, setDXLMax] = useState(0);
  useEffect(() => {
    if (!checker_BOXDOMAIN(antenna, spatial)) return;
    console.log("BoxDomainGrid");
    const { DomainWidLambda } = antenna;
    const { deltaXLambda } = spatial;
    setDispDWL(DomainWidLambda);
    setDispDXL(deltaXLambda);
    return () => {
      clearTimeout(timeoutIdRef.current);
    };
  }, [antenna, spatial])

  useEffect(() => {
    setDWLMarks(makeDWLMarks(setDWLMin, setDWLMax));
    setDXLMarks(makeDXLMarks(setDXLMin, setDXLMax));
  }, [])

  const handleDWLSliderChanged = (newValue) => {
    setDispDWL(newValue);
  }
  const handleDXLSliderChanged = (newValue) => {
    setDispDXL(newValue);
  }
  useEffect(() => {
    clearTimeout(timeoutIdRef.current);
    startTimer();
  }, [dispDWL, dispDXL])
  const handleTimeout = () => {
    setAntenna({ ...antenna, DomainWidLambda: dispDWL });
    setSpatial({ ...spatial, deltaXLambda: dispDXL });
  };
  const startTimer = () => {
    timeoutIdRef.current = setTimeout(handleTimeout, 70);
  };
  return (
    <Box>
      <FrontHeader>
        <FrontHeaderInner>
          <FrontHeaderLeft>
            <TitleWrapper>
              <CustomH3>解析領域</CustomH3>
            </TitleWrapper>
          </FrontHeaderLeft>
        </FrontHeaderInner>
      </FrontHeader>
      <FrontBody>
        <ColumnLayout>
          <GridColumn>
            <TextRow>
              <Text style={{ fontSize: "13px", paddingRight: "4px" }}>解析領域の幅: </Text>
              <Text>{dispDWL} λ</Text>
            </TextRow>
            <SliderWrapper >
              <Slider
                value={dispDWL}
                min={DWLMin}
                max={DWLMax}
                marks={DWLMarks}
                onChange={handleDWLSliderChanged}
                railStyle={{ backgroundColor: '#ddd', borderRadius: "5px", height: "8px" }}
                trackStyle={{ backgroundColor: 'rgb(60,60,235)', borderRadius: "5px", height: "8px" }}
                handleStyle={{ fontSize: '18px' }}
              />
            </SliderWrapper>
            <div style={{ width: "100%", height: "3px" }}></div>
            <TextRow>
              <Text style={{ fontSize: "13px", paddingRight: "4px" }}>空間離散間隔: </Text>
              <Text>λ / {dispDXL}</Text>
            </TextRow>
            <SliderWrapper >
              <Slider
                value={dispDXL}
                min={DXLMin}
                max={DXLMax}
                marks={DXLMarks}
                onChange={handleDXLSliderChanged}
                railStyle={{ backgroundColor: '#ddd', borderRadius: "5px", height: "8px" }}
                trackStyle={{ backgroundColor: 'rgb(60,60,235)', borderRadius: "5px", height: "8px" }}
                handleStyle={{ fontSize: '18px' }}
              />
            </SliderWrapper>
          </GridColumn>
        </ColumnLayout>
      </FrontBody>
    </Box>
  )
};

function checker_BOXDOMAIN(antenna, spatial) {
  if (!antenna || !spatial) return false;
  return true;
}
const makeDWLMarks = (setDWLMin, setDWLMax) => {
  const initialMarks = {};
  let i = 3;
  setDWLMin(i);
  for (; i <= 12; i += 1) {
    initialMarks[i] = i.toString() + " λ";
  }
  setDWLMax(i - 1);
  return initialMarks;
}
const makeDXLMarks = (setDXLMin, setDXLMax) => {
  const initialMarks = {};
  let i = 10;
  setDXLMin(i);
  for (; i <= 30; i += 1) {
    if (i % 5 === 0) {
      initialMarks[i] = "λ / " + i.toString();
    } else { initialMarks[i] = ' '; }
  }
  setDXLMax(i - 1);
  return initialMarks;
}