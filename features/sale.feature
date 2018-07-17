Feature: Ticket Sales

  Scenario Outline: Same as fare
    Given ticket sale contract is deployed
    And set ticket sales price to <price> ETH
    When user buy a ticket for <price> ETH
    Then user can buy a ticket

    Examples:
    | price |
    | 0.1   |
    | 0.5   |
    | 10.0  |

  Scenario Outline: Multiple tickets
    Given ticket sale contract is deployed
    And set ticket sales price to <price> ETH
    And set ticket limit to 3
    When user buy <num> tickets for <total> ETH
    Then user cannot buy a ticket

    Examples:
      | price | num | total |
      | 0.5   | 1   | 0.5   |
      | 0.5   | 2   | 1.0   |
      | 0.5   | 3   | 1.5   |

  Scenario: Multiple tickets but reach limit
    Given ticket sale contract is deployed
    And set ticket sales price to 0.5 ETH
    And set ticket limit to 3
    When user buy 4 tickets for 0.5 ETH
    Then user cannot buy a ticket

  Scenario: Below fare
    Given ticket sale contract is deployed
    And set ticket sales price to 0.1 ETH
    When user buy a ticket for 0.05 ETH
    Then user cannot buy a ticket

  Scenario: Over fare
    Given ticket sale contract is deployed
    And set ticket sales price to 1.5 ETH
    When user buy a ticket for 2.0 ETH
    Then user cannot buy a ticket
    And user received a 0.5 ETH refund
