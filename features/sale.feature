Feature: Ticket Sales

  Scenario Outline: Same as fare
    Given ticket sale contract is deployed
    And "host" set ticket sales price to <price> ETH
    When "user" buy a ticket for <price> ETH
    Then "user" owns 1 tickets

    Examples:
    | price |
    | 0.1   |
    | 0.5   |
    | 10.0  |

  Scenario Outline: Multiple tickets
    Given ticket sale contract is deployed
    And "host" set ticket sales price to <price> ETH
    And "host" set ticket limit to 3
    When "user" buy <num> tickets for <total> ETH
    Then "user" owns <num> tickets

    Examples:
      | price | num | total |
      | 0.5   | 1   | 0.5   |
      | 0.5   | 2   | 1.0   |
      | 0.5   | 3   | 1.5   |

  Scenario: User set ticket price
    Given ticket sale contract is deployed
    When "user" set ticket sales price to 0.5 ETH
    Then "user" cannot set ticket price

  Scenario: User set ticket limit
    Given ticket sale contract is deployed
    When "user" set ticket limit to 3
    Then "user" cannot set ticket limit

  Scenario: Multiple tickets but reach limit
    Given ticket sale contract is deployed
    And "host" set ticket sales price to 0.5 ETH
    And "host" set ticket limit to 3
    When "user" buy 4 tickets for 0.5 ETH
    Then "user" owns 0 tickets

  Scenario: Below fare
    Given ticket sale contract is deployed
    And "host" set ticket sales price to 0.1 ETH
    When "user" buy a ticket for 0.05 ETH
    Then "user" owns 0 tickets

  Scenario: Over fare
    Given ticket sale contract is deployed
    And "host" set ticket sales price to 1.5 ETH
    When "user" buy a ticket for 2.0 ETH
    Then "user" owns 1 tickets
    And "user" received a 0.5 ETH refund
