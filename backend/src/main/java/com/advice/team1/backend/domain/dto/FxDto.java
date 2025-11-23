package com.advice.team1.backend.domain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FxDto {

    //통화코드(JPY, USD 등)
    @JsonProperty("cur_unit")
    private String currency;

    //국가명(일본, 미국 등)
    @JsonProperty("cur_nm")
    private String currencyName;

    //매매 기준율
    @JsonProperty("deal_bas_r")
    private String dealBasRate;

    //현찰 팔 때
    @JsonProperty("tts")
    private String ttsRate;

    //현찰 살 때
    @JsonProperty("ttb")
    private String ttbRate;
}
