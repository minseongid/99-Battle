package com.battle99.backend.room;

import com.battle99.backend.room.dto.ApiError;
import com.battle99.backend.room.exception.DuplicateNicknameException;
import com.battle99.backend.room.exception.NoJoinableRoomException;
import com.battle99.backend.room.exception.NotEligibleToStartException;
import com.battle99.backend.room.exception.NotHostException;
import com.battle99.backend.room.exception.RoomAlreadyStartedException;
import com.battle99.backend.room.exception.RoomFullException;
import com.battle99.backend.room.exception.RoomNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({RoomNotFoundException.class, NoJoinableRoomException.class})
    public ResponseEntity<ApiError> handleNotFound(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiError(ex.getMessage()));
    }

    @ExceptionHandler({
            RoomFullException.class, RoomAlreadyStartedException.class,
            DuplicateNicknameException.class, NotEligibleToStartException.class
    })
    public ResponseEntity<ApiError> handleConflict(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiError(ex.getMessage()));
    }

    @ExceptionHandler(NotHostException.class)
    public ResponseEntity<ApiError> handleForbidden(NotHostException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiError(ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiError(ex.getMessage()));
    }
}
