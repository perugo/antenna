import styled from "styled-components";
import React, { useState, useEffect, useRef } from 'react';


import {
  Box, FrontHeader, FrontHeaderInner, TitleWrapper, CustomH3, FrontBody,
  ColumnLayout, GridColumn, FrontHeaderLeft
} from './StyledBoxComponents';
//,"Helvetica Neue",Roboto,Arial,sans-serif
const SpanText = styled.span`
font-size:15px;
font-weight:500;
line-height:22px;
color:rgb(40,40,40);
margin-bottom:2px;
`

const TextWrapper = styled.div`
`
const TextContent = styled.div`
position:relative;
display:flex;
flex-direction:row;
}
`
const GridRow = styled.div`
  padding:2px 3px 2px 5px;
  display:flex;
  position:relative;
  cursor:pointer;
  color:#3333ef;
  font-size:18px;
  &:hover { color: orange; }
  &:hover ${TextContent}::after {
    content: ''; /* 必須: after要素の内容を設定 */
    position: absolute; /* 線の位置を親要素に対して絶対位置にします */
    left: 0; /* 親要素の左端から開始 */
    right: 0; /* 親要素の右端まで延長 */
    bottom: 0; /* 親要素の下端に位置 */
    border-bottom: 2px solid orange; /* 線のスタイル: 太さ、種類、色 */
    width: 100%; /* 線の幅 */
  }
`

const Cell = styled.div`
display:flex;
flex-direction:row;
width:160px;

`
const LeftAlignText = styled.div`
text-align:left;
`
const RightAlignText = styled.div`
text-align:right;
flex:1;
font-size:18px;
`

export const BoxPreset = ({ antennaPresets, antenna, setAntenna }) => {
  const [strPreset, setStrPreset] = useState([]);

  useEffect(() => {
    if (!antennaPresets) return;
    const newStrPreset = antennaPresets.map(item => ({
      antGap: dispD(item.antGap).toString(),
      phase: item.phase.toString()
    }));
    setStrPreset(newStrPreset);
  }, [antennaPresets]);
  const onClickPresetItem = (index) => {
    const { antGap, phase } = antennaPresets[index];
    setAntenna({ ...antenna, antGap, phase });
  }
  return (
    <Box>
      <FrontHeader>
        <FrontHeaderInner>
          <FrontHeaderLeft>
            <TitleWrapper>
              <CustomH3>標準設定</CustomH3>
            </TitleWrapper>
          </FrontHeaderLeft>
        </FrontHeaderInner>
      </FrontHeader>


      <FrontBody>
        <ColumnLayout>
          <GridColumn style={{paddingTop:"7px" ,paddingBottom:"3px"}}>
            <TextWrapper>
              {strPreset && (strPreset.map((item, index) => (
                <GridRow key={index} onClick={() => onClickPresetItem(index)}>
                  <TextContent>
                    <Cell>
                      <LeftAlignText style={{ fontSize: "13px" }}>アンテナ間の距離 = </LeftAlignText><RightAlignText>{item.antGap}</RightAlignText>
                    </Cell>
                    <Cell style={{ width: "125px" }}>
                      <LeftAlignText style={{ fontSize: "13px", marginLeft: "13px" }}>位相差[rad]= </LeftAlignText><RightAlignText>{item.phase}°</RightAlignText>
                    </Cell>
                  </TextContent>
                </GridRow>
              )))}
            </TextWrapper>
          </GridColumn>
        </ColumnLayout>
      </FrontBody>
    </Box >
  )
};
const dispD = (value) => {
  const fractions = { 1.0: "" }; // Special case for 1

  // Function to simplify fractions
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const simplifyFraction = (numerator, denominator) => {
    const gcdValue = gcd(numerator, denominator);
    return `${numerator / gcdValue}/${denominator / gcdValue}`;
  };

  for (let i = 0; i <= 12; i += 0.25) {
    if (i === 1) continue; // Skip 1 as it's already handled
    let fraction = '';
    if (i % 1 === 0) { // Whole number
      fraction = i === 0 ? '0' : i.toString(); // Special case for 0
    } else { // Fractional part
      const numerator = Math.round((i % 1) * 4);
      const denominator = 4;
      fraction = simplifyFraction(numerator, denominator);
    }
    fractions[i] = fraction;
  }

  return (fractions[value] ?? value.toString()) + " λ";
}