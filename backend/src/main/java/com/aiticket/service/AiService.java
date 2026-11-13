package com.aiticket.service;

import com.aiticket.dto.AiSummaryResponse;
import com.aiticket.model.Category;
import com.aiticket.model.Ticket;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
public class AiService {

    private static final Logger logger = LoggerFactory.getLogger(AiService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ollama.api.url:http://localhost:11434/api/generate}")
    private String ollamaUrl;

    @Value("${ollama.model:llama3}")
    private String ollamaModel;

    @Value("${ollama.connect-timeout-ms:3000}")
    private int connectTimeoutMs;

    @Value("${ollama.read-timeout-ms:5000}")
    private int readTimeoutMs;

    public AiService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofMillis(3000))
                .setReadTimeout(Duration.ofMillis(6000))
                .build();
        this.objectMapper = new ObjectMapper();
    }


    public AiSummaryResponse summarizeTicket(Ticket ticket) {
        try {
            logger.info("Attempting to generate AI summary via Ollama at {}", ollamaUrl);

            String prompt = String.format(
                    "You are an IT Support AI. Please provide a concise summary and suggested action for this support ticket.\n\n" +
                    "Ticket ID: %d\n" +
                    "Title: %s\n" +
                    "Category: %s\n" +
                    "Priority: %s\n" +
                    "Description: %s\n\n" +
                    "Format your response exactly as:\n" +
                    "SUMMARY: [1-2 sentences summarizing the issue]\n" +
                    "ACTION: [Recommended next step for the agent]",
                    ticket.getId(),
                    ticket.getTitle(),
                    ticket.getCategory(),
                    ticket.getPriority(),
                    ticket.getDescription()
            );

            Map<String, Object> requestPayload = new HashMap<>();
            requestPayload.put("model", ollamaModel);
            requestPayload.put("prompt", prompt);
            requestPayload.put("stream", false);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestPayload, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(ollamaUrl, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String aiText = root.path("response").asText("");

                if (!aiText.isBlank()) {
                    String summary = parseSection(aiText, "SUMMARY:", "ACTION:");
                    String action = parseSection(aiText, "ACTION:", null);

                    if (summary.isBlank()) {
                        summary = aiText;
                        action = "Review details and follow up with the customer.";
                    }

                    return new AiSummaryResponse(
                            true,
                            summary.trim(),
                            action.trim(),
                            ollamaModel,
                            "Generated with local Ollama AI model: " + ollamaModel
                    );
                }
            }
        } catch (ResourceAccessException ex) {
            logger.warn("Ollama is not running or unreachable at {}. Using rule-based fallback.", ollamaUrl);
        } catch (RestClientException ex) {
            logger.warn("Ollama request error: {}. Using rule-based fallback.", ex.getMessage());
        } catch (Exception ex) {
            logger.warn("Unexpected error when calling Ollama: {}. Using rule-based fallback.", ex.getMessage());
        }

        // Graceful Heuristic Fallback
        return generateHeuristicFallback(ticket);
    }

    private String parseSection(String text, String startMarker, String endMarker) {
        int startIndex = text.indexOf(startMarker);
        if (startIndex == -1) {
            return "";
        }
        startIndex += startMarker.length();

        if (endMarker != null) {
            int endIndex = text.indexOf(endMarker, startIndex);
            if (endIndex != -1) {
                return text.substring(startIndex, endIndex).trim();
            }
        }
        return text.substring(startIndex).trim();
    }

    private AiSummaryResponse generateHeuristicFallback(Ticket ticket) {
        String snippet = ticket.getDescription();
        if (snippet != null && snippet.length() > 140) {
            snippet = snippet.substring(0, 140) + "...";
        }

        String summary = String.format(
                "Ticket #%d: A %s-priority %s issue. User reported: \"%s\"",
                ticket.getId(),
                ticket.getPriority().name().toLowerCase(),
                ticket.getCategory().name().toLowerCase(),
                snippet
        );

        String action;
        if (ticket.getCategory() == Category.TECHNICAL) {
            action = "Inspect error logs, verify system health, and test reproduction steps.";
        } else if (ticket.getCategory() == Category.BILLING) {
            action = "Review customer invoices, check transaction IDs, and verify payment gateway status.";
        } else {
            action = "Reach out to user for additional context and verify account privileges.";
        }

        return new AiSummaryResponse(
                true,
                summary,
                action,
                "Heuristic (Ollama Offline)",
                "Ollama is offline on localhost:11434. To enable LLM summaries, run 'ollama run llama3'."
        );
    }
}
