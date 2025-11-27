package com.advice.team1.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class MainController {
    @RequestMapping("/app")

    public String index() {
        return "forward:/index.html";
    }
}
