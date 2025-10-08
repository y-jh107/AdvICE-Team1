// src/styles/GlobalStyle.js
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'D2Coding';
    src: 
url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_three@1.0/D2Coding.woff') 
format('woff');
    font-weight: normal;
    font-display: swap;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'D2Coding', monospace;
    background-color: #fff;
    color: #333;
  }

  button, input {
    font-family: inherit;
  }
`;

export default GlobalStyle;

