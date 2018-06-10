Feature: Service fee

   Scenario: Set service fee for ticket sales
    Given hub contract is deployed
    When set ticket sales fee to 5.0%
    And a host create an event with ticket price 1.0 ETH
    Then service fee per ticket is 0.05 ETH
