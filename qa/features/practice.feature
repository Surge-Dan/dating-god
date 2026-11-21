Feature: Independent practice
  Scenario: Starting requires adult confirmation
    Given a fresh practice page
    When I request a practice without confirming adulthood
    Then no conversation is started
  Scenario: Local partner preparation works without model access
    Given a fresh practice page
    When I prepare a custom partner offline
    Then the partner editor is visible
