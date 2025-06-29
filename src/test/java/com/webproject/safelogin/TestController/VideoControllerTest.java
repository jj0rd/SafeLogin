package com.webproject.safelogin.TestController;

import com.webproject.safelogin.controller.VideoController;
import com.webproject.safelogin.model.User;
import com.webproject.safelogin.model.Video;
import com.webproject.safelogin.model.VideoDTO;
import com.webproject.safelogin.repository.UserRepository;
import com.webproject.safelogin.repository.VideoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webproject.safelogin.service.SubscriptionService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(VideoController.class)
public class VideoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VideoRepository videoRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private SubscriptionService subscriptionService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void addVideo_ShouldReturnOk() throws Exception {
        User owner = new User();
        owner.setId(1);
        owner.setNick("ownerNick");

        VideoDTO videoDTO = new VideoDTO();
        videoDTO.setTitle("Test Video");
        videoDTO.setUrl("http://test.video/url");
        videoDTO.setOwnerId(1);

        // Mock findById dla ownera
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));

        // Mock save - zwracamy video z ustawionym ID i ownerem
        Video savedVideo = new Video();
        savedVideo.setId(100);
        savedVideo.setTitle(videoDTO.getTitle());
        savedVideo.setUrl(videoDTO.getUrl());
        savedVideo.setOwner(owner);

        when(videoRepository.save(any(Video.class))).thenReturn(savedVideo);

        mockMvc.perform(post("/addVideo")
                        .with(user("testUser").roles("USER"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(videoDTO)))
                .andExpect(status().isOk())
                .andExpect(content().string("Video saved"));
    }

    @Test
    void getVideo_WhenVideoExists_ShouldReturnVideoResponseDTO() throws Exception {
        User owner = new User();
        owner.setId(1);
        owner.setNick("ownerNick");

        Video video = new Video();
        video.setId(100);
        video.setTitle("Test Video");
        video.setUrl("http://test.video/url");
        video.setOwner(owner);

        when(videoRepository.findById(100)).thenReturn(Optional.of(video));

        mockMvc.perform(get("/getVideo/100")
                        .with(user("testUser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.title").value("Test Video"))
                .andExpect(jsonPath("$.url").value("http://test.video/url"))
                .andExpect(jsonPath("$.ownerId").value(1))
                .andExpect(jsonPath("$.ownerNick").value("ownerNick"));
    }

    @Test
    void getVideo_WhenVideoNotFound_ShouldReturnNotFound() throws Exception {
        when(videoRepository.findById(999)).thenReturn(Optional.empty());

        mockMvc.perform(get("/getVideo/999")
                        .with(user("testUser").roles("USER")))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAllVideos_ShouldReturnList() throws Exception {
        User owner = new User();
        owner.setId(1);
        owner.setNick("ownerNick");

        Video video1 = new Video(1, "Video1", "url1", owner);
        Video video2 = new Video(2, "Video2", "url2", owner);

        when(videoRepository.findAll()).thenReturn(List.of(video1, video2));

        mockMvc.perform(get("/AllVideos")
                        .with(user("testUser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Video1"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].title").value("Video2"));
    }

    @Test
    void getVideosByUser_ShouldReturnFilteredList() throws Exception {
        User owner1 = new User();
        owner1.setId(1);
        owner1.setNick("owner1");

        User owner2 = new User();
        owner2.setId(2);
        owner2.setNick("owner2");

        Video video1 = new Video(1, "Video1", "url1", owner1);
        Video video2 = new Video(2, "Video2", "url2", owner2);

        when(videoRepository.findAll()).thenReturn(List.of(video1, video2));

        mockMvc.perform(get("/videosByUser/1")
                        .with(user("testUser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ownerId").value(1))
                .andExpect(jsonPath("$[0].title").value("Video1"))
                .andExpect(jsonPath("$").value(org.hamcrest.Matchers.hasSize(1)));
    }

    @Test
    void getSubscribedVideos_ShouldReturnVideosFromSubscriptions() throws Exception {
        User owner1 = new User();
        owner1.setId(1);
        owner1.setNick("owner1");

        User owner2 = new User();
        owner2.setId(2);
        owner2.setNick("owner2");

        Video video1 = new Video(1, "Video1", "url1", owner1);
        Video video2 = new Video(2, "Video2", "url2", owner2);

        // Subscriptions contains owner1 only
        when(subscriptionService.getSubscriptions(10)).thenReturn(Set.of(owner1));

        when(videoRepository.findAll()).thenReturn(List.of(video1, video2));

        mockMvc.perform(get("/subscribedVideos/10")
                        .with(user("testUser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ownerId").value(1))
                .andExpect(jsonPath("$[0].title").value("Video1"))
                .andExpect(jsonPath("$").value(org.hamcrest.Matchers.hasSize(1)));
    }
}
