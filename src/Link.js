import styled from "styled-components";
import React, { useState, useEffect } from 'react';
const UIWrapper = styled.div`
  padding-left:40px;
  padding-right:40px;
  width:fit-content;
  user-select: none;  /* 全てのブラウザでテキスト選択を無効にする */
  -webkit-user-select: none;  /* Safari 用 */
  -moz-user-select: none;  /* Firefox 用 */
  -ms-user-select: none;  /* Internet Explorer/Edge 用 */
`
const UIBreadCrumbs = styled.div`
  padding-top:2px;
  width:100%;
  color:#16191f;
`
const UIRoot = styled.div`
  float:left;
  font-size:16px;
  font-weight:400;
  font-family:Menlo, Consolas, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif;
  -webkit-font-smoothing:auto;
`
const ListBreadCrumbs = styled.div`
  display:flex;
  align-items:center;
  padding:0;
  margin-bottom:3px;
  width:100%;
`
const BreadCrumbsItem = styled.li`
  display:flex;
  flex-direction:row;
  padding:0;
  margin:0;
  text-align:left;
`

const ItemLabel = styled.a`
color:#0073bb;
font-weight:inherit;
text-decoration-color:transparent;
text-decoration:none;
cursor:pointer;
line-height:inherit;
display:flex;
align-items:center;
display : inline-block;
align-items: center; /* Align text vertically */

&:hover{
  text-decoration:underline;
}
`
const Textlb = styled.span`
line-height:inherit;
font-size:15px;
font-family:Arial,sans-serif, Helvetica,Circular;

`
const ItemAnchor = styled.div`
  margin:4px 3px 0px 3px;
  color:#687078;
  height:100%;
  width:15px;
`
const AnchorInner = styled.div`
  padding:0px;
  position:relative;
  stroke-width:2px;
  pointer-events:none;  
`



export const Link = ({ linkobject, setShowWindow }) => {
  const [value, setvalue] = useState([]);
  useEffect(() => {
    if (linkobject !== null && linkobject.length !== 0) {
      setvalue(formatBreadcrumbs());
    }
  }, [linkobject])
  const handleClick = (index) => {
    setShowWindow(value[index].link);
  };
  const formatBreadcrumbs = () => {
    return linkobject.map((item, index) => ({
      link: item.link,
      title: item.title,
      show: index !== linkobject.length - 1,
    }));
  }
  return (
    <UIWrapper>
      <UIBreadCrumbs>
        <UIRoot>
          <ListBreadCrumbs>
            {value && (value.map((element, index) => (
              <BreadCrumbsItem key={index}>
                <ItemLabel>
                  <Textlb><span onClick={() => handleClick(index)}>{element.title}</span></Textlb>
                </ItemLabel>
                {element.show && (
                  <ItemAnchor>
                    <AnchorInner>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="m4 1 7 7-7 7" stroke="rgb(60,60,60)" strokeWidth="2.0px" fill="none" /></svg>
                    </AnchorInner>
                  </ItemAnchor>
                )}
                {!element.show && (
                  <ItemAnchor>
                    <AnchorInner>
                    </AnchorInner>
                  </ItemAnchor>
                )}
              </BreadCrumbsItem>
            )))}
          </ListBreadCrumbs>
        </UIRoot>
      </UIBreadCrumbs>

    </UIWrapper>
  )
};
