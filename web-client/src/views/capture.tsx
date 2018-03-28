import * as React from "react";

import NavigationBar from "../components/navigation-bar";
import CaptureDialogue from "../components/capture-dialogue";

export interface Props {}

export interface CaptureState {}

class Capture extends React.Component<Props, CaptureState> {
  render() {
    return (
      <div className={`w-100 vh-100 relative`}>
        {/* Navigation Bar */}
        <div className={`z-max`}>
          <NavigationBar />
        </div>

        <div
          className={`absolute`}
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            minWidth: "20em"
          }}
        >
          <CaptureDialogue />
        </div>
      </div>
    );
  }
}

export default Capture;
