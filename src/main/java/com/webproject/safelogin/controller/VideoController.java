package com.webproject.safelogin.controller;


import com.webproject.safelogin.model.Video;
import com.webproject.safelogin.model.VideoResponseDTO;
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

    @PostMapping("/addVideo")
    public ResponseEntity<String> addVideo(@RequestBody Video video) {
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
}
