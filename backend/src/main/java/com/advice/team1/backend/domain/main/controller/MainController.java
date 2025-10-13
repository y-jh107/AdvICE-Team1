package com.advice.team1.backend.domain.main.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class MainController {
    @RequestMapping("/")
    public String index() {
        return "forward:/index.html";
    }
}
