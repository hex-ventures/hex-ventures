// React
import * as React from "react";

// Components
import InputCapture from "./input-capture";
import InputSurface from "./input-surface";
import ButtonToggle from "./button-toggle";
import ReactTooltip from "react-tooltip";

interface Props {
  handleCaptureTextChange: (text: string) => void;
  handleCapture: () => void;
  handleExpand: () => void;
  isCapturing: boolean;
  handleIsCapturing: () => void;
  handleSurfaceTextChange: (text: string) => void;
  handleSurface: () => void;
  surfaceStartingText?: string;
  handleClear: () => void;
}

const ListHeader = (props: Props) => {
  return (
    <div className={`flex pa2 w-100 shadow-1 br4 bg-white`}>
      <div className={`flex-grow`}>
        {props.isCapturing ? (
          <InputCapture
            handleOnChange={props.handleCaptureTextChange}
            handleCapture={props.handleCapture}
            handleExpand={props.handleExpand}
          />
        ) : (
          <InputSurface
            handleOnChange={props.handleSurfaceTextChange}
            handleSurface={props.handleSurface}
            handleClear={props.handleClear}
            startingHTML={props.surfaceStartingText}
          />
        )}
      </div>
      <div
        className={`pa1`}
        data-tip={`Toggle to ${props.isCapturing ? "search" : "capture"}`}
      >
        <ButtonToggle
          isRight={props.isCapturing}
          onClick={props.handleIsCapturing}
        />
      </div>
      <ReactTooltip />
    </div>
  );
};

export default ListHeader;
