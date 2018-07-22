Feature: Ticket trade

   Scenario: trade ticket
    Given hub contract is deployed
    And "admin" set ticket sales fee to 0.0%
    And "admin" set ticket trade fee to 5.0%
    And "host" create an event with ticket price 0.1 ETH
    And "user" buy a ticket for 0.1 ETH
    When "user" request to trade the ticket for 0.2 ETH
    And "user2" take the ticket for 0.2 ETH
    Then "user" owns 0 tickets
    And "user2" owns 1 tickets
    And balance of hub contract increase 0.01 ETH
