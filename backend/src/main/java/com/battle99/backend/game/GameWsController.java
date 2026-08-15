package com.battle99.backend.game;

import com.battle99.backend.game.dto.AnswerSubmitRequest;
import com.battle99.backend.game.dto.RematchRequest;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class GameWsController {

    private final GameEngineService gameEngineService;

    public GameWsController(GameEngineService gameEngineService) {
        this.gameEngineService = gameEngineService;
    }

    @MessageMapping("/room/{roomId}/answer")
    public void submitAnswer(@DestinationVariable String roomId, AnswerSubmitRequest request) {
        gameEngineService.submitAnswer(roomId, request.playerId(), request.answer());
    }

    @MessageMapping("/room/{roomId}/rematch")
    public void rematch(@DestinationVariable String roomId, RematchRequest request) {
        gameEngineService.rematch(roomId, request.playerId(), request.wantRematch());
    }
}
