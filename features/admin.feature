Feature: Admin

  Scenario: Set attendees
    Given ticket sale contract is deployed
    And "host" set ticket sales price to 0.1 ETH
    And "user" buy a ticket for 0.1 ETH
    When "host" set the ticket as used
    Then the ticket is marked as used

  Scenario: Set attendees with invalid ticket
    Given ticket sale contract is deployed
    And "host" set ticket sales price to 0.1 ETH
    When "host" set the ticket as used
    Then the ticket is not marked as used
