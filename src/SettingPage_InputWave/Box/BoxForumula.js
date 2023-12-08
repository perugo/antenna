import styled from "styled-components";
import React, { useState, useEffect, useRef } from 'react';

import {
  Box, FrontHeader, FrontHeaderInner, TitleWrapper, CustomH3, FrontBody,
  ColumnLayout, GridColumn, FrontHeaderLeft
} from './StyledBoxComponents';


const FormulaLabel = styled.div`
  margin-left:0px;
  text-align:left;
  font-size:16px;
  display:flex;
justify-content:center;
align-items:center;
`
const Label = styled.div`
text-align:left;
font-size:14px;
margin:0px 0px 0px 0px;
`

const SVGWrapper = styled.div`
margin-left:5px;
  height: 55px;
  width: 280px;
  margin-top: 2px;
  margin-bottom: 2px;
  display: flex;
`;
const SimulationCountWraper = styled.div`
display:flex;
flex-direction:row;
`
const SVGXWrapper = styled.div`
margin-right:5px;
margin-top:5px;
height: 13px;
width: 13px;
display: flex;
`
const SVGInner = styled.div`
  position: relative;
  width: inherit;
  height: inherit;
  margin: auto;
`;
const StyledImg = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2; // Ensure the image is always on top
`;
const LabelRow = styled.div`
  display:flex;
  flex-direction:row;
  width:100%;
`
export const BoxFormula = ({ amplitudeScaler }) => {
  const [select, setSelect] = useState('');
  useEffect(() => {
    if (amplitudeScaler === undefined) return;
    if (amplitudeScaler.Select === undefined) return;
    if (amplitudeScaler.Select === 'SineWave') {
      setSelect('SineWave');
    } else if (amplitudeScaler.Select === 'Pulse') {
      setSelect('Pulse');
    }
  }, [amplitudeScaler])
  return (
    <Box>
      <FrontHeader>
        <FrontHeaderInner style={{padding:"4px 20px 3px 20px"}}>
          <FrontHeaderLeft>
            <TitleWrapper>
              <CustomH3>波形の数式</CustomH3>
            </TitleWrapper>
          </FrontHeaderLeft>
        </FrontHeaderInner>
      </FrontHeader>

      <FrontBody>
        <ColumnLayout>
          <GridColumn style={{paddingTop:"4px"}}>
            {select && select === 'SineWave' && (

              <LabelRow>
                <FormulaLabel>正弦波 :</FormulaLabel>
                <SVGWrapper>
                  <SVGInner>
                    <StyledImg
                      src={`${process.env.PUBLIC_URL}/sineLaTeX.svg`}
                      alt="sine formula"
                    />
                  </SVGInner>
                </SVGWrapper>
              </LabelRow>
            )}
            {select && select === 'Pulse' && (
              <LabelRow>
                <FormulaLabel style={{ paddingTop: "8px", justifyContent: "center" }}>変調パルス波 : </FormulaLabel>
                <SVGWrapper>
                  <SVGInner>
                    <StyledImg
                      src={`${process.env.PUBLIC_URL}/pulseLaTeX.svg`}
                      alt="pulse formula"
                    />
                  </SVGInner>
                </SVGWrapper>
              </LabelRow>
            )}
            <SimulationCountWraper style={{ fontSize: "14px" }}>
              <SVGXWrapper>
                <SVGInner>
                  <StyledImg
                    src={`${process.env.PUBLIC_URL}/xLaTeX.svg`}
                    alt="pulse formula"
                  />
                </SVGInner>
              </SVGXWrapper>
              <Label>: シミュレーション回数
              </Label>
            </SimulationCountWraper>
          </GridColumn>
        </ColumnLayout>
      </FrontBody>
    </Box>
  )
};