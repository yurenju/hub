Feature: Ticket validation

  Scenario: User bought a ticket and use it
    Given event is open for admission
    When user bought a ticket
    And user show the ticket for admission
    Then ticket is valid

  Scenario: User copied ticket from another user
    Given event is open for admission
    When user copied ticket from another user
    And another already used the ticket for admission
    And user show the ticket for admission
    Then ticket is invalid

  Scenario: User got ticket from another user
    Given event is open for admission
    When user got ticket from another user
    And user show the ticket for admission
    Then ticket is valid
