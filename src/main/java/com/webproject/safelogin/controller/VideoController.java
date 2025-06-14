package com.webproject.safelogin.controller;

import com.webproject.safelogin.model.Video;
import com.webproject.safelogin.repository.VideoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<Video> getVideo(@PathVariable Integer id) {
        return videoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/AllVideos")
    public List<Video> getAllVideos() {
        return videoRepository.findAll();
    }

}
