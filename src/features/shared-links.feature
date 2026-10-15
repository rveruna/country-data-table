# Agreed behaviour, not a test. A failure here means the code is wrong —
# never edit a rule to make a build pass.

@area-url
Feature: Shared links
  The page, page size, filters and search are kept in the address, so a view can be shared and survives a refresh.
  Defaults (page 1, 10 rows, no filters) are left out of the address.

  Rule: Opening a link restores the view it describes

    Scenario Outline: Opening a link
      When I open the link "<link>"
      Then I see page <page> with <size> rows per page
      And the filters are continent "<continent>", currency "<currency>" and search "<search>"

      Examples:
        | link                                                       | page | size | continent     | currency | search |
        | /                                                          | 1    | 10   |               |          |        |
        | /?page=3                                                   | 3    | 10   |               |          |        |
        | /?page=3&limit=20&continent=Europe&currency=EUR&search=ger | 3    | 20   | Europe        | EUR      | ger    |
        | /?continent=North+America&search=united                    | 1    | 10   | North America |          | united |

  Rule: A page or page size that is not valid falls back to the default

    Scenario Outline: Opening a link with a value that is not valid
      When I open the link "<link>"
      Then I see page <page> with <size> rows per page

      Examples:
        | link             | page | size |
        | /?limit=7        | 1    | 10   |
        | /?limit=abc      | 1    | 10   |
        | /?page=0         | 1    | 10   |
        | /?page=-2        | 1    | 10   |
        | /?page=abc       | 1    | 10   |
        | /?page=2&limit=7 | 2    | 10   |

    # Promised in docs/decisions/0003. Today the address keeps a value that is not valid
    # unless something else in the view changes, as it does in the last row.
    @known-bug
    Scenario Outline: The address drops a value that is not valid
      When I open the link "<link>"
      Then the address is "<address>"

      Examples:
        | link             | address |
        | /?limit=7        |         |
        | /?page=0         |         |
        | /?page=2&limit=7 | ?page=2 |

  Rule: Changing the view updates the address, and a refresh brings the same view back

    Scenario Outline: Refreshing after changing the view
      When I open the link "/"
      And I choose continent "<continent>", currency "<currency>" and search "<search>"
      And I go to page <page> with <size> rows per page
      Then the address is "<address>"
      When I refresh the page
      Then I see page <page> with <size> rows per page
      And the filters are continent "<continent>", currency "<currency>" and search "<search>"

      Examples:
        | continent | currency | search | page | size | address                                                   |
        |           |          |        | 1    | 10   |                                                           |
        |           |          |        | 4    | 10   | ?page=4                                                   |
        |           |          |        | 1    | 50   | ?limit=50                                                 |
        | Europe    | EUR      | ger    | 2    | 20   | ?page=2&limit=20&continent=Europe&currency=EUR&search=ger |
