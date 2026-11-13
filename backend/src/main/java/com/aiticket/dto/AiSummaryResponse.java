package com.aiticket.dto;

public class AiSummaryResponse {

    private boolean success;
    private String summary;
    private String suggestedAction;
    private String model;
    private String note;

    public AiSummaryResponse() {
    }

    public AiSummaryResponse(boolean success, String summary, String suggestedAction, String model, String note) {
        this.success = success;
        this.summary = summary;
        this.suggestedAction = suggestedAction;
        this.model = model;
        this.note = note;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getSuggestedAction() {
        return suggestedAction;
    }

    public void setSuggestedAction(String suggestedAction) {
        this.suggestedAction = suggestedAction;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
