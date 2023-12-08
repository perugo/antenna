import styled from 'styled-components';

export const BoxWrapper = styled.div`

`
export const Box = styled.div`
flex-direction:column;
display:flex;
  border-radius: 5px;
  overflow: hidden;
  box-sizing:border-box;
  background-color: rgb(255,255,255);
  border-spacing:0;
  cursor:auto;
  direction 1tr;
  empty-cells:show;
  hyphens:none;
  tab-size:8;
  text-align:left;
  text-indent:0;
  text-transform:none;
  widows:2;
  word-spacing:normal;
  font-weight:400;
  -webkit-font-smoothing:auto;
  word-break:bread-word;
  display:block;
  position:relative;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
  &::before{
    content:"";
    position:absolute;
    left:0px;
    width:100%;
    height:100%;
    pointer-events:none;
    box-sizing:border-box;
    border-top: 1px solid #eaeded;
    z-index:1;
  }
  &::after{
    content:"";
    position:absolute;
    left:0px;
    top:0px;
    width:100%;
    height:100%;
    pointer-events:none;
    box-sizing:border-box;
    box-shadow:0 1px 1px 0 rgba(0,28,36,0,3) 1px 1px 1px 1px 0 rgba(0,28,36,0.15), -1px 1px 1px 0 rgba(0,28,36,0.15);
    mix-blend-mode:multiply;
  }
`

export const FrontHeader = styled.div`
  border-bottom:1px solid #eaeded;
`
export const FrontHeaderInner = styled.div`
 width:100%;
 background-color: rgb(246,246,246);
 display:flex;
 padding:3px 20px 1px 20px;
 box-sizing:border-box;
 border:none;
 tex-align:left;
`
export const TitleWrapper = styled.div`
display:flex;
align-content:center;
font-size:18px;
color:#16191f;
`
export const CustomH3 = styled.span`
 font-size:18px;
 font-weight:500;
 font-family:Arial,sans-serif, Helvetica,Circular;
 -webkit-font-smoothing:auto;
 display:inline;
 margin:0px;
 color:rgb(40,40,40);
 line-height:1.1;
 padding-top:1px;
`
export const FrontBody = styled.div`
position:relative;
padding:6px 20px 8px 20px;
`

export const ColumnLayout = styled.div`
  margin:-10px;
  display:flex;
  flex-wrap:wrap;
  color::#16191f;
  box-sizing:border-box;
  border-collapse:separete;
  direction:1tr;
  flex-direction:column;


  cursor:auto;
  direction:1tr;
  text-align:left;
  font-size:18px;
  color:#16191f;
  font-weight:500;
  font-family:times new roman,serif;
`
export const GridColumn = styled.div`
  padding:10px 8px 5px 8px;
  box-sizing:border-box;
  display:flex;
  position:relative;
  flex-direction:column;
`

export const FrontHeaderLeft = styled.div`
line-height:none;
display:flex;
flex-direction:row;
`
export const RadioButton = styled.label`
  font-size: 15px;
  display:flex;
  position:relative;
  align-items:center;
  margin-left:1px;
  margin-right:3px;
`
export const RadioButtonInput=styled.input`
margin:auto;
width:14px;
height:14px;
`
export const OutlinedButtonText = styled.span`
font-size:15px;
font-weight:500;
color:rgb(40,40,40);
`

export const OutlinedButtonContainer = styled.button`
background-color:rgb(255,255,255);
border-color:rgb(0,0,0);
border-style:solid;
border-width:1px;
border-radius:2px;
padding:0px 15px;
line-height:1.3;
display:flex;
justify-content:center;
&:hover {
  border-color:rgb(100,100,100);
  background-color:rgb(240,240,240);
}
cursor:pointer;
margin: 0px 0px 1px 30px;
`


export const ButtonOrangeContainer = styled.div`
  text-align: center;
  margin: 0px 0px 2px 30px;
  cursor:pointer;
  display:flex;
  justify-content:center;

`
export const ButtonOrange = styled.div`
  backface-visibility: hidden;
  background-color:rgb(255,153,0);
  border: 0;
  color:rgb(0,0,0);
  font-family:sans-serif,Arial, Helvetica,Circular,Helvetica,sans-serif;
  font-weight: 500;
  font-size:15px;
  line-height:1.3;
  position: relative;
  text-align: left;
  text-decoration: none;
  letter-spacing:.45px;
  border-radius:4px;
  padding: 0px 15px;
  transition: transform .2s;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  line-height:1.4;
  &:hover{
    background-color:rgb(236,114,17);
  }
  &:active{
    background-color:#EB5F07;
}
`
export const SVGInner = styled.div`
  position: relative;
  width: inherit;
  height: inherit;
  margin: auto;
`;
export const StyledImg = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2; // Ensure the image is always on top
`;
export const SliderWrapper = styled.div`
  padding:0px;
  padding-bottom:2px;
  line-height:24px;
  cursor:grab;
`