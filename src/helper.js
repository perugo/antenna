import { useEffect } from 'react';

export function updateLinkBread(showWindow,BREAD,setLinkBread){

};
export const useUpdateLinkBread=(BREAD,setLinkBread,showWindow)=>{
  const mappings = {
    home: BREAD.HOME,
    settingInputWave: BREAD.SETTING.INPUTWAVE,
  };
  useEffect(() => {
    setLinkBread(mappings[showWindow]);
  }, [showWindow]);
}


export const useSetInitialRect = (setRect) => {
  useEffect(() => {
    const height = window.innerHeight - 45;
    const width = window.innerWidth - 550;
    const side = height > width ? width : height;
    setRect({
      width: side,
      height: side
    });
  }, [setRect]);
}