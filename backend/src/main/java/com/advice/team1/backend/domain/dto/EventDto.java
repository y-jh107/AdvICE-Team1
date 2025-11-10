package com.advice.team1.backend.domain.dto;

import com.advice.team1.backend.domain.entity.Event;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Date;

public class EventDto {

    // 요청 DTO(일정 등록)
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String name;
        private Date date;
        private String location;
    }

    // 응답 DTO(일정 조회)
    @Getter
    @Builder
    public static class Response {
        private Long id;
        private String name;
        private Date date;
        private String location;

        public static Response from(Event event) {
            return Response.builder()
                    .id(event.getId())
                    .name(event.getName())
                    .date(event.getDate())
                    .location(event.getLocation())
                    .build();
        }
    }
}
