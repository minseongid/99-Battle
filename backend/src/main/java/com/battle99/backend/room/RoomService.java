package com.battle99.backend.room;

import com.battle99.backend.room.dto.CreateRoomRequest;
import com.battle99.backend.room.dto.JoinRoomRequest;
import com.battle99.backend.room.dto.PlayerDto;
import com.battle99.backend.room.dto.PublicRoomSummary;
import com.battle99.backend.room.dto.RoomResponse;
import com.battle99.backend.room.exception.DuplicateNicknameException;
import com.battle99.backend.room.exception.NoJoinableRoomException;
import com.battle99.backend.room.exception.NotEligibleToStartException;
import com.battle99.backend.room.exception.NotHostException;
import com.battle99.backend.room.exception.RoomAlreadyStartedException;
import com.battle99.backend.room.exception.RoomFullException;
import com.battle99.backend.room.exception.RoomNotFoundException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class RoomService {

    private static final String ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int ROOM_CODE_LENGTH = 6;
    private static final long DISCONNECT_GRACE_SECONDS = 12;

    private final Map<String, Room> rooms = new ConcurrentHashMap<>();
    // sessionId -> "roomId:playerId"
    private final Map<String, String> sessionPresence = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final SecureRandom random = new SecureRandom();
    private final SimpMessagingTemplate messagingTemplate;

    public RoomService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public RoomResponse createRoom(CreateRoomRequest request) {
        String roomId = generateRoomCode();
        String roomName = (request.roomName() == null || request.roomName().isBlank())
                ? request.hostNickname() + "님의 방"
                : request.roomName();
        Room room = new Room(roomId, roomName, request.maxPlayers(), request.mathEventCount(), request.hostPlayerId());
        room.getPlayers().put(request.hostPlayerId(), new Player(request.hostPlayerId(), request.hostNickname()));
        rooms.put(roomId, room);
        broadcastPublicRooms();
        return toResponse(room);
    }

    public RoomResponse joinRoom(String roomId, JoinRoomRequest request) {
        Room room = getRoomOrThrow(roomId);
        synchronized (room) {
            if (room.getPlayers().containsKey(request.playerId())) {
                return toResponse(room);
            }
            if (room.getStatus() != RoomStatus.WAITING) {
                throw new RoomAlreadyStartedException();
            }
            if (room.isFull()) {
                throw new RoomFullException();
            }
            if (hasNicknameConflict(room, request.nickname())) {
                throw new DuplicateNicknameException();
            }
            room.getPlayers().put(request.playerId(), new Player(request.playerId(), request.nickname()));
            broadcast(room);
            broadcastPublicRooms();
            return toResponse(room);
        }
    }

    public RoomResponse quickMatch(JoinRoomRequest request) {
        for (Room room : rooms.values()) {
            synchronized (room) {
                if (room.getStatus() == RoomStatus.WAITING && !room.isFull()
                        && !hasNicknameConflict(room, request.nickname())) {
                    room.getPlayers().put(request.playerId(), new Player(request.playerId(), request.nickname()));
                    broadcast(room);
                    broadcastPublicRooms();
                    return toResponse(room);
                }
            }
        }
        throw new NoJoinableRoomException();
    }

    public List<PublicRoomSummary> listPublicRooms() {
        return rooms.values().stream()
                .filter(room -> room.getStatus() == RoomStatus.WAITING && !room.isFull())
                .map(room -> new PublicRoomSummary(
                        room.getRoomId(), room.getRoomName(),
                        room.getPlayers().size(), room.getMaxPlayers(), room.getMathEventCount()
                ))
                .toList();
    }

    public RoomResponse getRoom(String roomId) {
        return toResponse(getRoomOrThrow(roomId));
    }

    public boolean isNicknameTaken(String nickname) {
        String normalized = nickname.trim();
        return rooms.values().stream()
                .flatMap(room -> room.getPlayers().values().stream())
                .anyMatch(p -> p.getNickname().trim().equalsIgnoreCase(normalized));
    }

    public RoomResponse updateSettings(String roomId, String playerId, int maxPlayers, int mathEventCount) {
        Room room = getRoomOrThrow(roomId);
        synchronized (room) {
            if (room.getStatus() != RoomStatus.WAITING) {
                throw new RoomAlreadyStartedException();
            }
            if (!playerId.equals(room.getHostPlayerId())) {
                throw new NotHostException();
            }
            if (maxPlayers < room.getPlayers().size()) {
                throw new IllegalArgumentException("현재 인원보다 적게 설정할 수 없어요.");
            }
            room.setMaxPlayers(maxPlayers);
            room.setMathEventCount(mathEventCount);
            broadcast(room);
            broadcastPublicRooms();
            return toResponse(room);
        }
    }

    public void leaveRoom(String roomId, String playerId) {
        Room room = rooms.get(roomId);
        if (room == null) {
            return;
        }
        synchronized (room) {
            boolean wasHost = playerId.equals(room.getHostPlayerId());
            room.getPlayers().remove(playerId);
            if (room.getPlayers().isEmpty()) {
                rooms.remove(roomId);
                broadcastPublicRooms();
                return;
            }
            if (wasHost) {
                String newHostId = room.getPlayers().keySet().iterator().next();
                promoteHost(room, newHostId);
            }
            broadcast(room);
            broadcastPublicRooms();
        }
    }

    public RoomResponse setReady(String roomId, String playerId, boolean ready) {
        Room room = getRoomOrThrow(roomId);
        synchronized (room) {
            Player player = room.getPlayers().get(playerId);
            if (player == null) {
                throw new RoomNotFoundException(roomId);
            }
            if (room.getStatus() != RoomStatus.WAITING) {
                throw new RoomAlreadyStartedException();
            }
            if (playerId.equals(room.getHostPlayerId())) {
                return toResponse(room);
            }
            player.setReady(ready);
            broadcast(room);
            return toResponse(room);
        }
    }

    public RoomResponse startGame(String roomId, String playerId) {
        Room room = getRoomOrThrow(roomId);
        synchronized (room) {
            if (room.getStatus() != RoomStatus.WAITING) {
                throw new RoomAlreadyStartedException();
            }
            if (!playerId.equals(room.getHostPlayerId())) {
                throw new NotHostException();
            }
            if (!room.canStart()) {
                throw new NotEligibleToStartException();
            }
            room.setStatus(RoomStatus.COUNTDOWN);
            broadcast(room);
            broadcastPublicRooms();
            return toResponse(room);
        }
    }

    public void touchPresence(String roomId, String playerId, String sessionId) {
        Room room = rooms.get(roomId);
        if (room == null) {
            return;
        }
        synchronized (room) {
            Player player = room.getPlayers().get(playerId);
            if (player != null) {
                player.touch();
            }
        }
        sessionPresence.put(sessionId, roomId + ":" + playerId);
    }

    public void handleSessionDisconnect(String sessionId) {
        String mapping = sessionPresence.remove(sessionId);
        if (mapping == null) {
            return;
        }
        int idx = mapping.indexOf(':');
        String roomId = mapping.substring(0, idx);
        String playerId = mapping.substring(idx + 1);
        Room room = rooms.get(roomId);
        if (room == null) {
            return;
        }
        Player player = room.getPlayers().get(playerId);
        if (player == null) {
            return;
        }
        Instant disconnectedAt = Instant.now();
        scheduler.schedule(() -> {
            Room r = rooms.get(roomId);
            if (r == null) {
                return;
            }
            synchronized (r) {
                Player p = r.getPlayers().get(playerId);
                if (p == null) {
                    return;
                }
                if (!p.getLastSeenAt().isAfter(disconnectedAt)) {
                    leaveRoom(roomId, playerId);
                }
            }
        }, DISCONNECT_GRACE_SECONDS, TimeUnit.SECONDS);
    }

    private void promoteHost(Room room, String newHostId) {
        room.setHostPlayerId(newHostId);
        Player newHost = room.getPlayers().get(newHostId);
        if (newHost != null) {
            newHost.setReady(false);
        }
    }

    private boolean hasNicknameConflict(Room room, String nickname) {
        return room.getPlayers().values().stream()
                .anyMatch(p -> p.getNickname().trim().equalsIgnoreCase(nickname.trim()));
    }

    private Room getRoomOrThrow(String roomId) {
        Room room = rooms.get(roomId);
        if (room == null) {
            throw new RoomNotFoundException(roomId);
        }
        return room;
    }

    private void broadcast(Room room) {
        messagingTemplate.convertAndSend("/topic/room/" + room.getRoomId(), toResponse(room));
    }

    private void broadcastPublicRooms() {
        messagingTemplate.convertAndSend("/topic/rooms/public", listPublicRooms());
    }

    private String generateRoomCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(ROOM_CODE_LENGTH);
            for (int i = 0; i < ROOM_CODE_LENGTH; i++) {
                sb.append(ROOM_CODE_CHARS.charAt(random.nextInt(ROOM_CODE_CHARS.length())));
            }
            code = sb.toString();
        } while (rooms.containsKey(code));
        return code;
    }

    private RoomResponse toResponse(Room room) {
        String hostId = room.getHostPlayerId();
        List<PlayerDto> playerDtos = room.getPlayers().values().stream()
                .map(p -> new PlayerDto(p.getPlayerId(), p.getNickname(), p.isReady(), p.getPlayerId().equals(hostId)))
                .toList();
        return new RoomResponse(
                room.getRoomId(), room.getRoomName(), room.getMaxPlayers(),
                room.getMathEventCount(), room.getStatus(), playerDtos
        );
    }
}
