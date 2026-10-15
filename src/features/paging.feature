# Agreed behaviour, not a test. A failure here means the code is wrong —
# never edit a rule to make a build pass.

@area-paging
Feature: Paging
  The table shows one page of countries at a time, with 10, 20, 50 or 100 rows per page.

  Rule: A page shows the next rows in order, up to the page size

    Scenario Outline: Moving through 95 countries
      Given 95 countries
      When I show <size> rows per page
      And I go to page <page>
      Then the page shows <rows> rows, from country <first> to country <last>
      And there are <pages> pages

      Examples:
        | size | page | rows | first | last | pages |
        | 10   | 1    | 10   | 1     | 10   | 10    |
        | 10   | 2    | 10   | 11    | 20   | 10    |
        | 10   | 10   | 5    | 91    | 95   | 10    |
        | 20   | 5    | 15   | 81    | 95   | 5     |
        | 50   | 2    | 45   | 51    | 95   | 2     |
        | 100  | 1    | 95   | 1     | 95   | 1     |

    Scenario Outline: An exact multiple of the page size leaves no part page
      Given <count> countries
      When I show <size> rows per page
      Then there are <pages> pages

      Examples:
        | count | size | pages |
        | 100   | 10   | 10    |
        | 100   | 100  | 1     |
        | 101   | 100  | 2     |

  Rule: Paging counts only the countries that match the search and filters

    Scenario Outline: Paging a filtered list
      Given 95 countries
      When I show 10 rows per page
      And I search for "<search>"
      Then there are <total> matching countries on <pages> pages

      Examples:
        | search      | total | pages |
        | Country 0   | 95    | 10    |
        | Country 01  | 10    | 1     |
        | Country 001 | 1     | 1     |
        | Atlantis    | 0     | 0     |
