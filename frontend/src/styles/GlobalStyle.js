// src/styles/GlobalStyle.js
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'IsYun';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2202-2@1.0/LeeSeoyun.woff') format('woff');
    font-weight: normal;
    font-display: swap;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'IsYun', monospace;
    background-color: #fff;
    color: #000000ff;
  }

  button, input {
    font-family: inherit;
  }
  
  /* 커서 숨기기*/
  input, textarea {
    caret-color: transparent;
    outline:  none; 
  }
`;

export default GlobalStyle;
