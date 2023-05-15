import React from "react";

interface Props {
  text: any;
  score: string;
  gesture: string;
}

// classifiers are: ["None", "Closed_Fist", "Open_Palm", "Pointing_Up","Thumb_Down", "Thumb_Up", "Victory", "ILoveYou"]
let color = "";
let font = "";

const Message = ({ text, score, gesture }: Props) => {
  function decideGesture() {
    switch (gesture) {
      case "None":
        return (color = "blue");
      case "Closed_Fist":
        return (color = "green");
      case "Open_Palm":
        return (color = "pink");
      case "Pointing_Up":
        return (color = "yellow");
      case "Thumb_Down":
        return (color = "grey");
      case "Thumb_Up":
        return (color = "purple");
      case "Victory":
        return (color = "red");
      case "ILoveYou":
        return (color = "orange");
      default:
        return (color = "black");
    }
  }

  function evaluateConfidence() {
    var scoreNumber: number = +score;
    if (scoreNumber > 80) {
      font = "1000";
    } else {
      font = "normal";
    }
  }
  decideGesture();
  evaluateConfidence();
  return <div style={{ color: color, fontWeight: font }}>{text}</div>;
};

export default Message;
