package com.webproject.safelogin.controller;


import com.webproject.safelogin.model.User;
import com.webproject.safelogin.model.Video;
import com.webproject.safelogin.model.VideoDTO;
import com.webproject.safelogin.model.VideoResponseDTO;
import com.webproject.safelogin.repository.UserRepository;
import com.webproject.safelogin.repository.VideoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
public class VideoController {

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/addVideo")
    public ResponseEntity<String> addVideo(@RequestBody VideoDTO videoDTO) {
        User owner = userRepository.findById(videoDTO.getOwnerId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Video video = new Video();
        video.setTitle(videoDTO.getTitle());
        video.setUrl(videoDTO.getUrl());
        video.setOwner(owner);

        videoRepository.save(video);
        return ResponseEntity.ok("Video saved");
    }


    @GetMapping("/getVideo/{id}")
    public ResponseEntity<VideoResponseDTO> getVideo(@PathVariable Integer id) {
        return videoRepository.findById(id)
                .map(video -> {
                    VideoResponseDTO dto = new VideoResponseDTO(
                            video.getId(),
                            video.getTitle(),
                            video.getUrl(),
                            video.getOwner() != null ? video.getOwner().getId() : null,
                            video.getOwner() != null ? video.getOwner().getNick() : null
                    );
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/AllVideos")
    public List<VideoResponseDTO> getAllVideos() {
        return videoRepository.findAll().stream()
                .map(video -> new VideoResponseDTO(
                        video.getId(),
                        video.getTitle(),
                        video.getUrl(),
                        video.getOwner() != null ? video.getOwner().getId() : null,
                        video.getOwner() != null ? video.getOwner().getNick() : null
                ))
                .collect(Collectors.toList());
    }
    @GetMapping("/videosByUser/{userId}")
    public List<VideoResponseDTO> getVideosByUser(@PathVariable Integer userId) {
        return videoRepository.findAll().stream()
                .filter(video -> video.getOwner() != null && video.getOwner().getId() == userId)
                .map(video -> new VideoResponseDTO(
                        video.getId(),
                        video.getTitle(),
                        video.getUrl(),
                        video.getOwner().getId(),
                        video.getOwner().getNick()
                ))
                .collect(Collectors.toList());
    }

}
