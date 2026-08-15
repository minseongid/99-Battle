package com.battle99.backend.game;

import com.battle99.backend.game.dto.GameMessage;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rooms")
public class GameController {

    private final GameEngineService gameEngineService;

    public GameController(GameEngineService gameEngineService) {
        this.gameEngineService = gameEngineService;
    }

    @GetMapping("/{roomId}/game-state")
    public GameMessage getGameState(@PathVariable String roomId) {
        return gameEngineService.getSnapshot(roomId);
    }
}
