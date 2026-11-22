Feature: Independent practice
  Scenario: Starting requires adult confirmation
    Given a fresh practice page
    When I request a practice without confirming adulthood
    Then no conversation is started
  Scenario: Local partner preparation works without model access
    Given a fresh practice page
    When I prepare a custom partner offline
    Then the partner editor is visible

  Scenario: Adopting a character preserves the chosen scene
    Given a fresh practice page
    When I choose the park and select a character hidden by a filter
    Then both choices are shown in the same preparation

  Scenario: Entering an offline example does not replace preparation
    Given a fresh practice page
    When I open the closing example and return to my draft
    Then my original draft and connection help are still shown
