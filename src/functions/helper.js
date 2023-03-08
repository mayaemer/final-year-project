import Axios from "axios";

export default function formatItem(data) {
    let i;
    let formatData = [];
    let specialCharacters = [
      "!",
      '"',
      "#",
      "$",
      "%",
      "&",
      "'",
      "(",
      ")",
      "*",
      "+",
      ",",
      ".",
      "/",
      ":",
      ";",
      "<",
      "=",
      ">",
      "?",
      "@",
      "[",
      "]",
      "^",
      "`",
      "{",
      "|",
      "}",
      "~",
    ];
    for (i = 0; i < data.length; i++) {
      if (specialCharacters.includes(data[i])) {
          formatData.push("\\");
          formatData.push(data[i]);
      } else {
          formatData.push(data[i]);
      }
    }
  
    const formattedData = formatData.toString().split(",").join("");
    return formattedData;
  }

  export function getCurrentDateTime() {
    const date = new Date();
    const currentDate =
      date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    const currentTime =
      date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    const currDateTime = currentDate + " " + currentTime;
    return currDateTime;
  }

