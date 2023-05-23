import React from "react";

interface Props {
  text: any;
  score: string;
  gesture: string;
}

// classifiers are: ["None", "Closed_Fist", "Open_Palm", "Pointing_Up","Thumb_Down", "Thumb_Up", "Victory", "ILoveYou"]

const Message = ({ text, score, gesture }: Props) => {
  function decideGesture() {
    switch (gesture) {
      case "None":
        return "blue";
      case "Closed_Fist":
        return "green";
      case "Open_Palm":
        return "pink";
      case "Pointing_Up":
        return "yellow";
      case "Thumb_Down":
        return "grey";
      case "Thumb_Up":
        return "purple";
      case "Victory":
        return "red";
      case "ILoveYou":
        return "orange";
      default:
        return "black";
    }
  }

  function evaluateConfidence() {
    var scoreNumber: number = +score;
    return scoreNumber > 75 ? "1000" : "normal";
  }

  const color = decideGesture();
  const fontWeight = evaluateConfidence();
  return <div style={{ color, fontWeight }}>{text}</div>;
};

export default Message;
