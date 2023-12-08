import styled from "styled-components";
import { BoxPreset } from "./Box/BoxPreset";
import { BoxAntenna } from "./Box/BoxAntenna";
import { BoxWaveForm } from './Box/BoxWaveForm';
import { BoxDomainGrid } from './Box/BoxDomainGrid';
import { BoxColorThreshold } from "./Box/BoxColorThreshold";

const SettingWrapper = styled.div`
  position:relative;
  flex-grow:1;
  min-width:520px;
  height:calc(100vh - 45px);
  margin-left:3px;
  display:flex;
  flex-direction:column;
  background-color:rgb(240,240,240);
  user-select: none;  /* 全てのブラウザでテキスト選択を無効にする */
  -webkit-user-select: none;  /* Safari 用 */
  -moz-user-select: none;  /* Firefox 用 */
  -ms-user-select: none;  /* Internet Explorer/Edge 用 */
`
const ToggleWrapper = styled.div`
  width:100%;
  flex-grow:1;
  overflow-y: scroll; // Always show vertical scrollbar
  max-height:100%;
  display: flex;  /* flex container */
  flex-direction: column;  /* column layout */

  /* Styling for the scrollbar */
  &::-webkit-scrollbar {
    width: 10px;  // Width of the scrollbar. Adjust as needed.
  }

  &::-webkit-scrollbar-track {
    background: rgb(230,230,230);  // Background of the track (part scrollbar moves in)
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgb(170,170,170);  // Color of the actual scrollbar
    border-radius: 4px;  // Optional: Makes the scrollbar rounded
    border: 2px solid transparent; // Prevents border from being offset on macOS browsers
    background-clip: padding-box;  // Makes the background color opaque (not transparent)
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgb(130,130,130);  // Darken scrollbar when hovered
  }
`
const ToggleInner = styled.div`
  width:100%;
  height:100%;
  background-color:rgb(240,240,240);
  display:flex;
  flex-direction:column;
  align-items: stretch;  /* 子要素を親の幅にストレッチさせる */
  `
const BoxWrapper = styled.div`
  display:flex;
  flex-direction:column;
  gap:8px;
  padding:8px 10px 0px 10px;
`
const Spacer = styled.div`
  flex-grow: 1;  /* 利用可能なスペースを取得 */
`;

const ButtonDownload = styled.div`
  backface-visibility: hidden;
  background-color:rgb(255,153,0);
  border: 0;
  box-sizing: border-box;
  color:rgb(0,0,0);
  cursor: pointer;
  display: inline-block;
  font-family: Circular,Helvetica,sans-serif;
  font-size:20px;
  font-weight: 500;
  line-height: 1.8;
  padding:0px 15px;
  border-radius:3px;
  margin:10px 0px 18px 0px;
  position: relative;
  text-align: left;
  text-decoration: none;
  transition: transform .2s;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;

  &:hover{
    background-color:rgb(236,114,17);
  }
  &:active{
    background-color:#EB5F07;
  }
`
const ButtonContainer = styled.div`
margin-top:4px;
grid-gap:50px;
display:flex;
justify-content:center;
align-items:center;
`

const SVGWrapperCombined = styled.div`
  height: 60px;
  width: 60px;
  display: flex;
`;

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
  z-index: 2;
`;
const FlexSer = styled.div`
display:flex;
flex-direction:row;
grid-gap:5px;
margin-bottom:5px;
`
export const RightBar = ({ antennaPresets, antenna, setAntenna, spatial, setSpatial, amplitudeScaler, setAmplitudeScaler, color, setColor, push, reset, showSimulation, setShowSimulation, moveVideo, setMoveVideo, setShowWindow }) => {

  const presetBoxProps = {
    antennaPresets,
    antenna, setAntenna
  }
  const antennaBoxProps = {
    antenna, setAntenna,
    amplitudeScaler, setAmplitudeScaler,
    setShowWindow
  }
  const waveformBoxProps={
    amplitudeScaler,setAmplitudeScaler,
    setShowWindow
  }
  const domainGridBoxprops = {
    antenna, setAntenna,
    spatial, setSpatial
  }
  const colorThresholdBoxProps = {
    color, setColor
  };
  const StopButton = ({ onClick }) => (
    <SVGWrapperCombined onClick={onClick}>
      <SVGInner>
        <StyledImg
          src={`${process.env.PUBLIC_URL}/stopButton.svg`}
          alt="Stop Button in Red Circle"
        />
      </SVGInner>
    </SVGWrapperCombined>
  );
  const PlayPauseButton = ({ moveVideo, setMoveVideo }) => (
    moveVideo ? (
      <SVGWrapperCombined onClick={() => setMoveVideo(false)}>
        <SVGInner>
          <StyledImg
            src={`${process.env.PUBLIC_URL}/pauseButton.svg`}
            alt="Pause Button in Red Circle"
          />
        </SVGInner>
      </SVGWrapperCombined>
    ) : (
      <SVGWrapperCombined onClick={() => setMoveVideo(true)}>
        <SVGInner>
          <StyledImg
            src={`${process.env.PUBLIC_URL}/playButton.svg`}
            alt="Play Button in Red Circle"
          />
        </SVGInner>
      </SVGWrapperCombined>
    )
  );
  return (
    <SettingWrapper>
      <ToggleWrapper>
        <ToggleInner>
          <BoxWrapper>
            <BoxPreset {...presetBoxProps}></BoxPreset>
            <BoxAntenna {...antennaBoxProps}></BoxAntenna>
            <BoxDomainGrid {...domainGridBoxprops}></BoxDomainGrid>
            <BoxWaveForm {...waveformBoxProps} />
            <BoxColorThreshold {...colorThresholdBoxProps}></BoxColorThreshold>
          </BoxWrapper>
          <Spacer />
          <ButtonContainer>
            {showSimulation && (
              <FlexSer>
                <StopButton onClick={() => setShowSimulation(false)} />
                <PlayPauseButton moveVideo={moveVideo} setMoveVideo={setMoveVideo} />
              </FlexSer>
            )}
            <ButtonDownload onClick={push}>シミュレーション実行</ButtonDownload>
            <ButtonDownload onClick={reset}>初期化</ButtonDownload>
          </ButtonContainer>
        </ToggleInner>
      </ToggleWrapper>
    </SettingWrapper >
  )
}
