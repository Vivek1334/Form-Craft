package com.surveybuilder.controller;

import com.surveybuilder.model.Answer;
import com.surveybuilder.model.Question;
import com.surveybuilder.model.Response;
import com.surveybuilder.model.Survey;
import com.surveybuilder.repository.ResponseRepository;
import com.surveybuilder.repository.SurveyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/surveys")
@CrossOrigin(origins = "*")
public class SurveyController {

    @Autowired
    private SurveyRepository surveyRepository;

    @Autowired
    private ResponseRepository responseRepository;

    @GetMapping
    public List<Survey> getAllSurveys() {
        return surveyRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Survey> getSurveyById(@PathVariable Long id) {
        return surveyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Survey> createSurvey(@RequestBody Survey survey) {
        if (survey.getQuestions() != null) {
            for (Question question : survey.getQuestions()) {
                question.setSurvey(survey);
            }
        }
        Survey savedSurvey = surveyRepository.save(survey);
        return new ResponseEntity<>(savedSurvey, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/responses")
    public ResponseEntity<Response> submitResponse(@PathVariable Long id, @RequestBody Response response) {
        if (!surveyRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        response.setSurveyId(id);
        if (response.getAnswers() != null) {
            for (Answer answer : response.getAnswers()) {
                answer.setResponse(response);
            }
        }
        Response savedResponse = responseRepository.save(response);
        return new ResponseEntity<>(savedResponse, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/responses")
    public ResponseEntity<List<Response>> getResponsesForSurvey(@PathVariable Long id) {
        if (!surveyRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        List<Response> responses = responseRepository.findBySurveyId(id);
        return ResponseEntity.ok(responses);
    }
}
