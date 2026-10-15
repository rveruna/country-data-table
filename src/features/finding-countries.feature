# Agreed behaviour, not a test. A failure here means the code is wrong —
# never edit a rule to make a build pass.

@area-search
Feature: Finding countries
  Search, the continent filter and the currency filter narrow the table.
  The examples use a fixed list of 14 countries, shown here by their codes, in the order the API returns them:
  US, CA, MX, GB, FR, DE, ES, AU, NZ, AQ (Antarctica, no currency), ZA, LS (Lesotho, LSL and ZAR), IN, AE.

  Rule: A search matches an exact country code, in any case
    Part of a code matches nothing, and a code that is also part of a name finds both.

    Scenario Outline: Searching for a country code
      Given the list of countries
      When I search for "<search>"
      Then the table shows "<codes>"

      Examples:
        | search | codes  |
        | DE     | DE     |
        | de     | DE     |
        | aq     | AQ     |
        | q      |        |
        | us     | US, AU |
        | fr     | FR, ZA |

  Rule: A search matches any part of a country name, in any case

    Scenario Outline: Searching for part of a name
      Given the list of countries
      When I search for "<search>"
      Then the table shows "<codes>"

      Examples:
        | search   | codes      |
        | Canada   | CA         |
        | ANA      | CA         |
        | zea      | NZ         |
        | arab     | AE         |
        | in       | GB, ES, IN |
        | ca       | CA, AQ, ZA |
        | atlantis |            |

    Scenario: An empty search shows every country
      Given the list of countries
      When I search for ""
      Then the table shows all 14 countries

  Rule: The search waits until typing pauses for 300 ms
    This rule lives in the search box component, so its steps render it with Testing Library.

    Scenario Outline: Typing a search
      Given the search box is on screen
      When I type "ger" and wait <wait> ms
      Then the search applied is "<applied>"

      Examples:
        | wait | applied |
        | 0    |         |
        | 299  |         |
        | 300  | ger     |

    Scenario: Each key press starts the wait again
      Given the search box is on screen
      When I type "ge" and wait 200 ms
      And I type "ger" and wait 200 ms
      Then the search applied is ""
      When I wait 100 ms
      Then the search applied is "ger"

  Rule: The continent filter shows only countries on that continent

    Scenario Outline: Choosing a continent
      Given the list of countries
      When I choose the continent "<continent>"
      Then the table shows "<codes>"

      Examples:
        | continent  | codes          |
        | Europe     | GB, FR, DE, ES |
        | Oceania    | AU, NZ         |
        | Antarctica | AQ             |

  Rule: The currency filter shows countries that use the currency, including those that use several

    Scenario Outline: Choosing a currency
      Given the list of countries
      When I choose the currency "<currency>"
      Then the table shows "<codes>"

      Examples:
        | currency | codes      |
        | EUR      | FR, DE, ES |
        | ZAR      | ZA, LS     |
        | LSL      | LS         |
        | USD      | US         |

  Rule: Search and filters combine, and a country must match all of them

    Scenario Outline: Searching within filters
      Given the list of countries
      When I choose the continent "<continent>"
      And I choose the currency "<currency>"
      And I search for "<search>"
      Then the table shows "<codes>"

      Examples:
        | continent     | currency | search | codes  |
        | Europe        | EUR      | an     | FR, DE |
        | Europe        | EUR      | gb     |        |
        | Africa        | ZAR      | so     | ZA, LS |
        | North America | USD      | united | US     |
