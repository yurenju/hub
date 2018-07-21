Feature: Service fee

   Scenario: Set service fee for ticket sales
    Given hub contract is deployed
    And "admin" set ticket sales fee to 5.0%
    And "host" create an event with ticket price 1.0 ETH
    When "user" buy 1 tickets for 0.05 ETH
    Then service fee per ticket is 0.05 ETH
