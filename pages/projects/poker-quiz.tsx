import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { Container, Title, Paper, Text, Button, Stack, Group, Grid, Timeline, ThemeIcon, Card, Transition } from '@mantine/core';
import { IconCards, IconCoin, IconBulb } from '@tabler/icons-react';
import styles from '../../styles/PokerQuiz.module.css';

interface Choice {
  choice_text: string;
  explanation: string;
  is_correct: boolean;
}

interface Position {
  x: number;
  y: number;
  label: string;
  isActive: boolean;
}

interface PositionState {
  position: string;
  lastAction: string;
  isActive: boolean;
  opponent?: {
    vpip?: number;
    pfr?: number;
    style?: string;
  };
}

interface Opponent {
  position: string;
  vpip?: number;
  pfr?: number;
  style?: string;
}

interface ScenarioData {
  scenario_id: number;
  game_type: string;
  tournament_stage: string;
  blinds: string;
  ante: string;
  effective_stacks: number;
  effective_stacks_bb: number;
  your_position: string;
  your_hand: string;
  opponent_information: string;
  opponents?: Opponent[];
  current_state: string;
  community_cards: any;
  choices: Choice[];
  considerations: string[];
}

const scenarios: ScenarioData[] = [
  {
      "scenario_id": 1,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Early",
      "blinds": "50/100",
      "ante": "0.1",
      "effective_stacks": 15000,
      "effective_stacks_bb": 150,
      "your_position": "UTG",
      "your_hand": "AhKs",
      "opponent_information": "Early in the tournament, reads are limited. Opponents are assumed to be a mix of tight and loose players.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (early position requires a tighter range)",
          "Hand strength (suited connectors have good potential)",
          "Tournament stage (early stage allows for more speculative plays)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "While AKs is a strong hand, folding is too tight in this situation.",
              "is_correct": false
          },
          {
              "choice_text": "Limp (call the minimum bet)",
              "explanation": "Limping, especially under the gun is generally not recommended. Limping encourages multiway pots, diminishing the value of strong hands. Limping also disguises the strength of your hand, preventing you from building a pot when you have a strong holding.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 300",
              "explanation": "This is the correct approach. Raising preflop with a strong hand like AKs allows you to build the pot and take control of the hand. It also helps to narrow the field, increasing your chances of winning.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 500",
              "explanation": "While not inherently incorrect, a raise of this size is slightly larger than necessary. In the early stages, a standard raise of 2.5-3 big blinds is generally sufficient.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 2,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "200/400",
      "ante": "0.1",
      "effective_stacks": 20000,
      "effective_stacks_bb": 50,
      "your_position": "BTN",
      "your_hand": "7h6h",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (button is the best position)",
          "Hand strength (suited connectors have good potential)",
          "Opponent tendencies (TAG players are less likely to call light)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "While 76s isn't the strongest hand, the button is the best position at the table. We should look to play a wider range of hands from the button. This hand is too strong to fold in this position.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "We are in position with a hand that can flop big. However, simply calling the blind is not the best option. It allows the big blind to see a cheap flop with a potentially wide range of hands.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 1000",
              "explanation": "This is the correct choice. Raising from the button with a suited connector puts pressure on the blinds. Against a TAG player, this raise is likely to take down the pot preflop or build a pot for when you hit a strong hand.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 1600",
              "explanation": "This raise size is too large in this situation. Standard raises from the button are typically 2-2.5 times the big blind. This raise risks too much of your stack with a speculative hand.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 3,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Late",
      "blinds": "1000/2000",
      "ante": "0.25",
      "effective_stacks": 30000,
      "effective_stacks_bb": 15,
      "your_position": "SB",
      "your_hand": "AsQd",
      "opponent_information": "The player in the BB is a loose-aggressive (LAG) player who has been very active.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Stack size (short-stacked)",
          "Hand strength (strong ace)",
          "Opponent tendencies (LAG players defend blinds wider)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding is too tight with AQ, especially against a LAG player who is likely to defend the big blind with a wide range of hands. With your short stack, you cannot afford to fold strong hands.",
              "is_correct": false
          },
          {
              "choice_text": "Call 1000",
              "explanation": "Calling to see a cheap flop might seem tempting, but with a relatively short stack size of 15 big blinds, it is better to be aggressive. If we are going to see a flop, we should at least put pressure on the big blind.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 6000",
              "explanation": "This raise is a good size to apply pressure. However, against a LAG opponent who defends with a wide range, it is better to simply go all in.",
              "is_correct": false
          },
          {
              "choice_text": "Move all in for 30000",
              "explanation": "This is the correct play. Moving all in with AQ against a LAG player in the BB is a strong move. It puts maximum pressure on your opponent and gives you a good chance to pick up the blinds and antes. With your short stack, this is a good spot to take a stand.",
              "is_correct": true
          }
      ]
  },
  {
      "scenario_id": 4,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "300/600",
      "ante": "0.1",
      "effective_stacks": 36000,
      "effective_stacks_bb": 60,
      "your_position": "CO",
      "your_hand": "AdQh",
      "opponent_information": "The player in the BB is a nit who plays very few hands.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (late position)",
          "Hand strength (strong ace)",
          "Opponent tendencies (nits fold often)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding AQo in late position is far too tight, especially against a nit in the big blind. This is a hand that you should be looking to play.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is not ideal as it doesn't put any pressure on the nit in the big blind. Additionally, calling invites other players into the pot, diminishing the value of your hand.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 1500",
              "explanation": "This is the correct play. Raising to 2.5 big blinds with AQo from the cutoff is a standard and profitable play. Against a nit, it's likely to take down the blinds and antes.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 3000",
              "explanation": "This raise is too large and unnecessary. A standard raise of 2-2.5 big blinds is sufficient to put pressure on the blinds, especially against a tight player.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 5,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Early",
      "blinds": "100/200",
      "ante": "no ante",
      "effective_stacks": 20000,
      "effective_stacks_bb": 100,
      "your_position": "BB",
      "your_hand": "Ts9s",
      "opponent_information": "The player on the BTN is a loose-passive (fish) player who limps frequently.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "8s",
                  "7d",
                  "2c"
              ],
              "actions":
              [
                  {
                      "position": "BTN",
                      "action": "200",
                      "pot_size": 300
                  },
                  {
                      "position": "SB",
                      "action": "Fold",
                      "pot_size": 500
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (open-ended straight draw)",
          "Position (out of position)",
          "Opponent tendencies (fish tend to play passively)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "While you are out of position, folding an open-ended straight draw is too weak, especially against a passive player. You have a good chance to improve to a strong hand.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is an acceptable option, as it allows you to see the turn card relatively cheaply. With an open-ended straight draw, you have good pot odds to continue.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 600",
              "explanation": "While raising could be considered, it's not the best option here. Against a passive player, a raise is unlikely to make them fold. Additionally, raising bloats the pot when you only have a draw.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 1200",
              "explanation": "This raise size is far too large with only a draw. It risks too much of your stack without a made hand, especially against a passive player who might call with a wide range of holdings.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 6,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "400/800",
      "ante": "0.1",
      "effective_stacks": 40000,
      "effective_stacks_bb": 50,
      "your_position": "SB",
      "your_hand": "AcKc",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Ah",
                  "Qd",
                  "5s"
              ],
              "actions":
              [
                  {
                      "position": "UTG",
                      "action": "Fold",
                      "pot_size": 5400
                  },
                  {
                      "position": "UTG1",
                      "action": "Fold",
                      "pot_size": 5400
                  },
                  {
                      "position": "UTG2",
                      "action": "Fold",
                      "pot_size": 5400
                  },
                  {
                      "position": "MP",
                      "action": "Fold",
                      "pot_size": 5400
                  },
                  {
                      "position": "MP1",
                      "action": "Fold",
                      "pot_size": 5400
                  },
                  {
                      "position": "HJ",
                      "action": "Fold",
                      "pot_size": 5400
                  },
                  {
                      "position": "CO",
                      "action": "Fold",
                      "pot_size": 5400
                  },
                  {
                      "position": "BTN",
                      "action": "1600",
                      "pot_size": 5400
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair, top kicker)",
          "Position (out of position)",
          "Opponent tendencies (TAG players bet their strong hands)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding top pair with top kicker is an extremely weak play. You have a very strong hand that is likely ahead of your opponent's range. You should be looking to continue in this hand.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "While calling is an option, it's not the best play. Since you have a strong hand and are out of position, it's better to take a more aggressive line. Calling allows the big blind to control the size of the pot.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 4800",
              "explanation": "This is the correct choice. Raising to three times the initial bet is a standard play with a strong hand like top pair, top kicker. It builds the pot and puts pressure on your opponent.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 8000",
              "explanation": "While raising is correct, this raise size is too large. It risks too much of your stack and may force your opponent to fold hands that you are beating. A standard raise of 3-4 times the initial bet is sufficient.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 7,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Late",
      "blinds": "1000/2000",
      "ante": "0.25",
      "effective_stacks": 50000,
      "effective_stacks_bb": 25,
      "your_position": "BTN",
      "your_hand": "QhJd",
      "opponent_information": "The player in the SB is a tight-passive (nit) player.",
      "current_state": "turn",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Js",
                  "8h",
                  "5d"
              ],
              "actions":
              [
                  {
                      "position": "UTG",
                      "action": "Fold",
                      "pot_size": 7500
                  },
                  {
                      "position": "MP",
                      "action": "Fold",
                      "pot_size": 7500
                  },
                  {
                      "position": "CO",
                      "action": "Fold",
                      "pot_size": 7500
                  },
                  {
                      "position": "BTN",
                      "action": "5000",
                      "pot_size": 7500
                  },
                  {
                      "position": "SB",
                      "action": "Call",
                      "pot_size": 12500
                  },
                  {
                      "position": "BB",
                      "action": "Fold",
                      "pot_size": 17500
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "Js",
                  "8h",
                  "5d",
                  "2c"
              ],
              "actions":
              [
                  {
                      "position": "SB",
                      "action": "Check",
                      "pot_size": 17500
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair)",
          "Position (in position)",
          "Opponent tendencies (nits check their weak hands and some of their strong hands to protect their checking range)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking behind with top pair would be a mistake. Your hand is likely the best hand, and you should be looking to extract value from your opponent. Checking allows them to see a free river card.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 4000",
              "explanation": "This bet size is too small. It doesn't put enough pressure on your opponent and doesn't extract enough value from your strong hand. With a pot size of 17,500, you should be betting larger.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 8750",
              "explanation": "This is the correct choice. Betting around half the pot is a good size in this situation. It puts pressure on your opponent and builds the pot for a potential river bet. Against a nit, this bet is likely to get called by worse hands.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 17500",
              "explanation": "While betting is correct, this bet size is too large. A pot-sized bet is likely to scare away your opponent, especially a nit. A smaller bet is more likely to get called and extract value.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 8,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Final Table",
      "blinds": "5000/10000",
      "ante": "0.1",
      "effective_stacks": 250000,
      "effective_stacks_bb": 25,
      "your_position": "BB",
      "your_hand": "9d9c",
      "opponent_information": "The player on the BTN is a loose-aggressive (LAG) player who has been raising frequently.",
      "current_state": "turn",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "9s",
                  "5h",
                  "2d"
              ],
              "actions":
              [
                  {
                      "position": "UTG",
                      "action": "Fold",
                      "pot_size": 69000
                  },
                  {
                      "position": "UTG1",
                      "action": "Fold",
                      "pot_size": 69000
                  },
                  {
                      "position": "UTG2",
                      "action": "Fold",
                      "pot_size": 69000
                  },
                  {
                      "position": "MP",
                      "action": "Fold",
                      "pot_size": 69000
                  },
                  {
                      "position": "MP1",
                      "action": "Fold",
                      "pot_size": 69000
                  },
                  {
                      "position": "HJ",
                      "action": "Fold",
                      "pot_size": 69000
                  },
                  {
                      "position": "CO",
                      "action": "Fold",
                      "pot_size": 69000
                  },
                  {
                      "position": "BTN",
                      "action": "25000",
                      "pot_size": 69000
                  },
                  {
                      "position": "SB",
                      "action": "Fold",
                      "pot_size": 94000
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 94000
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "9s",
                  "5h",
                  "2d",
                  "Kd"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 119000
                  },
                  {
                      "position": "BTN",
                      "action": "50000",
                      "pot_size": 119000
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top set)",
          "Position (out of position)",
          "Opponent tendencies (LAG players can be bluffing frequently)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding a set on the turn is an extremely weak play. You have a very strong hand that is likely ahead of your opponent's range. You should be looking to get value with your hand.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "While calling is an option, it's not the best play. You have a very strong hand and should be looking to build the pot. Calling allows your opponent to control the size of the pot and potentially see a free river card.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 125000",
              "explanation": "This is the correct choice. Raising to around 2.5 times your opponent's bet is a good size with a set. It puts pressure on your opponent and builds the pot for a potential river shove.",
              "is_correct": true
          },
          {
              "choice_text": "Move all in",
              "explanation": "While moving all in is tempting with a strong hand, it's not the best option here. Your opponent might fold many hands that you are beating. A smaller raise is more likely to get called and extract value.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 9,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "500/1000",
      "ante": "0.1",
      "effective_stacks": 50000,
      "effective_stacks_bb": 50,
      "your_position": "CO",
      "your_hand": "AcQc",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular who defends their blinds well.",
      "current_state": "river",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Ah",
                  "Td",
                  "5s"
              ],
              "actions":
              [
                  {
                      "position": "UTG",
                      "action": "Fold",
                      "pot_size": 3900
                  },
                  {
                      "position": "MP",
                      "action": "Fold",
                      "pot_size": 3900
                  },
                  {
                      "position": "CO",
                      "action": "2500",
                      "pot_size": 3900
                  },
                  {
                      "position": "BTN",
                      "action": "Fold",
                      "pot_size": 6400
                  },
                  {
                      "position": "SB",
                      "action": "Fold",
                      "pot_size": 6400
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 6400
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "Ah",
                  "Td",
                  "5s",
                  "2c"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 8900
                  },
                  {
                      "position": "CO",
                      "action": "4000",
                      "pot_size": 8900
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 12900
                  }
              ]
          },
          "river":
          {
              "cards":
              [
                  "Ah",
                  "Td",
                  "5s",
                  "2c",
                  "Ks"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 20900
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair, top kicker)",
          "Position (in position)",
          "Opponent tendencies (TAGs can have strong hands when they check-call the turn)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking behind with top pair, top kicker would be a mistake. You likely have the best hand and should be looking to extract value from your opponent. Checking allows them to see the showdown for free.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 5000",
              "explanation": "This bet size is too small. It doesn't put enough pressure on your opponent and doesn't extract enough value from your strong hand. With a pot size of 20,900, you should be betting larger.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 10450",
              "explanation": "This is the correct choice. Betting around half the pot is a good size in this situation. It puts pressure on your opponent and builds the pot. Against a TAG player, this bet is likely to get called by worse hands.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 20900",
              "explanation": "While betting is correct, this bet size is too large. A pot-sized bet is likely to scare away your opponent, especially a TAG. A smaller bet is more likely to get called and extract value.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 10,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Late",
      "blinds": "2000/4000",
      "ante": "0.25",
      "effective_stacks": 60000,
      "effective_stacks_bb": 15,
      "your_position": "SB",
      "your_hand": "Ad8d",
      "opponent_information": "The player in the BB is a loose-aggressive (LAG) player who defends their blinds very wide.",
      "current_state": "river",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "As",
                  "Jc",
                  "7s"
              ],
              "actions":
              [
                  {
                      "position": "UTG",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "UTG1",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "UTG2",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "MP",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "MP1",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "HJ",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "CO",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "BTN",
                      "action": "12000",
                      "pot_size": 15000
                  },
                  {
                      "position": "SB",
                      "action": "Call",
                      "pot_size": 27000
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 39000
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "As",
                  "Jc",
                  "7s",
                  "3d"
              ],
              "actions":
              [
                  {
                      "position": "SB",
                      "action": "Check",
                      "pot_size": 39000
                  },
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 39000
                  },
                  {
                      "position": "BTN",
                      "action": "Check",
                      "pot_size": 39000
                  }
              ]
          },
          "river":
          {
              "cards":
              [
                  "As",
                  "Jc",
                  "7s",
                  "3d",
                  "8h"
              ],
              "actions":
              [
                  {
                      "position": "SB",
                      "action": "10000",
                      "pot_size": 39000
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 49000
                  },
                  {
                      "position": "BTN",
                      "action": "Fold",
                      "pot_size": 59000
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (two pair, aces and eights)",
          "Position (out of position)",
          "Opponent tendencies (LAGs can have a wide range of hands when they call a river bet)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding two pair on the river is a very weak play. You have a strong hand that is likely ahead of your opponent's range. You should be looking to extract value with your hand.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is a viable option, but against a LAG player who defends with a wide range, it's possible you're beat by a better two pair, a set, or a straight. Given the opponent's wide range, a small raise may be better.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 24000",
              "explanation": "This is the correct choice. Raising to around 2.4 times your opponent's bet is a good size with two pair. It puts pressure on your opponent and could get called by worse hands, particularly against a LAG player who might call with a single pair or a draw.",
              "is_correct": true
          },
          {
              "choice_text": "Move all in",
              "explanation": "While moving all in is tempting with a strong hand, it's not the best option here. Your opponent might fold many hands that you are beating. A smaller raise is more likely to get called and extract value.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 10,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Late",
      "blinds": "2000/4000",
      "ante": "0.25",
      "effective_stacks": 60000,
      "effective_stacks_bb": 15,
      "your_position": "SB",
      "your_hand": "Ad8d",
      "opponent_information": "The player in the BB is a loose-aggressive (LAG) player who defends their blinds very wide.",
      "current_state": "river",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "As",
                  "Jc",
                  "7s"
              ],
              "actions":
              [
                  {
                      "position": "UTG",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "UTG1",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "UTG2",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "MP",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "MP1",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "HJ",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "CO",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "BTN",
                      "action": "12000",
                      "pot_size": 15000
                  },
                  {
                      "position": "SB",
                      "action": "Call",
                      "pot_size": 27000
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 39000
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "As",
                  "Jc",
                  "7s",
                  "3d"
              ],
              "actions":
              [
                  {
                      "position": "SB",
                      "action": "Check",
                      "pot_size": 39000
                  },
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 39000
                  },
                  {
                      "position": "BTN",
                      "action": "Check",
                      "pot_size": 39000
                  }
              ]
          },
          "river":
          {
              "cards":
              [
                  "As",
                  "Jc",
                  "7s",
                  "3d",
                  "8h"
              ],
              "actions":
              [
                  {
                      "position": "SB",
                      "action": "10000",
                      "pot_size": 39000
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 49000
                  },
                  {
                      "position": "BTN",
                      "action": "Fold",
                      "pot_size": 59000
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (two pair, aces and eights)",
          "Position (out of position)",
          "Opponent tendencies (LAGs can have a wide range of hands when they call a river bet)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding two pair on the river is a very weak play. You have a strong hand that is likely ahead of your opponent's range. You should be looking to extract value with your hand.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is a viable option, but against a LAG player who defends with a wide range, it's possible you're beat by a better two pair, a set, or a straight. Given the opponent's wide range, a small raise may be better.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 24000",
              "explanation": "This is the correct choice. Raising to around 2.4 times your opponent's bet is a good size with two pair. It puts pressure on your opponent and could get called by worse hands, particularly against a LAG player who might call with a single pair or a draw.",
              "is_correct": true
          },
          {
              "choice_text": "Move all in",
              "explanation": "While moving all in is tempting with a strong hand, it's not the best option here. Your opponent might fold many hands that you are beating. A smaller raise is more likely to get called and extract value.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 11,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Early",
      "blinds": "100/200",
      "ante": "no ante",
      "effective_stacks": 20000,
      "effective_stacks_bb": 100,
      "your_position": "BB",
      "your_hand": "8c7c",
      "opponent_information": "The player on the BTN is a loose-passive (fish) player who limps frequently.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "6c",
                  "5d",
                  "2h"
              ],
              "actions":
              [
                  {
                      "position": "BTN",
                      "action": "200",
                      "pot_size": 300
                  },
                  {
                      "position": "SB",
                      "action": "Fold",
                      "pot_size": 500
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (open-ended straight draw)",
          "Position (out of position)",
          "Opponent tendencies (fish tend to play passively, unlikely to fold to aggression)",
          "Board texture (connects well with your hand)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "You have an open-ended straight draw on a board that connects well with your hand. Folding is too weak, especially against a passive player who might be betting with a wide range of hands, including those you can beat or improve against.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is a reasonable option, allowing you to see the turn cheaply and potentially improve to a straight. However, given the opponent's passive tendencies, a more aggressive approach might be better.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 600",
              "explanation": "Raising is a strong option here. You have a strong draw and can represent a made hand like a set or two pair. Given the opponent's passive nature, they are likely to call with many weaker hands, allowing you to build a bigger pot for when you hit your straight. A raise of about 3 times the initial bet is appropriate.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 1200",
              "explanation": "While raising is a good option, a raise of this size is too large. It risks too much of your stack with a draw, especially against a passive player who might be more inclined to call a smaller raise. A more standard raise size will achieve the same goal of building the pot and applying pressure.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 12,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "300/600",
      "ante": "0.1",
      "effective_stacks": 30000,
      "effective_stacks_bb": 50,
      "your_position": "SB",
      "your_hand": "AcQc",
      "opponent_information": "The player on the BTN is a tight-aggressive (TAG) regular.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Ad",
                  "Td",
                  "5h"
              ],
              "actions":
              [
                  {
                      "position": "BTN",
                      "action": "1200",
                      "pot_size": 5400
                  },
                  {
                      "position": "SB",
                      "action": "Check",
                      "pot_size": 5400
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair, top kicker)",
          "Position (out of position)",
          "Opponent tendencies (TAG players are likely to have a strong range when they bet)",
          "Board texture (relatively dry, but potential straight draws exist)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding top pair with top kicker is too weak, especially on a relatively dry board. While the opponent is a TAG, they can still be betting with worse hands for value or as a bluff. You are ahead of a significant portion of their betting range.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is a viable option. You have a strong hand and can control the size of the pot. However, given that you are out of position and the opponent is a TAG, raising might be a better option to gain information and potentially take down the pot immediately.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 3000",
              "explanation": "Raising is a good option here. It allows you to take control of the hand, gain information about the opponent's hand strength, and potentially win the pot immediately. A raise of 2.5 times the initial bet is appropriate.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 6000",
              "explanation": "Raising is a good option, but a raise of this size is too large. It risks too much of your stack and might force the opponent to fold hands you are currently beating. A smaller raise will achieve the same goals more effectively.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 13,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "500/1000",
      "ante": "0.1",
      "effective_stacks": 40000,
      "effective_stacks_bb": 40,
      "your_position": "CO",
      "your_hand": "9s8s",
      "opponent_information": "The player in the BB is a loose-passive (fish) player.",
      "current_state": "turn",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "7s",
                  "6d",
                  "3c"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 3900
                  },
                  {
                      "position": "CO",
                      "action": "2500",
                      "pot_size": 3900
                  },
                  {
                      "position": "BTN",
                      "action": "Fold",
                      "pot_size": 6400
                  },
                  {
                      "position": "SB",
                      "action": "Fold",
                      "pot_size": 6400
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 6400
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "7s",
                  "6d",
                  "3c",
                  "5h"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 8900
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (nut straight)",
          "Position (in position)",
          "Opponent tendencies (fish tend to be passive and call with a wide range)",
          "Board texture (turn completes a straight and brings a backdoor flush draw)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking with the nut straight would be a significant mistake. You have the best possible hand and should be looking to extract maximum value, especially against a loose-passive player who is likely to call with a wide range of hands.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 4450",
              "explanation": "Betting is the correct approach, but a bet of this size is too small. Given the opponent's passive tendencies and the fact that you have the nuts, you should be betting larger to extract more value.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 8900",
              "explanation": "This is the correct choice. Betting the size of the pot with the nut straight is a good approach against a loose-passive player. They are likely to call with many worse hands, allowing you to extract maximum value.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 17800",
              "explanation": "While betting is correct, an overbet of this size is too large. It might scare away your opponent and cause them to fold hands that would have otherwise called a smaller bet. A pot-sized bet is sufficient to extract value in this situation.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 14,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Late",
      "blinds": "1000/2000",
      "ante": "0.25",
      "effective_stacks": 50000,
      "effective_stacks_bb": 25,
      "your_position": "BTN",
      "your_hand": "KhQh",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular.",
      "current_state": "turn",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Kc",
                  "Tc",
                  "5s"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 7500
                  },
                  {
                      "position": "BTN",
                      "action": "3750",
                      "pot_size": 7500
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 11250
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "Kc",
                  "Tc",
                  "5s",
                  "2d"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 18750
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair, good kicker)",
          "Position (in position)",
          "Opponent tendencies (TAG players are capable of check-calling with a wide range on the flop)",
          "Board texture (turn is a blank, unlikely to have changed hand strengths significantly)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking would be too passive with a strong hand like top pair, good kicker. You are likely ahead and should be looking to extract value from worse hands. Checking also allows your opponent to see a free river card, potentially improving their hand.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 4687",
              "explanation": "This bet size is too small. While it's important to bet for value, a bet of this size doesn't put enough pressure on your opponent and doesn't extract enough value from your strong hand. A larger bet is more appropriate.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 9375",
              "explanation": "This is the correct choice. Betting around half the pot is a good size in this situation. It puts pressure on your opponent and builds the pot for a potential river bet. Against a TAG player, this bet is likely to get called by worse hands like weaker Kings, top pair worse kicker, or draws.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 18750",
              "explanation": "While betting is correct, a pot-sized bet is too large in this situation. It's likely to scare away your opponent, especially a TAG, and may only get called by hands that beat you. A smaller bet is more likely to get called and extract value.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 15,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Final Table",
      "blinds": "2000/4000",
      "ante": "0.25",
      "effective_stacks": 100000,
      "effective_stacks_bb": 25,
      "your_position": "BB",
      "your_hand": "8d8c",
      "opponent_information": "The player on the BTN is a loose-aggressive (LAG) player who has been very active.",
      "current_state": "river",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "8h",
                  "6c",
                  "3s"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 15000
                  },
                  {
                      "position": "BTN",
                      "action": "7500",
                      "pot_size": 15000
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 22500
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "8h",
                  "6c",
                  "3s",
                  "2d"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 37500
                  },
                  {
                      "position": "BTN",
                      "action": "15000",
                      "pot_size": 37500
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 52500
                  }
              ]
          },
          "river":
          {
              "cards":
              [
                  "8h",
                  "6c",
                  "3s",
                  "2d",
                  "Kd"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 82500
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top set)",
          "Position (out of position)",
          "Opponent tendencies (LAG players are capable of betting with a wide range, including bluffs)",
          "Board texture (river is a blank, unlikely to have changed hand strengths significantly)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking would be a mistake. You have a very strong hand (top set) and should be looking to extract value, especially against a LAG opponent who is capable of betting with a wide range, including worse hands that might call a bet.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 20625",
              "explanation": "While betting is correct, this bet size is too small. With top set, you should be aiming to get your entire stack in by the river. A small bet like this doesn't build the pot effectively and might allow your opponent to see a cheap showdown.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 41250",
              "explanation": "Betting is correct, and this bet size is better than 20,625, but still not optimal. You should be aiming to get your entire stack in by the river with your very strong hand. A half-pot bet might not be enough to accomplish that.",
              "is_correct": false
          },
          {
              "choice_text": "Bet all-in for 82500",
              "explanation": "This is the correct choice. Moving all-in with top set is the best way to extract maximum value, especially against a LAG opponent. While it might scare them away sometimes, it's the most profitable play in the long run.",
              "is_correct": true
          }
      ]
  },
  {
      "scenario_id": 16,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Early",
      "blinds": "50/100",
      "ante": "no ante",
      "effective_stacks": 15000,
      "effective_stacks_bb": 150,
      "your_position": "UTG",
      "your_hand": "AcKc",
      "opponent_information": "Early in the tournament, reads are limited. Opponents are assumed to be a mix of tight and loose players.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (early position requires a tighter range)",
          "Hand strength (AKo is a premium hand)",
          "Tournament stage (early stage, stacks are deep)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding AKo, even from early position, is too tight. This is a premium hand that should be played aggressively.",
              "is_correct": false
          },
          {
              "choice_text": "Limp (call the minimum bet)",
              "explanation": "Limping is generally not recommended with strong hands, especially from early position. It fails to build the pot and allows too many opponents to see a cheap flop, diminishing the value of your hand.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 300",
              "explanation": "This is the correct approach. Raising to 3 big blinds is a standard opening size from early position. It allows you to build the pot with a premium hand and narrow the field, increasing your chances of winning.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 500",
              "explanation": "While raising is correct, a raise of this size is too large from early position, especially in the early stages of a tournament. It risks too much of your stack unnecessarily and may scare away opponents.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 17,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "400/800",
      "ante": "0.1",
      "effective_stacks": 32000,
      "effective_stacks_bb": 40,
      "your_position": "BTN",
      "your_hand": "QsJs",
      "opponent_information": "The player in the BB is a tight-passive (nit) player.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (button is the best position)",
          "Hand strength (QJs is a strong hand, especially in late position)",
          "Opponent tendencies (nits tend to fold a lot preflop)",
          "Stack sizes (40 big blinds allows for a wide range of plays)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding QJs on the button is far too tight, especially against a nit in the big blind. This is a strong hand that plays well in position and should be played.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "While calling is an option, it doesn't put any pressure on the nit in the big blind and allows them to see a cheap flop. Raising is a more aggressive and profitable approach.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 2000",
              "explanation": "This is the correct choice. Raising to 2.5 big blinds with QJs from the button is a standard and profitable play. Against a nit, it's likely to take down the blinds and antes preflop, or build a pot for when you make a strong hand postflop.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 3200",
              "explanation": "While raising is correct, a raise of this size is too large. A standard raise of 2-2.5 big blinds is sufficient to put pressure on the blinds, especially against a tight player.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 18,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Late",
      "blinds": "1000/2000",
      "ante": "0.25",
      "effective_stacks": 40000,
      "effective_stacks_bb": 20,
      "your_position": "SB",
      "your_hand": "KdQd",
      "opponent_information": "The player in the BB is a loose-aggressive (LAG) player.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (small blind is a difficult position to play from)",
          "Hand strength (KQo is a strong hand, but can be dominated)",
          "Opponent tendencies (LAG players defend their blinds with a wide range)",
          "Stack sizes (20 big blinds is a critical stack depth)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding KQo from the small blind, even against a LAG, is too tight. While it's not the strongest hand, it still has good equity against a wide range and can make strong hands postflop.",
              "is_correct": false
          },
          {
              "choice_text": "Call 1000",
              "explanation": "Calling is an option, but it doesn't put any pressure on the big blind and allows them to realize their equity cheaply. With a relatively short stack, it's generally better to take a more aggressive approach.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 6000",
              "explanation": "Raising is a reasonable option, but with 20 big blinds, a 3-bet shove is generally preferred with a hand like KQo. It maximizes fold equity and avoids playing a marginal hand out of position postflop.",
              "is_correct": false
          },
          {
              "choice_text": "Move all in for 40000",
              "explanation": "This is the correct choice. Moving all in with KQo from the small blind against a LAG player in the big blind is a good play. It puts maximum pressure on your opponent and allows you to pick up the blinds and antes, which is significant at this stage of the tournament. While you might be behind sometimes, the fold equity makes this play profitable.",
              "is_correct": true
          }
      ]
  },
  {
      "scenario_id": 19,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Final Table",
      "blinds": "5000/10000",
      "ante": "0.1",
      "effective_stacks": 200000,
      "effective_stacks_bb": 20,
      "your_position": "UTG",
      "your_hand": "AsQh",
      "opponent_information": "Final table dynamics apply, with varying stack sizes and pay jumps. Opponents are a mix of tight and aggressive players.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (early position requires a tighter range)",
          "Hand strength (AQo is a strong hand, but can be dominated)",
          "Tournament stage (final table, ICM considerations are significant)",
          "Stack sizes (20 big blinds is a critical stack depth)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding AQo from early position, even at a final table with 20 big blinds, is too tight. While ICM considerations are important, this hand still has good equity against a typical opening range.",
              "is_correct": false
          },
          {
              "choice_text": "Limp (call the minimum bet)",
              "explanation": "Limping is not a good option with AQo. It fails to build the pot with a strong hand and doesn't put any pressure on your opponents. Raising is a more standard and profitable approach.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 25000",
              "explanation": "Raising is a viable option, but with 20 big blinds, a shove is generally preferred with AQo from early position. It maximizes fold equity and avoids playing a marginal hand out of position postflop.",
              "is_correct": false
          },
          {
              "choice_text": "Move all in for 200000",
              "explanation": "This is the correct choice. Moving all in with AQo from early position at a final table with 20 big blinds is a standard play. It puts maximum pressure on your opponents and allows you to pick up the blinds and antes, which is significant at this stage. While you might be behind sometimes, the fold equity makes this play profitable, especially considering ICM pressure on opponents.",
              "is_correct": true
          }
      ]
  },
  {
      "scenario_id": 20,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Early",
      "blinds": "100/200",
      "ante": "no ante",
      "effective_stacks": 30000,
      "effective_stacks_bb": 150,
      "your_position": "BB",
      "your_hand": "7d6d",
      "opponent_information": "The player in MP is a standard, regular player.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "8c",
                  "5c",
                  "2s"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 700
                  },
                  {
                      "position": "MP",
                      "action": "400",
                      "pot_size": 700
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (open-ended straight draw)",
          "Position (out of position)",
          "Opponent tendencies (standard players are capable of betting with a wide range on this board)",
          "Board texture (connected board, potential for straights and flushes)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding with an open-ended straight draw is too weak, especially on a board that connects well with your hand. You have a good chance to improve to a strong hand on the turn or river.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is a reasonable option. It allows you to see the turn card relatively cheaply and potentially improve to a straight. However, given that you are out of position and have a strong draw, raising might be a better option to build the pot and potentially take it down immediately.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 1200",
              "explanation": "Raising is a strong option here. You have a strong draw and can represent a made hand like a set or two pair. Raising allows you to build a bigger pot for when you hit your straight and potentially take down the pot immediately if your opponent folds. A raise of about 3 times the initial bet is appropriate.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 2400",
              "explanation": "While raising is a good option, a raise of this size is too large. It risks too much of your stack with a draw and might force your opponent to fold hands you are currently beating or that you can improve against on later streets.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 21,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "500/1000",
      "ante": "0.1",
      "effective_stacks": 40000,
      "effective_stacks_bb": 40,
      "your_position": "SB",
      "your_hand": "AcKd",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Ah",
                  "Td",
                  "5c"
              ],
              "actions":
              [
                  {
                      "position": "SB",
                      "action": "Check",
                      "pot_size": 3900
                  },
                  {
                      "position": "BB",
                      "action": "2000",
                      "pot_size": 3900
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair, top kicker)",
          "Position (out of position)",
          "Opponent tendencies (TAG players are capable of betting with a wide range on this board, including draws and weaker made hands)",
          "Board texture (relatively dry, but potential straight draws exist)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding top pair with top kicker is too weak, especially on a relatively dry board. You are ahead of a significant portion of your opponent's betting range, including draws and weaker made hands.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is a reasonable option, allowing you to control the pot size and see the turn card. However, given that you are out of position and have a very strong hand, raising might be a better option to build the pot and potentially take it down immediately.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 6000",
              "explanation": "This is the correct choice. Raising with top pair, top kicker is a strong play. It allows you to extract value from worse hands, gain information about your opponent's holding, and potentially win the pot immediately. A raise of about 3 times the initial bet is appropriate.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 12000",
              "explanation": "While raising is a good option, a raise of this size is too large. It risks too much of your stack and might force your opponent to fold hands you are currently beating.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 22,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Late",
      "blinds": "1000/2000",
      "ante": "0.25",
      "effective_stacks": 60000,
      "effective_stacks_bb": 30,
      "your_position": "CO",
      "your_hand": "QhQs",
      "opponent_information": "The player in the BB is a loose-passive (fish) player.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Js",
                  "9h",
                  "2d"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 7500
                  },
                  {
                      "position": "CO",
                      "action": "4000",
                      "pot_size": 7500
                  },
                  {
                      "position": "BTN",
                      "action": "Fold",
                      "pot_size": 11500
                  },
                  {
                      "position": "SB",
                      "action": "Fold",
                      "pot_size": 11500
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 11500
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "Js",
                  "9h",
                  "2d",
                  "Th"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 19500
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (overpair)",
          "Position (in position)",
          "Opponent tendencies (fish tend to be passive and call with a wide range)",
          "Board texture (turn completes a possible straight and brings a flush draw)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking would be too passive with an overpair on the turn. While the board is now more coordinated, you still have a strong hand and should be looking to extract value. Checking also allows your opponent to see a free river card, potentially improving their hand.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 9750",
              "explanation": "This is the correct choice. Betting around half the pot is a good size in this situation. It puts pressure on your opponent and builds the pot for a potential river bet. Against a loose-passive player, this bet is likely to get called by worse hands like pairs, straight draws, or flush draws.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 19500",
              "explanation": "While betting is correct, a pot-sized bet is too large in this situation. It's likely to scare away your opponent, especially a fish, and may only get called by hands that beat you. A smaller bet is more likely to get called and extract value.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 39000",
              "explanation": "While betting is correct, an overbet of this size is far too large. It risks too much of your stack and is unlikely to be called by anything other than a very strong hand that has you beat. A smaller bet is much more appropriate.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 23,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Final Table",
      "blinds": "2000/4000",
      "ante": "0.25",
      "effective_stacks": 80000,
      "effective_stacks_bb": 20,
      "your_position": "BB",
      "your_hand": "As3s",
      "opponent_information": "The player on the BTN is a tight-aggressive (TAG) regular.",
      "current_state": "river",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Ac",
                  "Td",
                  "5h"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 15000
                  },
                  {
                      "position": "BTN",
                      "action": "7500",
                      "pot_size": 15000
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 22500
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "Ac",
                  "Td",
                  "5h",
                  "2c"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 37500
                  },
                  {
                      "position": "BTN",
                      "action": "15000",
                      "pot_size": 37500
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 52500
                  }
              ]
          },
          "river":
          {
              "cards":
              [
                  "Ac",
                  "Td",
                  "5h",
                  "2c",
                  "4h"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 82500
                  },
                  {
                      "position": "BTN",
                      "action": "41250",
                      "pot_size": 82500
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (nut straight)",
          "Position (out of position)",
          "Opponent tendencies (TAG players are capable of betting for value and as a bluff on the river)",
          "Board texture (river completes a straight and brings a backdoor flush possibility)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding with the nut straight would be a catastrophic mistake. You have the best possible hand and should be looking to extract maximum value.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is an option, but it's not the best play. With the nut straight, you should be looking to get all the money in, especially at this stack depth.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 123750",
              "explanation": "Raising is a good option, but a raise of this size might not be enough to get all-in. With 20 big blinds effective, a shove is generally preferred with the nuts.",
              "is_correct": false
          },
          {
              "choice_text": "Move all in for 158750",
              "explanation": "This is the correct choice. Moving all in with the nut straight is the best way to extract maximum value. While your opponent might fold sometimes, the times they call with a worse hand will more than make up for it.",
              "is_correct": true
          }
      ]
  },
  {
      "scenario_id": 24,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Early",
      "blinds": "50/100",
      "ante": "no ante",
      "effective_stacks": 15000,
      "effective_stacks_bb": 150,
      "your_position": "MP",
      "your_hand": "Ts9s",
      "opponent_information": "Early in the tournament, reads are limited. Opponents are assumed to be a mix of tight and loose players.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (middle position, several players left to act)",
          "Hand strength (T9s is a speculative hand that can flop well)",
          "Tournament stage (early stage, stacks are deep)",
          "Stack sizes (150 big blinds allows for a wide range of plays)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding T9s from middle position is too tight, especially in the early stages of a tournament with deep stacks. This hand has good potential to make straights and flushes and can be played profitably.",
              "is_correct": false
          },
          {
              "choice_text": "Limp (call the minimum bet)",
              "explanation": "While limping can be an option with speculative hands from middle position, it's generally not the best approach. Limping doesn't build the pot and can lead to difficult situations postflop. Raising is often preferred.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 300",
              "explanation": "This is the correct choice. Raising to 3 big blinds with T9s from middle position is a standard and profitable play. It allows you to build the pot with a hand that can flop well and puts pressure on opponents in later positions.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 400",
              "explanation": "While raising is correct, a raise of this size is slightly larger than necessary from middle position. A standard raise of 2.5-3 big blinds is generally sufficient.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 25,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "400/800",
      "ante": "0.1",
      "effective_stacks": 32000,
      "effective_stacks_bb": 40,
      "your_position": "HJ",
      "your_hand": "AdQd",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (hijack is a late position)",
          "Hand strength (AQo is a strong hand, especially in late position)",
          "Opponent tendencies (TAG players tend to defend their blinds with a reasonable range)",
          "Stack sizes (40 big blinds allows for a wide range of plays)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding AQo from the hijack is too tight, especially against a TAG player in the big blind. This is a strong hand that should be played aggressively.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is not an option preflop unless you are in the small blind facing only a limp.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 2000",
              "explanation": "This is the correct choice. Raising to 2.5 big blinds with AQo from the hijack is a standard and profitable play. It allows you to build the pot with a strong hand and puts pressure on the blinds.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 3200",
              "explanation": "While raising is correct, a raise of this size is too large. A standard raise of 2-2.5 big blinds is sufficient to put pressure on the blinds.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 26,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Late",
      "blinds": "1000/2000",
      "ante": "0.25",
      "effective_stacks": 50000,
      "effective_stacks_bb": 25,
      "your_position": "CO",
      "your_hand": "KsQs",
      "opponent_information": "The player in the BB is a loose-aggressive (LAG) player.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (cutoff is a late position)",
          "Hand strength (KQs is a strong hand, especially in late position)",
          "Opponent tendencies (LAG players defend their blinds with a wide range)",
          "Stack sizes (25 big blinds is a critical stack depth)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding KQs from the cutoff is too tight, especially against a LAG player in the big blind. This is a strong hand that should be played.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is not an option preflop unless you are in the small blind facing only a limp.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 5000",
              "explanation": "Raising to 2.5 big blinds with KQs from the cutoff is a standard play. It allows you to build the pot with a strong hand and puts pressure on the blinds. However, given the stack sizes and the opponent's tendencies, a 3-bet shove might be even more profitable.",
              "is_correct": true
          },
          {
              "choice_text": "Move all in for 50000",
              "explanation": "Moving all in with KQs from the cutoff against a LAG player in the big blind with 25 big blinds effective can be a profitable play. It puts maximum pressure on your opponent and allows you to pick up the blinds and antes. However, it's important to consider your image and the potential for getting called by hands that dominate you.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 27,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Final Table",
      "blinds": "5000/10000",
      "ante": "0.1",
      "effective_stacks": 250000,
      "effective_stacks_bb": 25,
      "your_position": "SB",
      "your_hand": "AhQs",
      "opponent_information": "The player in the BB is a tight-passive (nit) player.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (small blind is a difficult position to play from)",
          "Hand strength (AQo is a strong hand)",
          "Opponent tendencies (nits tend to play very tight and fold a lot preflop)",
          "Stack sizes (25 big blinds is a critical stack depth)",
          "Tournament stage (final table, ICM considerations are significant)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding AQo from the small blind, even against a nit, is too tight. This is a strong hand that can be played profitably, especially at a final table where stealing blinds is important.",
              "is_correct": false
          },
          {
              "choice_text": "Call 5000",
              "explanation": "While calling is an option, it doesn't put any pressure on the nit in the big blind and allows them to realize their equity cheaply. With a relatively short stack, it's generally better to take a more aggressive approach.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 30000",
              "explanation": "Raising is a reasonable option, but with 25 big blinds, a 3-bet shove is generally preferred with a strong hand like AQo. It maximizes fold equity and avoids playing a marginal hand out of position postflop.",
              "is_correct": false
          },
          {
              "choice_text": "Move all in for 250000",
              "explanation": "This is the correct choice. Moving all in with AQo from the small blind against a nit player in the big blind is a good play. It puts maximum pressure on your opponent and allows you to pick up the blinds and antes, which is significant at a final table. Given the opponent's tight tendencies, they are likely to fold a lot of hands, making this play profitable.",
              "is_correct": true
          }
      ]
  },
  {
      "scenario_id": 28,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Early",
      "blinds": "100/200",
      "ante": "no ante",
      "effective_stacks": 20000,
      "effective_stacks_bb": 100,
      "your_position": "BB",
      "your_hand": "9c8c",
      "opponent_information": "The player on the BTN is a loose-aggressive (LAG) player.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "7c",
                  "6d",
                  "3h"
              ],
              "actions":
              [
                  {
                      "position": "BTN",
                      "action": "400",
                      "pot_size": 600
                  },
                  {
                      "position": "SB",
                      "action": "Fold",
                      "pot_size": 1000
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 1000
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (open-ended straight draw)",
          "Position (out of position)",
          "Opponent tendencies (LAG players are capable of betting with a wide range, including bluffs)",
          "Board texture (connected board, potential for straights and flushes)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding with an open-ended straight draw is too weak, especially on a board that connects well with your hand. You have a good chance to improve to a strong hand on the turn or river.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is a reasonable option. It allows you to see the turn card relatively cheaply and potentially improve to a straight. However, given that you are out of position and have a strong draw, raising might be a better option to build the pot and potentially take it down immediately.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 1200",
              "explanation": "Raising is a strong option here. You have a strong draw and can represent a made hand like a set or two pair. Raising allows you to build a bigger pot for when you hit your straight and potentially take down the pot immediately if your opponent folds. A raise of about 3 times the initial bet is appropriate.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 2400",
              "explanation": "While raising is a good option, a raise of this size is too large. It risks too much of your stack with a draw and might force your opponent to fold hands you are currently beating or that you can improve against on later streets.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 29,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "300/600",
      "ante": "0.1",
      "effective_stacks": 30000,
      "effective_stacks_bb": 50,
      "your_position": "SB",
      "your_hand": "AsKd",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Ac",
                  "Td",
                  "5s"
              ],
              "actions":
              [
                  {
                      "position": "SB",
                      "action": "Check",
                      "pot_size": 2700
                  },
                  {
                      "position": "BB",
                      "action": "1800",
                      "pot_size": 2700
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair, top kicker)",
          "Position (out of position)",
          "Opponent tendencies (TAG players are likely to have a strong range when they bet)",
          "Board texture (relatively dry, but potential straight draws exist)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding top pair with top kicker is too weak, especially on a relatively dry board. While the opponent is a TAG, they can still be betting with worse hands for value or as a bluff. You are ahead of a significant portion of their betting range.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is a viable option. You have a strong hand and can control the size of the pot. However, given that you are out of position and the opponent is a TAG, raising might be a better option to gain information and potentially take down the pot immediately.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 5400",
              "explanation": "This is the correct choice. Raising to three times the initial bet is a standard play with a strong hand like top pair, top kicker. It builds the pot and puts pressure on your opponent.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 9000",
              "explanation": "While raising is correct, this raise size is too large. It risks too much of your stack and may force your opponent to fold hands that you are beating. A standard raise of 3-4 times the initial bet is sufficient.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 30,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Late",
      "blinds": "1000/2000",
      "ante": "0.25",
      "effective_stacks": 40000,
      "effective_stacks_bb": 20,
      "your_position": "BTN",
      "your_hand": "9h8h",
      "opponent_information": "The player in the SB is a tight-passive (nit) player.",
      "current_state": "turn",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Ts",
                  "7d",
                  "2c"
              ],
              "actions":
              [
                  {
                      "position": "SB",
                      "action": "Check",
                      "pot_size": 7500
                  },
                  {
                      "position": "BB",
                      "action": "Fold",
                      "pot_size": 7500
                  },
                  {
                      "position": "BTN",
                      "action": "4000",
                      "pot_size": 7500
                  },
                  {
                      "position": "SB",
                      "action": "Call",
                      "pot_size": 11500
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "Ts",
                  "7d",
                  "2c",
                  "6s"
              ],
              "actions":
              [
                  {
                      "position": "SB",
                      "action": "Check",
                      "pot_size": 19500
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (open-ended straight draw and backdoor flush draw)",
          "Position (in position)",
          "Opponent tendencies (nits check their weak hands and some of their strong hands to protect their checking range)",
          "Board texture (turn completes a straight and brings a backdoor flush draw)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking behind with an open-ended straight draw and a backdoor flush draw would be too passive. You have a strong draw and should be looking to build the pot, especially against a nit who is likely to fold to aggression.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 5000",
              "explanation": "While betting is correct, this bet size is too small. It doesn't put enough pressure on your opponent and doesn't build the pot effectively. With a strong draw, you should be betting larger.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 9750",
              "explanation": "This is the correct choice. Betting around half the pot is a good size in this situation. It puts pressure on your opponent and builds the pot for a potential river bet. Against a nit, this bet is likely to either take down the pot immediately or get called by a hand you can improve against.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 19500",
              "explanation": "While betting is correct, a pot-sized bet is too large in this situation. It's likely to scare away your opponent, especially a nit, and may only get called by hands that beat you. A smaller bet is more likely to get called and build the pot.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 31,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Final Table",
      "blinds": "5000/10000",
      "ante": "0.1",
      "effective_stacks": 150000,
      "effective_stacks_bb": 15,
      "your_position": "BB",
      "your_hand": "7d7s",
      "opponent_information": "The player on the BTN is a loose-aggressive (LAG) player.",
      "current_state": "turn",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "7h",
                  "5c",
                  "2d"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 39000
                  },
                  {
                      "position": "BTN",
                      "action": "20000",
                      "pot_size": 39000
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 59000
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "7h",
                  "5c",
                  "2d",
                  "Ks"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 99000
                  },
                  {
                      "position": "BTN",
                      "action": "50000",
                      "pot_size": 99000
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top set)",
          "Position (out of position)",
          "Opponent tendencies (LAG players can be bluffing frequently on the turn)",
          "Board texture (turn is a blank, unlikely to have changed hand strengths significantly)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding a set on the turn is an extremely weak play. You have a very strong hand that is likely ahead of your opponent's range. You should be looking to get value with your hand.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is an option, but it's not the best play. You have a very strong hand and should be looking to build the pot. Calling allows your opponent to control the size of the pot and potentially see a free river card.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 130000",
              "explanation": "This is the correct choice. Since you have such a strong hand and are facing a bet on the turn, you should go all-in. This is because you have a short stack and there is no better time to try and get all the chips in the middle.",
              "is_correct": true
          },
          {
              "choice_text": "Move all in",
              "explanation": "Moving all-in is the correct play here because your stack is so short relative to the pot.",
              "is_correct": true
          }
      ]
  },
  {
      "scenario_id": 32,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "500/1000",
      "ante": "0.1",
      "effective_stacks": 50000,
      "effective_stacks_bb": 50,
      "your_position": "CO",
      "your_hand": "AhQh",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular.",
      "current_state": "river",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Ac",
                  "Td",
                  "5s"
              ],
              "actions":
              [
                  {
                      "position": "CO",
                      "action": "2500",
                      "pot_size": 3900
                  },
                  {
                      "position": "BTN",
                      "action": "Fold",
                      "pot_size": 6400
                  },
                  {
                      "position": "SB",
                      "action": "Fold",
                      "pot_size": 6400
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 6400
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "Ah",
                  "Td",
                  "5s",
                  "2c"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 8900
                  },
                  {
                      "position": "CO",
                      "action": "4000",
                      "pot_size": 8900
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 12900
                  }
              ]
          },
          "river":
          {
              "cards":
              [
                  "Ah",
                  "Td",
                  "5s",
                  "2c",
                  "Kh"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 20900
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair, top kicker)",
          "Position (in position)",
          "Opponent tendencies (TAGs can have strong hands when they check-call the turn)",
          "Board texture (river completes a possible straight)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking behind with top pair, top kicker would be a mistake. You likely have the best hand and should be looking to extract value from your opponent. Checking allows them to see the showdown for free.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 5000",
              "explanation": "This bet size is too small. It doesn't put enough pressure on your opponent and doesn't extract enough value from your strong hand. With a pot size of 20,900, you should be betting larger.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 10450",
              "explanation": "This is the correct choice. Betting around half the pot is a good size in this situation. It puts pressure on your opponent and builds the pot. Against a TAG player, this bet is likely to get called by worse hands.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 20900",
              "explanation": "While betting is correct, this bet size is too large. A pot-sized bet is likely to scare away your opponent, especially a TAG. A smaller bet is more likely to get called and extract value.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 33,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "500/1000",
      "ante": "0.1",
      "effective_stacks": 50000,
      "effective_stacks_bb": 50,
      "your_position": "CO",
      "your_hand": "AcQc",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular who defends their blinds well.",
      "current_state": "river",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Ah",
                  "Td",
                  "5s"
              ],
              "actions":
              [
                  {
                      "position": "UTG",
                      "action": "Fold",
                      "pot_size": 3900
                  },
                  {
                      "position": "MP",
                      "action": "Fold",
                      "pot_size": 3900
                  },
                  {
                      "position": "CO",
                      "action": "2500",
                      "pot_size": 3900
                  },
                  {
                      "position": "BTN",
                      "action": "Fold",
                      "pot_size": 6400
                  },
                  {
                      "position": "SB",
                      "action": "Fold",
                      "pot_size": 6400
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 6400
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "Ah",
                  "Td",
                  "5s",
                  "2c"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 8900
                  },
                  {
                      "position": "CO",
                      "action": "4000",
                      "pot_size": 8900
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 12900
                  }
              ]
          },
          "river":
          {
              "cards":
              [
                  "Ah",
                  "Td",
                  "5s",
                  "2c",
                  "Ks"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 20900
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair, top kicker)",
          "Position (in position)",
          "Opponent tendencies (TAGs can have strong hands when they check-call the turn)",
          "River card completes a possible straight"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking behind with top pair, top kicker would be a mistake. You likely have the best hand and should be looking to extract value from your opponent. Checking allows them to see the showdown for free.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 5000",
              "explanation": "This bet size is too small. It doesn't put enough pressure on your opponent and doesn't extract enough value from your strong hand. With a pot size of 20,900, you should be betting larger.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 10450",
              "explanation": "This is the correct choice. Betting around half the pot is a good size in this situation. It puts pressure on your opponent and builds the pot. Against a TAG player, this bet is likely to get called by worse hands.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 20900",
              "explanation": "While betting is correct, this bet size is too large. A pot-sized bet is likely to scare away your opponent, especially a TAG. A smaller bet is more likely to get called and extract value.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 34,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Late",
      "blinds": "2000/4000",
      "ante": "0.25",
      "effective_stacks": 60000,
      "effective_stacks_bb": 15,
      "your_position": "SB",
      "your_hand": "Ad8d",
      "opponent_information": "The player in the BB is a loose-aggressive (LAG) player who defends their blinds very wide.",
      "current_state": "river",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "As",
                  "Jc",
                  "7s"
              ],
              "actions":
              [
                  {
                      "position": "UTG",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "UTG1",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "UTG2",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "MP",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "MP1",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "HJ",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "CO",
                      "action": "Fold",
                      "pot_size": 15000
                  },
                  {
                      "position": "BTN",
                      "action": "12000",
                      "pot_size": 15000
                  },
                  {
                      "position": "SB",
                      "action": "Call",
                      "pot_size": 27000
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 39000
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "As",
                  "Jc",
                  "7s",
                  "3d"
              ],
              "actions":
              [
                  {
                      "position": "SB",
                      "action": "Check",
                      "pot_size": 39000
                  },
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 39000
                  },
                  {
                      "position": "BTN",
                      "action": "Check",
                      "pot_size": 39000
                  }
              ]
          },
          "river":
          {
              "cards":
              [
                  "As",
                  "Jc",
                  "7s",
                  "3d",
                  "8h"
              ],
              "actions":
              [
                  {
                      "position": "SB",
                      "action": "10000",
                      "pot_size": 39000
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 49000
                  },
                  {
                      "position": "BTN",
                      "action": "Fold",
                      "pot_size": 59000
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (two pair, aces and eights)",
          "Position (out of position)",
          "Opponent tendencies (LAGs can have a wide range of hands when they call a river bet)",
          "You have turned a small pair into a strong hand that can get value from Ace-rag type hands."
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding two pair on the river is a very weak play. You have a strong hand that is likely ahead of your opponent's range. You should be looking to extract value with your hand.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is a viable option, but against a LAG player who defends with a wide range, it's possible you're beat by a better two pair, a set, or a straight. Given the opponent's wide range, a small raise may be better.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 24000",
              "explanation": "This is the correct choice. Raising to around 2.4 times your opponent's bet is a good size with two pair. It puts pressure on your opponent and could get called by worse hands, particularly against a LAG player who might call with a single pair or a draw.",
              "is_correct": true
          },
          {
              "choice_text": "Move all in",
              "explanation": "While moving all in is tempting with a strong hand, it's not the best option here. Your opponent might fold many hands that you are beating. A smaller raise is more likely to get called and extract value.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 35,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Early",
      "blinds": "50/100",
      "ante": "no ante",
      "effective_stacks": 15000,
      "effective_stacks_bb": 150,
      "your_position": "UTG",
      "your_hand": "7s6s",
      "opponent_information": "Early in the tournament, reads are limited. Opponents are assumed to be a mix of tight and loose players.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (early position requires a tighter range)",
          "Hand strength (suited connectors have good potential but are not premium hands)",
          "Tournament stage (early stage allows for more speculative plays due to deep stacks)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "While 7s6s is not a premium hand, folding it from early position in the early stages of a tournament can be too tight. With deep stacks, this hand has good potential to make straights and flushes and can be played profitably if it flops well.",
              "is_correct": true
          },
          {
              "choice_text": "Limp (call the minimum bet)",
              "explanation": "Limping with 7s6s from early position can be considered. It allows you to see a cheap flop and potentially hit a strong hand. However, it's important to be aware of the risks of limping, such as allowing multiple opponents to enter the pot cheaply and potentially facing difficult postflop situations out of position.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 300",
              "explanation": "Raising with 7s6s from early position is generally not recommended. This hand is speculative and plays better against multiple opponents. Raising from early position tends to isolate you against stronger ranges, making it difficult to realize the hand's potential.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 500",
              "explanation": "Raising with 7s6s from early position is not recommended, and raising to 500 is even worse than raising to 300. A larger raise increases the risk without significantly improving your chances of winning the pot preflop.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 36,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "400/800",
      "ante": "0.1",
      "effective_stacks": 32000,
      "effective_stacks_bb": 40,
      "your_position": "CO",
      "your_hand": "Tc9c",
      "opponent_information": "The player in the BB is a loose-passive (fish) player.",
      "current_state": "turn",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "9s",
                  "6h",
                  "2d"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 3900
                  },
                  {
                      "position": "CO",
                      "action": "2500",
                      "pot_size": 3900
                  },
                  {
                      "position": "BTN",
                      "action": "Fold",
                      "pot_size": 6400
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 6400
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "9s",
                  "6h",
                  "2d",
                  "8c"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 8900
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair with a gutshot straight draw)",
          "Position (in position)",
          "Opponent tendencies (fish tend to be passive and call with a wide range, including draws)",
          "Board texture (turn completes a possible straight and brings a backdoor flush draw)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking is an option, but it allows your opponent to see a free river card and potentially improve their hand. With a made hand and a draw, betting is generally preferred.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 4450",
              "explanation": "This is the correct choice. Betting around half the pot is a good size in this situation. You have a strong hand and a draw, and you want to extract value from worse made hands and draws. Against a loose-passive player, this bet is likely to get called by a wide range, allowing you to build the pot.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 8900",
              "explanation": "While betting is correct, a pot-sized bet is too large in this situation. You have a strong hand, but you also have a draw, and a smaller bet can accomplish the same goals while also allowing you to continue betting on many rivers.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 17800",
              "explanation": "While betting is correct, an overbet of this size is far too large. It risks too much of your stack and is unlikely to be called by anything other than a very strong hand that has you beat. A smaller bet is much more appropriate.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 37,
      "game_type": "NLHE 6-max MTT",
      "tournament_stage": "Late",
      "blinds": "5000/10000",
      "ante": "0.1",
      "effective_stacks": 150000,
      "effective_stacks_bb": 15,
      "your_position": "BB",
      "your_hand": "7d7s",
      "opponent_information": "The player on the BTN is a loose-aggressive (LAG) player who has been very active.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "7h",
                  "5c",
                  "2d"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 39000
                  },
                  {
                      "position": "BTN",
                      "action": "20000",
                      "pot_size": 39000
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top set)",
          "Position (out of position)",
          "Opponent tendencies (LAG players can be bluffing frequently on the flop)",
          "Board texture (relatively dry, but a set is very strong)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding a set on the flop is an extremely weak play. You have one of the strongest possible hands and should be looking to extract maximum value, especially with a short stack.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is an option, but it's not the best play. You have a very strong hand and should be looking to build the pot immediately. Calling allows your opponent to potentially see a free turn card and improve their hand, or to check back the turn, denying you a chance to extract more value.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 60000",
              "explanation": "Raising is a good option, but with your short stack size, it's generally better to go all in and put maximum pressure on your opponent.",
              "is_correct": false
          },
          {
              "choice_text": "Move all in for 130000",
              "explanation": "This is the correct choice. Moving all in with top set on the flop is the best way to extract maximum value, especially against an aggressive opponent. You have a very strong hand and a short stack, so getting all the money in now is the most profitable play.",
              "is_correct": true
          }
      ]
  },
  {
      "scenario_id": 38,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Late",
      "blinds": "500/1000",
      "ante": "0.1",
      "effective_stacks": 25000,
      "effective_stacks_bb": 25,
      "your_position": "SB",
      "your_hand": "QhJh",
      "opponent_information": "The player in the BB is a tight-passive (nit) player.",
      "current_state": "turn",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Js",
                  "8h",
                  "5d"
              ],
              "actions":
              [
                  {
                      "position": "SB",
                      "action": "Check",
                      "pot_size": 3900
                  },
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 3900
                  },
                  {
                      "position": "BTN",
                      "action": "Fold",
                      "pot_size": 3900
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "Js",
                  "8h",
                  "5d",
                  "2c"
              ],
              "actions":
              [
                  {
                      "position": "SB",
                      "action": "Check",
                      "pot_size": 3900
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair)",
          "Position (out of position)",
          "Opponent tendencies (nits check their weak hands and some of their strong hands to protect their checking range)",
          "Board texture (turn is a blank, unlikely to have changed hand strengths significantly)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking is a reasonable option. You have top pair, but you are out of position against a tight player. Checking allows you to control the size of the pot and potentially see a free river card.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 2000",
              "explanation": "Betting is also a viable option. You have top pair and can try to extract value from worse hands. However, given the opponent's tight tendencies, they might fold many hands you are beating. A small bet could induce a call or allow you to see a cheap showdown if raised.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 5000",
              "explanation": "While betting can be an option, this bet size is too large. You are out of position against a tight player, and a large bet might force them to fold hands you are beating. A smaller bet is more likely to get called and extract value.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 10000",
              "explanation": "Betting this large with top pair and no draw is far too aggressive, especially against a tight player. This bet is likely to only get called by hands that have you beat.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 39,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "300/600",
      "ante": "0.1",
      "effective_stacks": 30000,
      "effective_stacks_bb": 50,
      "your_position": "UTG",
      "your_hand": "9s8s",
      "opponent_information": "Early position, 6-max. Standard table.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (early position requires a tight range)",
          "Hand strength (9s8s is a speculative hand that can flop well, but should be played cautiously from early position)",
          "Tournament stage (Middle stage, stacks are still relatively deep)",
          "Stack sizes (50 big blinds allows for some flexibility but caution is needed in early position)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "This is the correct choice. 9s8s, while having some potential, is generally too weak to open from early position in a 6-max game. You have many players left to act behind you who could have stronger hands, and you'll often be forced to play out of position postflop. In the middle stages, with antes in play, preserving your stack is crucial. It's better to wait for a stronger hand in early position.",
              "is_correct": true
          },
          {
              "choice_text": "Limp (call the minimum bet)",
              "explanation": "Limping with any hand, let alone a speculative one like 9s8s, is generally not recommended from early position. It doesn't build the pot and can lead to difficult situations postflop if multiple players enter the pot.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 1500",
              "explanation": "Raising with 9s8s from early position is too loose. This hand is not strong enough to withstand pressure from players acting after you, and you'll often be forced to play out of position with a marginal hand.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 1800",
              "explanation": "Raising with 9s8s from early position is not recommended, even with a smaller raise size. It's better to play a tighter range from early position and avoid playing speculative hands out of position.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 40,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "400/800",
      "ante": "0.1",
      "effective_stacks": 40000,
      "effective_stacks_bb": 50,
      "your_position": "BB",
      "your_hand": "Ts9s",
      "opponent_information": "Button is a standard, regular player.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "8s",
                  "7d",
                  "2c"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 3900
                  },
                  {
                      "position": "BTN",
                      "action": "2000",
                      "pot_size": 3900
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (open-ended straight draw)",
          "Position (out of position)",
          "Opponent tendencies (standard players are capable of betting with a wide range on this board)",
          "Board texture (connected board, potential for straights)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding with an open-ended straight draw is too weak, especially on a board that connects well with your hand. You have a good chance to improve to a strong hand on the turn or river.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is a reasonable option. It allows you to see the turn card relatively cheaply and potentially improve to a straight. However, given that you are out of position and have a strong draw, raising might be a better option to build the pot and potentially take it down immediately.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 6000",
              "explanation": "Raising is a strong option here. You have a strong draw and can represent a made hand like a set or two pair. Raising allows you to build a bigger pot for when you hit your straight and potentially take down the pot immediately if your opponent folds. A raise of about 3 times the initial bet is appropriate.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 12000",
              "explanation": "While raising is a good option, a raise of this size is too large. It risks too much of your stack with a draw and might force your opponent to fold hands you are currently beating or that you can improve against on later streets.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 41,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "400/800",
      "ante": "0.1",
      "effective_stacks": 32000,
      "effective_stacks_bb": 40,
      "your_position": "BB",
      "your_hand": "AcKc",
      "opponent_information": "Button is a standard, regular player",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "As",
                  "Td",
                  "5c"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 3900
                  },
                  {
                      "position": "BTN",
                      "action": "1950",
                      "pot_size": 3900
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair, top kicker)",
          "Position (out of position",
          "Opponent tendencies (standard players are capable of betting with a wide range on this board)",
          "Board texture (relatively dry, but potential straight draws exist)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding top pair, top kicker is a very bad play. This is a clear value hand that beats a large portion of the opponent's range. By folding here, you are missing a huge amount of value.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is certainly an option, allowing you to control the pot and keep the opponent's bluffs in. With your hand strength being very strong, this is a valid choice.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 5850",
              "explanation": "Raising is a viable option to extract more value from hands worse than yours, like worse Ax or Tx hands. It also protects you from hands with a backdoor draw like QJ or J9 that might call a flop bet but would be hard-pressed to call a raise. By making it more expensive for these hands to continue, you reduce the chances of them improving and beating you later.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 8000",
              "explanation": "Raising this large is unnecessary and may price out hands you currently beat. It is better to make a smaller raise that encourages calls from worse hands.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 42,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Late",
      "blinds": "1000/2000",
      "ante": "0.25",
      "effective_stacks": 50000,
      "effective_stacks_bb": 25,
      "your_position": "CO",
      "your_hand": "JdTs",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular.",
      "current_state": "turn",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "9c",
                  "8c",
                  "2s"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 7500
                  },
                  {
                      "position": "CO",
                      "action": "4000",
                      "pot_size": 7500
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 11500
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "9c",
                  "8c",
                  "2s",
                  "7h"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 19500
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (open-ended straight draw)",
          "Position (in position)",
          "Opponent tendencies (TAG players are capable of check-calling with a wide range on the flop)",
          "Board texture (turn completes a straight and brings a backdoor flush draw)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking behind with an open-ended straight draw is an option, but it doesn't maximize your chances of winning the pot. Betting allows you to potentially win the pot immediately or build a bigger pot for when you hit your straight.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 5000",
              "explanation": "Betting is the correct approach with your open-ended straight draw, and a bet around this size (1/4 pot) will likely be enough to get your opponent to fold hands with little or no equity.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 9750",
              "explanation": "This is the correct choice. Betting around half the pot is a good size in this situation. It puts pressure on your opponent and builds the pot for a potential river bet. You have a strong draw and are in position, so a larger bet size is justified.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 19500",
              "explanation": "While betting is correct, a pot-sized bet is too large in this situation. It's likely to scare away your opponent, especially a TAG, and may only get called by hands that beat you. A smaller bet is more likely to get called and build the pot.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 43,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "500/1000",
      "ante": "0.1",
      "effective_stacks": 50000,
      "effective_stacks_bb": 50,
      "your_position": "BTN",
      "your_hand": "7h7d",
      "opponent_information": "The player in the BB is a loose-passive (fish) player.",
      "current_state": "turn",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Js",
                  "9h",
                  "2d"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 3900
                  },
                  {
                      "position": "BTN",
                      "action": "2500",
                      "pot_size": 3900
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 6400
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "Js",
                  "9h",
                  "2d",
                  "Th"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 8900
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (underpair)",
          "Position (in position)",
          "Opponent tendencies (fish tend to be passive and call with a wide range, including draws)",
          "Board texture (turn completes a possible straight and brings a flush draw)",
          "You do not block any of the potential draws the opponent may have"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "This is the correct choice. With a small pair that is likely behind on this board, checking is the best option. You have no draw and your opponent is unlikely to fold a better hand. Checking allows you to see a free river card and potentially improve to a set, or avoid losing more chips when you are behind.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 4450",
              "explanation": "Betting is not a good option here. Your hand is unlikely to be ahead and you have no draw to improve. A bet will likely only get called by better hands and fold out worse hands, which is the opposite of what you want to achieve.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 8900",
              "explanation": "Betting this large with a small pair is far too aggressive. You are unlikely to get any value from worse hands and will only get called by hands that beat you. This bet risks too much of your stack without a good reason.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 17800",
              "explanation": "Overbetting the pot with a small pair is an extremely bad play. This bet will almost never get called by worse hands and will only get called by hands that have you crushed.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 44,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Final Table",
      "blinds": "5000/10000",
      "ante": "0.1",
      "effective_stacks": 400000,
      "effective_stacks_bb": 40,
      "your_position": "BB",
      "your_hand": "AdQd",
      "opponent_information": "The player on the BTN is a tight-aggressive (TAG) regular.",
      "current_state": "river",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "As",
                  "Jc",
                  "7s"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 39000
                  },
                  {
                      "position": "BTN",
                      "action": "20000",
                      "pot_size": 39000
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 59000
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "As",
                  "Jc",
                  "7s",
                  "3d"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 99000
                  },
                  {
                      "position": "BTN",
                      "action": "50000",
                      "pot_size": 99000
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 149000
                  }
              ]
          },
          "river":
          {
              "cards":
              [
                  "As",
                  "Jc",
                  "7s",
                  "3d",
                  "8h"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 249000
                  },
                  {
                      "position": "BTN",
                      "action": "124500",
                      "pot_size": 249000
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair, top kicker)",
          "Position (out of position)",
          "Opponent tendencies (TAG players are capable of betting for value and as a bluff on the river)",
          "Board texture (river is a blank, unlikely to have changed hand strengths significantly)",
          "Stack sizes (40 big blinds effective)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding top pair, top kicker on the river is too weak, especially when your opponent has shown the potential to bluff by betting twice. You are ahead of a significant portion of their betting range.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "This is the correct choice. You have a very strong hand that beats many of your opponent's value bets and all their bluffs. While there's a chance you could be up against a set or two pair, the likelihood of your opponent bluffing, especially on a blank river, makes calling profitable.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 249000",
              "explanation": "Raising is not a good option here. With 40 big blinds effective, there is no more room to raise. Any further action on your part must be to call or fold.",
              "is_correct": false
          },
          {
              "choice_text": "Move all in for 225500",
              "explanation": "Moving all in is not a good option. You are only getting called when you are beat and losing when you are ahead. Your hand is not strong enough to bet here as the pot is already so big, and shoving only improves the situation for hands that beat you.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 45,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Early",
      "blinds": "50/100",
      "ante": "no ante",
      "effective_stacks": 15000,
      "effective_stacks_bb": 150,
      "your_position": "MP",
      "your_hand": "AhQh",
      "opponent_information": "Early in the tournament, reads are limited. Opponents are assumed to be a mix of tight and loose players.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (middle position, several players left to act)",
          "Hand strength (AQo is a strong hand, but can be dominated)",
          "Tournament stage (early stage, stacks are deep)",
          "Stack sizes (150 big blinds allows for a wide range of plays)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding AQo from middle position is too tight. This is a strong hand that should be played, especially in the early stages of a tournament when stacks are deep.",
              "is_correct": false
          },
          {
              "choice_text": "Limp (call the minimum bet)",
              "explanation": "Limping with AQo is not recommended. It fails to build the pot with a strong hand and allows too many opponents to see a cheap flop, diminishing the value of your hand.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 300",
              "explanation": "This is the correct choice. Raising to 3 big blinds with AQo from middle position is a standard play. It allows you to build the pot with a strong hand and puts pressure on opponents in later positions.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 500",
              "explanation": "While raising is correct, a raise of this size is too large from middle position. A standard raise of 2.5-3 big blinds is generally sufficient.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 46,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Late",
      "blinds": "1000/2000",
      "ante": "0.25",
      "effective_stacks": 50000,
      "effective_stacks_bb": 25,
      "your_position": "CO",
      "your_hand": "AsQh",
      "opponent_information": "The player in the BB is a loose-passive (fish) player.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Ah",
                  "Td",
                  "5s"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 7500
                  },
                  {
                      "position": "CO",
                      "action": "3750",
                      "pot_size": 7500
                  },
                  {
                      "position": "BTN",
                      "action": "Fold",
                      "pot_size": 11250
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 11250
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "Ah",
                  "Td",
                  "5s",
                  "2c"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 18750
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair, top kicker)",
          "Position (in position)",
          "Opponent tendencies (fish tend to be passive and call with a wide range)",
          "Board texture (turn is a blank, unlikely to have changed hand strengths significantly)",
          "Stack sizes (25 big blinds effective)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking would be too passive with top pair, top kicker. You are likely ahead and should be looking to extract value from worse hands. Checking also allows your opponent to see a free river card, potentially improving their hand.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 4687",
              "explanation": "While betting is correct, this bet size is too small. It doesn't put enough pressure on your opponent and doesn't extract enough value from your strong hand. A larger bet is more appropriate.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 9375",
              "explanation": "This is the correct choice. Betting around half the pot is a good size in this situation. It puts pressure on your opponent and builds the pot for a potential river bet. Against a loose-passive player, this bet is likely to get called by worse hands like weaker Aces, top pair worse kicker, or draws.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 18750",
              "explanation": "While betting is correct, a pot-sized bet is too large in this situation. It's likely to scare away your opponent, especially a fish, and may only get called by hands that beat you. A smaller bet is more likely to get called and extract value.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 47,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Final Table",
      "blinds": "5000/10000",
      "ante": "0.1",
      "effective_stacks": 250000,
      "effective_stacks_bb": 25,
      "your_position": "SB",
      "your_hand": "As5s",
      "opponent_information": "The player in the BB is a loose-passive (fish) player.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (Small blind with no other callers before you)",
          "Hand strength (ace with a small suited kicker can be played more aggressively, especially when effective stacks are shorter)",
          "Opponent tendencies (loose-passive players will call too often preflop, making it more likely you can win the pot preflop)",
          "Stack sizes (25 big blinds effective)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding preflop is too tight here. Even though you have a weak ace, you should be completing into the pot here very frequently.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "While completing the small blind is an option, it may not be the most effective way to play this specific hand. The small suited ace has potential, especially against a weaker player in the big blind. However, simply calling might not capitalize on the opportunity to put pressure on your opponent and win the pot before the flop.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 30000",
              "explanation": "Raising preflop is not the best play here since we have a shorter stack. In general, it is more prudent to either go all-in or just limp when stacks are around this size.",
              "is_correct": false
          },
          {
              "choice_text": "Move all in for 250000",
              "explanation": "This is the best option. When short-stacked, especially on the final table bubble, putting pressure on opponents with shoves is a common and effective strategy. This approach maximizes the chances of picking up the blinds and antes without seeing a flop, which is valuable for preserving and potentially increasing your stack.",
              "is_correct": true
          }
      ]
  },
  {
      "scenario_id": 48,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "400/800",
      "ante": "0.1",
      "effective_stacks": 24000,
      "effective_stacks_bb": 30,
      "your_position": "CO",
      "your_hand": "Ts9s",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular.",
      "current_state": "turn",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "9h",
                  "6d",
                  "2c"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 3900
                  },
                  {
                      "position": "CO",
                      "action": "2500",
                      "pot_size": 3900
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 6400
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "9h",
                  "6d",
                  "2c",
                  "8s"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 8900
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair with an open-ended straight draw)",
          "Position (in position)",
          "Opponent tendencies (TAG players are capable of check-calling with a wide range on the flop)",
          "Board texture (turn completes a possible straight and brings a backdoor flush draw)",
          "Stack sizes (30 big blinds effective)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking is an option, but it doesn't fully capitalize on your strong hand and draw. Betting allows you to extract value from worse hands and potentially win the pot immediately if your opponent folds.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 2225",
              "explanation": "While betting is correct, this bet size is too small. It doesn't put enough pressure on your opponent and doesn't build the pot effectively. With a strong hand and draw, you should be betting larger.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 4450",
              "explanation": "This is the correct choice. Betting around half the pot is a good size in this situation. It puts pressure on your opponent and builds the pot for a potential river bet. You have a strong hand and a draw, and against a TAG player, this bet is likely to get called by worse hands.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 13350",
              "explanation": "While betting is correct, a bet of this size is too large. It's likely to scare away your opponent and may only get called by hands that beat you. A smaller bet is more likely to get called and extract value.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 49,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "500/1000",
      "ante": "0.1",
      "effective_stacks": 40000,
      "effective_stacks_bb": 40,
      "your_position": "SB",
      "your_hand": "8h8d",
      "opponent_information": "The player in the BB is a loose-passive (fish) player.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "8s",
                  "6c",
                  "3d"
              ],
              "actions":
              [
                  {
                      "position": "SB",
                      "action": "Check",
                      "pot_size": 3900
                  },
                  {
                      "position": "BB",
                      "action": "2000",
                      "pot_size": 3900
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top set)",
          "Position (out of position)",
          "Opponent tendencies (fish tend to be passive and call with a wide range, including draws)",
          "Board texture (relatively dry, but potential straight draws exist)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding top set on the flop is an extremely weak play. You have one of the strongest possible hands and should be looking to extract maximum value.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is an option, but it's not the best play. You have a very strong hand and should be looking to build the pot immediately. Calling allows your opponent to see a free turn card and potentially improve their hand, or to check back the turn, denying you a chance to extract more value.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 6000",
              "explanation": "This is the correct choice. Raising to three times the initial bet is a standard play with a very strong hand like top set. It builds the pot and puts pressure on your opponent, who is likely to call with a wide range given their loose-passive tendencies.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 12000",
              "explanation": "While raising is correct, a raise of this size is too large. It risks too much of your stack and might force your opponent to fold hands you are currently beating.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 50,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Late",
      "blinds": "1000/2000",
      "ante": "0.25",
      "effective_stacks": 50000,
      "effective_stacks_bb": 25,
      "your_position": "BTN",
      "your_hand": "KcQc",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular.",
      "current_state": "river",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Ks",
                  "Ts",
                  "5c"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 7500
                  },
                  {
                      "position": "BTN",
                      "action": "3750",
                      "pot_size": 7500
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 11250
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "Ks",
                  "Ts",
                  "5c",
                  "2d"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 18750
                  },
                  {
                      "position": "BTN",
                      "action": "9375",
                      "pot_size": 18750
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 28125
                  }
              ]
          },
          "river":
          {
              "cards":
              [
                  "Ks",
                  "Ts",
                  "5c",
                  "2d",
                  "5h"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 46875
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair with a good kicker, plus two pair on the river)",
          "Position (in position)",
          "Opponent tendencies (TAG players are capable of check-calling down with a wide range)",
          "Board texture (river pairs the bottom card, creating potential full houses and counterfeiting some two-pair hands)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking behind on the river is a viable option. While you have a strong hand with top two pair, the board is quite dangerous, and your opponent might have you beat with a full house. Additionally, your opponent's range, having called both the flop and turn bets, likely contains many strong hands. Checking allows you to control the pot size and avoid getting blown off your hand by a bigger bet.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 11718",
              "explanation": "While betting for value can be considered, this bet size might be too small given the pot size and your opponent's likely range. A larger bet could extract more value from worse hands that might call, like a weaker two pair or a hand with a King. However, it's important to balance the risk of getting check-raised by a stronger hand.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 23437",
              "explanation": "This bet size is more appropriate for extracting value from your opponent. It's large enough to put pressure on them and get calls from a wider range of worse hands. However, you should be prepared for the possibility of a check-raise, given the board texture and the fact that you have a strong, but not unbeatable, hand.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 46875",
              "explanation": "A pot-sized bet on the river is generally too large in this situation. While you want to extract value, betting this much might scare away many worse hands and only get called by hands that beat you. It also makes it difficult to call a potential check-raise from your opponent.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 49,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "500/1000",
      "ante": "0.1",
      "effective_stacks": 40000,
      "effective_stacks_bb": 40,
      "your_position": "SB",
      "your_hand": "AcKd",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Ah",
                  "Td",
                  "5c"
              ],
              "actions":
              [
                  {
                      "position": "SB",
                      "action": "Check",
                      "pot_size": 3900
                  },
                  {
                      "position": "BB",
                      "action": "2000",
                      "pot_size": 3900
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair, top kicker)",
          "Position (out of position)",
          "Opponent tendencies (TAG players are likely to have a strong range when they bet)",
          "Board texture (relatively dry, but potential straight draws exist)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding top pair with top kicker is too weak, especially on a relatively dry board. You are ahead of a significant portion of your opponent's betting range, including draws and weaker made hands.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is a reasonable option, allowing you to control the pot size and see the turn card. However, given that you are out of position and have a very strong hand, raising might be a better option to build the pot and potentially take it down immediately.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 6000",
              "explanation": "This is the correct choice. Raising to three times the initial bet is a standard play with a strong hand like top pair, top kicker. It builds the pot and puts pressure on your opponent.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 12000",
              "explanation": "While raising is correct, this raise size is too large. It risks too much of your stack and might force your opponent to fold hands that you are currently beating.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 50,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Late",
      "blinds": "1000/2000",
      "ante": "0.25",
      "effective_stacks": 60000,
      "effective_stacks_bb": 30,
      "your_position": "CO",
      "your_hand": "QhQs",
      "opponent_information": "The player in the BB is a loose-passive (fish) player.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Js",
                  "9h",
                  "2d"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 7500
                  },
                  {
                      "position": "CO",
                      "action": "4000",
                      "pot_size": 7500
                  },
                  {
                      "position": "BTN",
                      "action": "Fold",
                      "pot_size": 11500
                  },
                  {
                      "position": "SB",
                      "action": "Fold",
                      "pot_size": 11500
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 11500
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "Js",
                  "9h",
                  "2d",
                  "Th"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 19500
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (overpair)",
          "Position (in position)",
          "Opponent tendencies (fish tend to be passive and call with a wide range)",
          "Board texture (turn completes a possible straight and brings a flush draw)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking would be too passive with an overpair on the turn. While the board is now more coordinated, you still have a strong hand and should be looking to extract value. Checking also allows your opponent to see a free river card, potentially improving their hand.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 9750",
              "explanation": "This is the correct choice. Betting around half the pot is a good size in this situation. It puts pressure on your opponent and builds the pot for a potential river bet. Against a loose-passive player, this bet is likely to get called by worse hands like pairs, straight draws, or flush draws.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 19500",
              "explanation": "While betting is correct, a pot-sized bet is too large in this situation. It's likely to scare away your opponent, especially a fish, and may only get called by hands that beat you. A smaller bet is more likely to get called and extract value.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 39000",
              "explanation": "While betting is correct, an overbet of this size is far too large. It risks too much of your stack and is unlikely to be called by anything other than a very strong hand that has you beat. A smaller bet is much more appropriate.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 49,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "500/1000",
      "ante": "0.1",
      "effective_stacks": 40000,
      "effective_stacks_bb": 40,
      "your_position": "SB",
      "your_hand": "8h8d",
      "opponent_information": "The player in the BB is a loose-passive (fish) player.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "8s",
                  "6c",
                  "3d"
              ],
              "actions":
              [
                  {
                      "position": "SB",
                      "action": "Check",
                      "pot_size": 3900
                  },
                  {
                      "position": "BB",
                      "action": "2000",
                      "pot_size": 3900
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top set)",
          "Position (out of position)",
          "Opponent tendencies (fish tend to be passive and call with a wide range, including draws)",
          "Board texture (relatively dry, but potential straight draws exist)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding top set on the flop is an extremely weak play. You have one of the strongest possible hands and should be looking to extract maximum value.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is an option, but it's not the best play. You have a very strong hand and should be looking to build the pot immediately. Calling allows your opponent to see a free turn card and potentially improve their hand, or to check back the turn, denying you a chance to extract more value.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 6000",
              "explanation": "This is the correct choice. Raising to three times the initial bet is a standard play with a very strong hand like top set. It builds the pot and puts pressure on your opponent, who is likely to call with a wide range given their loose-passive tendencies.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 12000",
              "explanation": "While raising is correct, a raise of this size is too large. It risks too much of your stack and might force your opponent to fold hands you are currently beating.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 50,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Late",
      "blinds": "1000/2000",
      "ante": "0.25",
      "effective_stacks": 50000,
      "effective_stacks_bb": 25,
      "your_position": "BTN",
      "your_hand": "KcQc",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular.",
      "current_state": "river",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Ks",
                  "Ts",
                  "5c"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 7500
                  },
                  {
                      "position": "BTN",
                      "action": "3750",
                      "pot_size": 7500
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 11250
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "Ks",
                  "Ts",
                  "5c",
                  "2d"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 18750
                  },
                  {
                      "position": "BTN",
                      "action": "9375",
                      "pot_size": 18750
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 28125
                  }
              ]
          },
          "river":
          {
              "cards":
              [
                  "Ks",
                  "Ts",
                  "5c",
                  "2d",
                  "5h"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 46875
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair with a good kicker, plus two pair on the river)",
          "Position (in position)",
          "Opponent tendencies (TAG players are capable of check-calling down with a wide range)",
          "Board texture (river pairs the bottom card, creating potential full houses and counterfeiting some two-pair hands)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking behind on the river is a viable option. While you have a strong hand with top two pair, the board is quite dangerous, and your opponent might have you beat with a full house. Additionally, your opponent's range, having called both the flop and turn bets, likely contains many strong hands. Checking allows you to control the pot size and avoid getting blown off your hand by a bigger bet.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 11718",
              "explanation": "While betting for value can be considered, this bet size might be too small given the pot size and your opponent's likely range. A larger bet could extract more value from worse hands that might call, like a weaker two pair or a hand with a King. However, it's important to balance the risk of getting check-raised by a stronger hand.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 23437",
              "explanation": "This bet size is more appropriate for extracting value from your opponent. It's large enough to put pressure on them and get calls from a wider range of worse hands. However, you should be prepared for the possibility of a check-raise, given the board texture and the fact that you have a strong, but not unbeatable, hand.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 46875",
              "explanation": "A pot-sized bet on the river is generally too large in this situation. While you want to extract value, betting this much might scare away many worse hands and only get called by hands that beat you. It also makes it difficult to call a potential check-raise from your opponent.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 51,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Early",
      "blinds": "50/100",
      "ante": "no ante",
      "effective_stacks": 15000,
      "effective_stacks_bb": 150,
      "your_position": "UTG",
      "your_hand": "7s6s",
      "opponent_information": "Early in the tournament, reads are limited. Opponents are assumed to be a mix of tight and loose players.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (early position requires a tighter range)",
          "Hand strength (suited connectors have good potential but are not premium hands)",
          "Tournament stage (early stage allows for more speculative plays due to deep stacks)",
          "Stack size (150BB deep encourages playing hands that can make straights and flushes)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "While 7s6s is not a premium hand, folding it from early position in the early stages of a tournament can be too tight. With deep stacks, this hand has good potential to make straights and flushes and can be played profitably if it flops well.",
              "is_correct": true
          },
          {
              "choice_text": "Limp (call the minimum bet)",
              "explanation": "Limping with 7s6s from early position can be considered. It allows you to see a cheap flop and potentially hit a strong hand. However, it's important to be aware of the risks of limping, such as allowing multiple opponents to enter the pot cheaply and potentially facing difficult postflop situations out of position.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 300",
              "explanation": "Raising with 7s6s from early position is generally not recommended. This hand is speculative and plays better against multiple opponents. Raising from early position tends to isolate you against stronger ranges, making it difficult to realize the hand's potential.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 400",
              "explanation": "Raising with 7s6s from early position is not recommended, and raising to 500 is even worse than raising to 300. A larger raise increases the risk without significantly improving your chances of winning the pot preflop.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 52,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "400/800",
      "ante": "0.1",
      "effective_stacks": 40000,
      "effective_stacks_bb": 50,
      "your_position": "UTG",
      "your_hand": "AhKh",
      "opponent_information": "Middle position, 9-handed. Standard table.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (early position requires a tight range)",
          "Hand strength (AKs is a premium hand)",
          "Tournament stage (Middle stage, stacks are still relatively deep but antes make stealing more valuable)",
          "Stack sizes (50 big blinds is a healthy stack but not extremely deep)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding AKs, even from early position, is far too tight. This is one of the strongest hands in Hold'em and should always be played aggressively.",
              "is_correct": false
          },
          {
              "choice_text": "Limp (call the minimum bet)",
              "explanation": "Limping with AKs is a major mistake. This hand is too strong to limp with and should be played for a raise to build the pot and deny equity to weaker hands.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 2000",
              "explanation": "This is the correct choice. Raising to 2.5 big blinds with AKs from early position is a standard and profitable play. It allows you to build the pot with a premium hand and puts pressure on opponents in later positions. You should be looking to play this hand aggressively and get value from it.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 4000",
              "explanation": "While raising is correct, a raise of this size is unnecessarily large from early position. A standard raise of 2.5x is sufficient to build the pot and define opponents' ranges.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 53,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "500/1000",
      "ante": "0.1",
      "effective_stacks": 50000,
      "effective_stacks_bb": 50,
      "your_position": "CO",
      "your_hand": "KsJs",
      "opponent_information": "The player in the BB is a loose-passive (fish) player.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Kc",
                  "9d",
                  "4h"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 3900
                  },
                  {
                      "position": "CO",
                      "action": "2500",
                      "pot_size": 3900
                  },
                  {
                      "position": "BTN",
                      "action": "Fold",
                      "pot_size": 6400
                  },
                  {
                      "position": "SB",
                      "action": "Fold",
                      "pot_size": 6400
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 6400
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "Kc",
                  "9d",
                  "4h",
                  "Ts"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 8900
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair with a decent kicker)",
          "Position (in position)",
          "Opponent tendencies (fish tend to call with a wide range, including draws and weak made hands)",
          "Board texture (turn brings a possible straight draw and backdoor flush draw)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking behind with top pair is too passive, especially against a loose-passive player. You have a strong hand and should be looking to extract value. Checking also allows your opponent to see a free river card, potentially improving their hand.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 4450",
              "explanation": "Betting around half the pot is a reasonable size. It allows you to extract value from worse hands and puts pressure on draws. Against a loose-passive player, this bet will likely get called by a wide range, allowing you to build the pot.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 8900",
              "explanation": "While betting is correct, a pot-sized bet might be a bit too large in this situation. While you have a strong hand, you don't want to scare away your loose-passive opponent who might call a smaller bet with a wide range.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 17800",
              "explanation": "Betting this large with top pair is too aggressive, especially against a loose-passive player who might call smaller bets with a wide range. This bet is likely to only get called by hands that have you beat.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 54,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Late",
      "blinds": "1000/2000",
      "ante": "0.25",
      "effective_stacks": 60000,
      "effective_stacks_bb": 30,
      "your_position": "BTN",
      "your_hand": "AdQh",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular.",
      "current_state": "river",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "As",
                  "Tc",
                  "5h"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 7500
                  },
                  {
                      "position": "BTN",
                      "action": "4000",
                      "pot_size": 7500
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 11500
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "As",
                  "Tc",
                  "5h",
                  "2d"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 19500
                  },
                  {
                      "position": "BTN",
                      "action": "10000",
                      "pot_size": 19500
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 29500
                  }
              ]
          },
          "river":
          {
              "cards":
              [
                  "As",
                  "Td",
                  "5h",
                  "2d",
                  "Kh"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 49500
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair, top kicker)",
          "Position (in position)",
          "Opponent tendencies (TAG players are capable of check-calling down with a wide range on the flop and turn)",
          "Board texture (river completes a possible straight)",
          "Stack sizes (30 big blinds effective)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking behind is a reasonable option. While you have top pair, top kicker, the board is somewhat coordinated, and your opponent has shown strength by check-calling twice. Checking allows you to control the pot size and avoid getting blown off your hand by a bigger bet. This is especially important at 30BB stack depth where you cannot afford to play for stacks with a one-pair hand.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 12375",
              "explanation": "Betting can be considered, but this bet size might be a bit too small given the pot size. A larger bet could extract more value from worse hands that might call, like a weaker Ace or a Ten. However, it's important to balance the risk of getting check-raised by a stronger hand.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 24750",
              "explanation": "This bet size is more appropriate for extracting value from your opponent. It's large enough to put pressure on them and get calls from a wider range of worse hands. However, you should be prepared for the possibility of a check-raise, given the board texture.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 49500",
              "explanation": "A pot-sized bet on the river is generally too large in this situation. While you want to extract value, betting this much might scare away many worse hands and only get called by hands that beat you.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 55,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Final Table",
      "blinds": "5000/10000",
      "ante": "0.1",
      "effective_stacks": 150000,
      "effective_stacks_bb": 15,
      "your_position": "CO",
      "your_hand": "KsQs",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (late position)",
          "Hand strength (KQo is a strong hand but you will be in a tough spot if you get 3-bet and have to fold)",
          "Opponent tendencies (TAG players tend to be solid and will have a strong range themselves)",
          "Stack sizes (15 big blinds effective puts you in a shove-or-fold situation)",
          "Tournament stage (final table, ICM considerations are significant)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding preflop is not ideal, especially in late position. KQo is strong enough to see a flop, especially against tighter players. However, in this situation with a short stack, raising is a better option, to steal the blinds and antes or to isolate with a hand that has good equity.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is not an option when you are the preflop raiser",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 25000",
              "explanation": "While raising is an option, it might put you in a difficult spot if you face a 3-bet from the blinds. With a short stack, an all-in shove might be a better approach to maximize fold equity and avoid playing a big pot out of position postflop.",
              "is_correct": false
          },
          {
              "choice_text": "Move all in for 150000",
              "explanation": "This is the correct choice. Moving all in with KQo from the CO is a good option at this stage of the tournament. With a short stack, your main goal is to pick up the blinds and antes or get called by a worse hand. This play puts pressure on your opponents and simplifies your decision-making.",
              "is_correct": true
          }
      ]
  },
  {
      "scenario_id": 56,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Early",
      "blinds": "50/100",
      "ante": "no ante",
      "effective_stacks": 20000,
      "effective_stacks_bb": 200,
      "your_position": "BTN",
      "your_hand": "8c7c",
      "opponent_information": "The player in the BB is a loose-passive (fish) player.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "9c",
                  "6d",
                  "2h"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 350
                  },
                  {
                      "position": "BTN",
                      "action": "200",
                      "pot_size": 350
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 550
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "9c",
                  "6d",
                  "2h",
                  "5h"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 950
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (open-ended straight draw)",
          "Position (in position)",
          "Opponent tendencies (fish tend to be passive and call with a wide range, including draws)",
          "Board texture (turn completes a straight and brings a backdoor flush draw)",
          "Stack sizes (200 big blinds effective)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking behind with a strong draw is an option, especially when deep-stacked. It allows you to control the pot size and potentially see a cheap river card. However, betting can also be a good play to build the pot and potentially win it immediately.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 475",
              "explanation": "This is the correct choice. Betting around half the pot is a good size in this situation. You have a strong draw and are in position against a loose-passive player. This bet puts pressure on your opponent and builds the pot for a potential river bet. Betting here can also induce worse hands to call, and with your draw, you have multiple ways to improve and win the pot.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 950",
              "explanation": "While betting is correct, a pot-sized bet is likely too large in this situation. You have a strong draw, but you don't want to force your opponent to fold hands that you can potentially improve against. A smaller bet is more likely to get called and keep your opponent in the pot.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 1900",
              "explanation": "While betting is correct, an overbet of this size is far too large. It risks too much of your stack with a draw and is unlikely to be called by anything other than a very strong hand that has you beat. A smaller bet is much more appropriate.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 57,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "400/800",
      "ante": "0.1",
      "effective_stacks": 32000,
      "effective_stacks_bb": 40,
      "your_position": "BTN",
      "your_hand": "8h8c",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Ac",
                  "Th",
                  "5c"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 3900
                  },
                  {
                      "position": "BTN",
                      "action": "2500",
                      "pot_size": 3900
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 6400
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "Ac",
                  "Th",
                  "5c",
                  "2d"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 8900
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (underpair)",
          "Position (in position)",
          "Opponent tendencies (TAG players are capable of check-calling with a wide range on the flop)",
          "Board texture (turn is a blank, unlikely to have changed hand strengths significantly)",
          "Stack sizes (40 big blinds effective)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "This is the correct choice. With an underpair on a relatively dry board, checking is the best option. You are unlikely to get value from worse hands and your hand is vulnerable to overcards on the river. Checking allows you to control the pot size and see a free river card.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 2225",
              "explanation": "Betting with an underpair on the turn is not a good play. You are unlikely to get called by worse hands and could be facing a raise from stronger holdings. A small bet doesn't achieve much and simply bloats the pot unnecessarily.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 4450",
              "explanation": "Betting this size with an underpair is too aggressive. You are unlikely to get value from worse hands and risk getting raised off your hand by stronger holdings. Checking is a more prudent approach.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 8900",
              "explanation": "Betting this large with an underpair is a significant mistake. It risks too much of your stack with a weak hand and is unlikely to get called by anything other than better hands. Checking is the best option here.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 58,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Late",
      "blinds": "1000/2000",
      "ante": "0.25",
      "effective_stacks": 60000,
      "effective_stacks_bb": 30,
      "your_position": "BTN",
      "your_hand": "KdQd",
      "opponent_information": "The player in the BB is a loose-aggressive (LAG) player.",
      "current_state": "turn",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Kc",
                  "Tc",
                  "5s"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 7500
                  },
                  {
                      "position": "BTN",
                      "action": "3750",
                      "pot_size": 7500
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 11250
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "Kc",
                  "Tc",
                  "5s",
                  "2d"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 18750
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair, good kicker)",
          "Position (in position)",
          "Opponent tendencies (LAG players can be unpredictable and have a wide range)",
          "Board texture (turn is a blank, unlikely to have changed hand strengths significantly)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking behind with top pair, good kicker is too passive. You are likely ahead and should be looking to extract value from worse hands. Checking also allows your opponent to see a free river card, potentially improving their hand.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 4687",
              "explanation": "While betting is correct, this bet size is too small. It doesn't put enough pressure on your opponent and doesn't extract enough value from your strong hand. A larger bet is more appropriate.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 9375",
              "explanation": "This is the correct choice. Betting around half the pot is a good size in this situation. It puts pressure on your opponent and builds the pot for a potential river bet. Against a LAG player, this bet is likely to get called by a wide range of hands, including worse Kings, top pair worse kicker, or draws.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 18750",
              "explanation": "While betting is correct, a pot-sized bet is too large in this situation. It's likely to scare away your opponent, especially a LAG, and may only get called by hands that beat you. A smaller bet is more likely to get called and extract value.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 55,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Final Table",
      "blinds": "5000/10000",
      "ante": "0.1",
      "effective_stacks": 150000,
      "effective_stacks_bb": 15,
      "your_position": "CO",
      "your_hand": "KsQs",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (late position)",
          "Hand strength (KQo is a strong hand but you will be in a tough spot if you get 3-bet and have to fold)",
          "Opponent tendencies (TAG players tend to be solid and will have a strong range themselves)",
          "Stack sizes (15 big blinds effective puts you in a shove-or-fold situation)",
          "Tournament stage (final table, ICM considerations are significant)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding preflop is not ideal, especially in late position. KQo is strong enough to see a flop, especially against tighter players. However, in this situation with a short stack, raising is a better option, to steal the blinds and antes or to isolate with a hand that has good equity.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is not an option when you are the preflop raiser",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 25000",
              "explanation": "While raising is an option, it might put you in a difficult spot if you face a 3-bet from the blinds. With a short stack, an all-in shove might be a better approach to maximize fold equity and avoid playing a big pot out of position postflop.",
              "is_correct": false
          },
          {
              "choice_text": "Move all in for 150000",
              "explanation": "This is the correct choice. Moving all in with KQo from the CO is a good option at this stage of the tournament. With a short stack, your main goal is to pick up the blinds and antes or get called by a worse hand. This play puts pressure on your opponents and simplifies your decision-making.",
              "is_correct": true
          }
      ]
  },
  {
      "scenario_id": 56,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Early",
      "blinds": "50/100",
      "ante": "no ante",
      "effective_stacks": 20000,
      "effective_stacks_bb": 200,
      "your_position": "BTN",
      "your_hand": "8c7c",
      "opponent_information": "The player in the BB is a loose-passive (fish) player.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "9c",
                  "6d",
                  "2h"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 350
                  },
                  {
                      "position": "BTN",
                      "action": "200",
                      "pot_size": 350
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 550
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "9c",
                  "6d",
                  "2h",
                  "5h"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 950
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (open-ended straight draw)",
          "Position (in position)",
          "Opponent tendencies (fish tend to be passive and call with a wide range, including draws)",
          "Board texture (turn completes a straight and brings a backdoor flush draw)",
          "Stack sizes (200 big blinds effective)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking behind with a strong draw is an option, especially when deep-stacked. It allows you to control the pot size and potentially see a cheap river card. However, betting can also be a good play to build the pot and potentially win it immediately.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 475",
              "explanation": "This is the correct choice. Betting around half the pot is a good size in this situation. You have a strong draw and are in position against a loose-passive player. This bet puts pressure on your opponent and builds the pot for a potential river bet. Betting here can also induce worse hands to call, and with your draw, you have multiple ways to improve and win the pot.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 950",
              "explanation": "While betting is correct, a pot-sized bet is likely too large in this situation. You have a strong draw, but you don't want to force your opponent to fold hands that you can potentially improve against. A smaller bet is more likely to get called and keep your opponent in the pot.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 1900",
              "explanation": "While betting is correct, an overbet of this size is far too large. It risks too much of your stack with a draw and is unlikely to be called by anything other than a very strong hand that has you beat. A smaller bet is much more appropriate.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 57,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "400/800",
      "ante": "0.1",
      "effective_stacks": 32000,
      "effective_stacks_bb": 40,
      "your_position": "BTN",
      "your_hand": "8h8c",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular.",
      "current_state": "postflop",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Ac",
                  "Th",
                  "5c"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 3900
                  },
                  {
                      "position": "BTN",
                      "action": "2500",
                      "pot_size": 3900
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 6400
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "Ac",
                  "Th",
                  "5c",
                  "2d"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 8900
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (underpair)",
          "Position (in position)",
          "Opponent tendencies (TAG players are capable of check-calling with a wide range on the flop)",
          "Board texture (turn is a blank, unlikely to have changed hand strengths significantly)",
          "Stack sizes (40 big blinds effective)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "This is the correct choice. With an underpair on a relatively dry board, checking is the best option. You are unlikely to get value from worse hands and your hand is vulnerable to overcards on the river. Checking allows you to control the pot size and see a free river card.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 2225",
              "explanation": "Betting with an underpair on the turn is not a good play. You are unlikely to get called by worse hands and could be facing a raise from stronger holdings. A small bet doesn't achieve much and simply bloats the pot unnecessarily.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 4450",
              "explanation": "Betting this size with an underpair is too aggressive. You are unlikely to get value from worse hands and risk getting raised off your hand by stronger holdings. Checking is a more prudent approach.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 8900",
              "explanation": "Betting this large with an underpair is a significant mistake. It risks too much of your stack with a weak hand and is unlikely to get called by anything other than better hands. Checking is the best option here.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 58,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Late",
      "blinds": "1000/2000",
      "ante": "0.25",
      "effective_stacks": 60000,
      "effective_stacks_bb": 30,
      "your_position": "BTN",
      "your_hand": "KdQd",
      "opponent_information": "The player in the BB is a loose-aggressive (LAG) player.",
      "current_state": "turn",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Ks",
                  "Ts",
                  "5c"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 7500
                  },
                  {
                      "position": "BTN",
                      "action": "3750",
                      "pot_size": 7500
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 11250
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "Ks",
                  "Ts",
                  "5c",
                  "2d"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 18750
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair, good kicker)",
          "Position (in position)",
          "Opponent tendencies (LAG players can be unpredictable and have a wide range)",
          "Board texture (turn is a blank, unlikely to have changed hand strengths significantly)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking behind with top pair, good kicker is too passive. You are likely ahead and should be looking to extract value from worse hands. Checking also allows your opponent to see a free river card, potentially improving their hand.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 4687",
              "explanation": "While betting is correct, this bet size is too small. It doesn't put enough pressure on your opponent and doesn't extract enough value from your strong hand. A larger bet is more appropriate.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 9375",
              "explanation": "This is the correct choice. Betting around half the pot is a good size in this situation. It puts pressure on your opponent and builds the pot for a potential river bet. Against a LAG player, this bet is likely to get called by a wide range of hands, including worse Kings, top pair worse kicker, or draws.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 18750",
              "explanation": "While betting is correct, a pot-sized bet is too large in this situation. It's likely to scare away your opponent, especially a LAG, and may only get called by hands that beat you. A smaller bet is more likely to get called and extract value.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 59,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Final Table",
      "blinds": "2000/4000",
      "ante": "0.25",
      "effective_stacks": 100000,
      "effective_stacks_bb": 25,
      "your_position": "BB",
      "your_hand": "Ad8d",
      "opponent_information": "The player on the BTN is a loose-aggressive (LAG) player who has been very active.",
      "current_state": "river",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "As",
                  "Jc",
                  "7s"
              ],
              "actions":
              [
                  {
                      "position": "SB",
                      "action": "Call",
                      "pot_size": 27000
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 39000
                  },
                  {
                      "position": "BTN",
                      "action": "12000",
                      "pot_size": 15000
                  },
                  {
                      "position": "SB",
                      "action": "Fold",
                      "pot_size": 51000
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "As",
                  "Jc",
                  "7s",
                  "3d"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 51000
                  },
                  {
                      "position": "BTN",
                      "action": "25500",
                      "pot_size": 51000
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 76500
                  }
              ]
          },
          "river":
          {
              "cards":
              [
                  "As",
                  "Jc",
                  "7s",
                  "3d",
                  "8h"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 127500
                  },
                  {
                      "position": "BTN",
                      "action": "63750",
                      "pot_size": 127500
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (two pair, aces and eights)",
          "Position (out of position)",
          "Opponent tendencies (LAGs can have a wide range of hands when they bet the river, including bluffs)",
          "Board texture (river counterfeits some potential two-pair hands but also completes a backdoor straight)",
          "Stack sizes (25 big blinds effective)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding two pair on the river is generally too weak, especially against an aggressive opponent. While the board is somewhat coordinated, your hand is still strong and can beat many of your opponent's value bets and bluffs.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is a reasonable option. You have a strong hand that beats many of your opponent's bluffs and some of their value bets. However, given your opponent's aggressiveness and the board texture, raising might be a better option to extract maximum value.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 150000",
              "explanation": "While raising can be considered, it's important to be mindful of your opponent's potential range. Since you have two pair and there aren't many better hands your opponent could have, a smaller raise might be more appropriate to induce calls from worse hands.",
              "is_correct": false
          },
          {
              "choice_text": "Move all in for 186250",
              "explanation": "Moving all in with two pair is a strong play, especially against an aggressive opponent. However, be aware of the possibility of your opponent having a set or a better two pair. With effective stacks being 25 big blinds, shoving is generally better than a smaller raise because it maximizes value when you are called and puts the maximum pressure on your opponent to make a tough decision for their tournament life. You unblock your opponent's potential bluffs, making you a favorite against their range.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 60,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Early",
      "blinds": "50/100",
      "ante": "no ante",
      "effective_stacks": 15000,
      "effective_stacks_bb": 150,
      "your_position": "MP",
      "your_hand": "Ts9s",
      "opponent_information": "Early in the tournament, reads are limited. Opponents are assumed to be a mix of tight and loose players.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (middle position, several players left to act)",
          "Hand strength (T9s is a speculative hand that can flop well)",
          "Tournament stage (early stage, stacks are deep)",
          "Stack sizes (150 big blinds allows for a wide range of plays)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding T9s from middle position is a bit too tight, especially in the early stages of a tournament with deep stacks. This hand has good potential to make straights and flushes and can be played profitably.",
              "is_correct": false
          },
          {
              "choice_text": "Limp (call the minimum bet)",
              "explanation": "Limping with T9s from middle position can be considered. It allows you to see a cheap flop and potentially hit a strong hand. However, it's important to be aware of the risks of limping, such as allowing multiple opponents to enter the pot cheaply and potentially facing difficult postflop situations out of position. With 150BB effective, it is a little stronger of a hand and can be considered a raise. Limping is not a bad play, however.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 300",
              "explanation": "This is the correct choice according to the solver, but limping can be equally acceptable. Raising to 3 big blinds with T9s from middle position is a standard play. It allows you to build the pot with a hand that can flop well and puts pressure on opponents in later positions. Also, T9s is not a strong enough hand to call if it gets 3-bet.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 400",
              "explanation": "While raising is a viable option, a raise of this size is slightly larger than necessary from middle position. A standard raise of 2.5-3 big blinds is generally sufficient.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 61,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "400/800",
      "ante": "0.1",
      "effective_stacks": 32000,
      "effective_stacks_bb": 40,
      "your_position": "HJ",
      "your_hand": "AdQd",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (hijack is a late position)",
          "Hand strength (AQo is a strong hand, especially in late position)",
          "Opponent tendencies (TAG players tend to defend their blinds with a reasonable range)",
          "Stack sizes (40 big blinds allows for a wide range of plays)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding AQo from the hijack is too tight, especially against a TAG player in the big blind. This is a strong hand that should be played aggressively.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is not an option preflop unless you are in the small blind facing only a limp.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 2000",
              "explanation": "This is the correct choice. Raising to 2.5 big blinds with AQo from the hijack is a standard and profitable play. It allows you to build the pot with a strong hand and puts pressure on the blinds.",
              "is_correct": true
          },
          {
              "choice_text": "Raise to 3200",
              "explanation": "While raising is correct, a raise of this size is too large. A standard raise of 2-2.5 big blinds is sufficient to put pressure on the blinds.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 62,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "300/600",
      "ante": "0.1",
      "effective_stacks": 30000,
      "effective_stacks_bb": 50,
      "your_position": "UTG",
      "your_hand": "9s8s",
      "opponent_information": "Early position, 9-max. Standard table.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (early position requires a tight range)",
          "Hand strength (9s8s is a speculative hand that can flop well, but should be played cautiously from early position)",
          "Tournament stage (Middle stage, stacks are still relatively deep but antes make stealing more valuable)",
          "Stack sizes (50 big blinds allows for some flexibility but caution is needed in early position)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "This is the correct choice. 9s8s, while having some potential, is generally too weak to open from early position in a 9-max game. You have many players left to act behind you who could have stronger hands, and you'll often be forced to play out of position postflop. In the middle stages, with antes in play, preserving your stack is crucial. It's better to wait for a stronger hand in early position.",
              "is_correct": true
          },
          {
              "choice_text": "Limp (call the minimum bet)",
              "explanation": "Limping with any hand, let alone a speculative one like 9s8s, is generally not recommended from early position. It doesn't build the pot and can lead to difficult situations postflop if multiple players enter the pot.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 1500",
              "explanation": "Raising with 9s8s from early position is too loose. This hand is not strong enough to withstand pressure from players acting after you, and you'll often be forced to play out of position with a marginal hand.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 1800",
              "explanation": "Raising with 9s8s from early position is not recommended, even with a smaller raise size. It's better to play a tighter range from early position and avoid playing speculative hands out of position.",
              "is_correct": false
          }
      ]
  },
  {
      "scenario_id": 63,
      "game_type": "NLHE 9-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "400/800",
      "ante": "0.1",
      "effective_stacks": 32000,
      "effective_stacks_bb": 40,
      "your_position": "HJ",
      "your_hand": "KsQs",
      "opponent_information": "The player in the BB is a loose-passive (fish) player.",
      "current_state": "preflop",
      "community_cards":
      {},
      "considerations":
      [
          "Position (Hijack is considered late position in a 9-handed game)",
          "Hand strength (KQs is a strong hand, especially when suited)",
          "Opponent tendencies (Loose-passive players are more likely to call with a wide range of hands, giving you a chance to extract value)",
          "Stack sizes (40 big blinds effective allows for postflop play)"
      ],
      "choices":
      [
          {
              "choice_text": "Fold",
              "explanation": "Folding KQs in the Hijack is too tight. It's a strong hand that can win a big pot. Especially against a loose-passive player, who is likely to call with a wide range of hands, you have good opportunities to extract value.",
              "is_correct": false
          },
          {
              "choice_text": "Call",
              "explanation": "Calling is not an option since you are not in the small blind. Limping in this spot is also not recommended.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 1800",
              "explanation": "This is a reasonable sizing, but not the most profitable one. It is always better to make it more expensive for your opponents to see a flop when you have a strong hand like KQs. That is why we would favor the 2000 raise sizing slightly more.",
              "is_correct": false
          },
          {
              "choice_text": "Raise to 2000",
              "explanation": "This is the correct choice. Raising to 2.5 big blinds with KQs from the Hijack is a standard play. It allows you to build the pot with a strong hand, and given the loose-passive nature of the Big Blind, you're likely to get action. This bet size also helps to define your opponents' ranges and puts pressure on them.",
              "is_correct": true
          }
      ]
  },
  {
      "scenario_id": 64,
      "game_type": "NLHE 6-Max MTT",
      "tournament_stage": "Middle",
      "blinds": "300/600",
      "ante": "0.1",
      "effective_stacks": 24000,
      "effective_stacks_bb": 40,
      "your_position": "BTN",
      "your_hand": "QdJd",
      "opponent_information": "The player in the BB is a tight-aggressive (TAG) regular.",
      "current_state": "turn",
      "community_cards":
      {
          "flop":
          {
              "cards":
              [
                  "Jh",
                  "8c",
                  "5s"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 2700
                  },
                  {
                      "position": "BTN",
                      "action": "1800",
                      "pot_size": 2700
                  },
                  {
                      "position": "BB",
                      "action": "Call",
                      "pot_size": 4500
                  }
              ]
          },
          "turn":
          {
              "cards":
              [
                  "Jh",
                  "8c",
                  "5s",
                  "2d"
              ],
              "actions":
              [
                  {
                      "position": "BB",
                      "action": "Check",
                      "pot_size": 8100
                  }
              ]
          }
      },
      "considerations":
      [
          "Hand strength (top pair, decent kicker)",
          "Position (in position)",
          "Opponent tendencies (TAG players are capable of check-calling with a wide range on the flop)",
          "Board texture (turn is a blank, unlikely to have changed hand strengths significantly)",
          "Stack sizes (40 big blinds effective)"
      ],
      "choices":
      [
          {
              "choice_text": "Check",
              "explanation": "Checking behind is a reasonable option. While you have top pair, your kicker is not the best, and the board is somewhat dry. Checking allows you to control the pot size and see a free river card. However, betting can also be a good play to extract value from worse hands and protect your hand from potential draws.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 2025",
              "explanation": "While betting is correct, this bet size is on the smaller side. With top pair and a decent kicker on a fairly dry board, you can bet larger to extract more value from your opponent's likely range.",
              "is_correct": false
          },
          {
              "choice_text": "Bet 4050",
              "explanation": "This is the correct choice. Betting around half the pot is a good size in this situation. It allows you to extract value from worse hands like weaker Jacks, straight draws, and potentially flush draws. Additionally, it puts pressure on your opponent and builds the pot for a potential river bet.",
              "is_correct": true
          },
          {
              "choice_text": "Bet 8100",
              "explanation": "Betting pot size is generally too large in this situation. While you have a strong hand, you don't want to scare away your opponent and only get called by hands that beat you. A smaller bet is more likely to get called by a wider range and extract value.",
              "is_correct": false
          }
      ]
  }
];
// const currentIndex: number = 15;

const PokerQuiz: React.FC = () => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hintIndex, setHintIndex] = useState(-1);
  const [wrongAttempts, setWrongAttempts] = useState<string[]>([]);
  const [hoveredPosition, setHoveredPosition] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(1);

  // Calculate positions in an oval
  const getPositionCoordinates = (
    index: number, 
    total: number,
    tableWidth: number = 600,
    tableHeight: number = 400
  ): { x: number; y: number } => {
    // Start from the bottom center (180 degrees) and go counterclockwise
    const angleOffset = Math.PI;
    const angle = angleOffset + (2 * Math.PI * index) / total;
    
    // Calculate radius based on the oval shape
    const a = (tableWidth * 0.45) / tableWidth * 100; // horizontal radius in %
    const b = (tableHeight * 0.45) / tableHeight * 100; // vertical radius in %
    
    // Parametric equation of an ellipse
    const x = 50 + a * Math.cos(angle);
    const y = 50 + b * Math.sin(angle);
    
    return { x, y };
  };

  // Determine active positions from the game state
  const getPositionsState = useMemo((): Map<string, PositionState> => {
    const positionStates = new Map<string, PositionState>();
    const allActions = [
      ...scenarios[currentIndex].community_cards.flop?.actions || [],
      ...(scenarios[currentIndex].community_cards.turn?.actions || []),
      ...(scenarios[currentIndex].community_cards.river?.actions || [])
    ];

    // Initialize with default states
    ['BTN', 'SB', 'BB', 'UTG', 'UTG1', 'UTG2', 'MP', 'MP1', 'HJ', 'CO'].forEach(pos => {
      positionStates.set(pos, {
        position: pos,
        lastAction: '',
        isActive: false
      });
    });

    // Update states based on actions
    allActions.forEach(action => {
      const currentState = positionStates.get(action.position);
      if (currentState) {
        positionStates.set(action.position, {
          ...currentState,
          lastAction: action.action,
          isActive: action.action.toLowerCase() !== 'fold'
        });
      }
    });

    return positionStates;
  }, []);

  const positions: Position[] = useMemo(() => {
    const positionOrder = ['BTN', 'SB', 'BB', 'UTG', 'UTG1', 'UTG2', 'MP', 'MP1', 'HJ', 'CO'];
    
    return positionOrder.map((label, index) => {
      const coords = getPositionCoordinates(index, positionOrder.length);
      const state = getPositionsState.get(label);
      
      return {
        x: coords.x,
        y: coords.y,
        label,
        isActive: state?.isActive ?? false
      };
    });
  }, [getPositionsState]);

  const renderCard = (card: string) => {
    const suit = card.slice(-1);
    const rank = card.slice(0, -1);
    const suitSymbol = {
      's': '♠',
      'h': '♥',
      'd': '♦',
      'c': '♣'
    }[suit.toLowerCase()];
    
    return (
      <Paper 
        shadow="sm" 
        p="xs" 
        withBorder 
        className={`${styles.card} ${['h', 'd'].includes(suit.toLowerCase()) ? styles.redCard : styles.blackCard}`}
      >
        <div>
          <div className={styles.cardRank}>{rank}</div>
          <div className={styles.cardSuit}>{suitSymbol}</div>
        </div>
      </Paper>
    );
  };

  const renderPokerTable = () => {
    const isUserPosition = (label: string) => label === scenarios[currentIndex].your_position;
    
    return (
      <div className={styles.pokerTable}>
        {/* Dealer position */}
        <div className={styles.dealerButton}>
          D
        </div>

        {positions.map((pos, idx) => {
          const state = getPositionsState.get(pos.label);
          const opponent = scenarios[currentIndex].opponents?.find(opp => opp.position === pos.label);
          
          return (
            <div 
              key={idx} 
              className={styles.positionMarker}
              style={{ 
                left: `${pos.x}%`, 
                top: `${pos.y}%`
              }}
              onMouseEnter={() => setHoveredPosition(pos.label)}
              onMouseLeave={() => setHoveredPosition(null)}
            >
              {/* Position marker */}
              <div
                className={`${styles.positionButton} ${
                  isUserPosition(pos.label) ? styles.userPosition :
                  pos.isActive ? styles.activePosition :
                  styles.inactivePosition
                } ${opponent ? styles.clickable : styles.default}`}
              >
                {pos.label}
              </div>
              
              {/* Opponent info tooltip */}
              {opponent && !isUserPosition(pos.label) && hoveredPosition === pos.label && (
                <div className={styles.positionTooltip}>
                  {opponent.style && <div>Style: {opponent.style}</div>}
                  {opponent.vpip !== undefined && <div>VPIP: {opponent.vpip}%</div>}
                  {opponent.pfr !== undefined && <div>PFR: {opponent.pfr}%</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderActionTimeline = () => {
    const actions = [
      ...scenarios[currentIndex].community_cards.flop?.actions || [],
      ...(scenarios[currentIndex].community_cards.turn?.actions || []),
      ...(scenarios[currentIndex].community_cards.river?.actions || [])
    ];

    return (
      <Timeline active={actions.length - 1} bulletSize={24} lineWidth={2}>
        {actions.map((action, index) => (
          <Timeline.Item
            key={index}
            bullet={
              <ThemeIcon
                size={24}
                radius="xl"
                color={action.action.toLowerCase() === 'fold' ? 'gray' : 'blue'}
              >
                {action.action.toLowerCase() === 'fold' ? 
                  <IconCards size={12} /> : 
                  <IconCoin size={12} />
                }
              </ThemeIcon>
            }
            title={`${action.position}`}
          >
            <Text color="dimmed" size="sm">
              {action.action} {action.pot_size && `(Pot: ${action.pot_size})`}
            </Text>
          </Timeline.Item>
        ))}
      </Timeline>
    );
  };

  const handleChoice = (choice: string) => {
    const choiceObj = scenarios[currentIndex].choices.find(c => c.choice_text === choice);
    setSelectedChoice(choice);
    setShowFeedback(true);
    if (!choiceObj?.is_correct && !wrongAttempts.includes(choice)) {
      setWrongAttempts([...wrongAttempts, choice]);
    }
  };

  const handleHint = () => {
    if (hintIndex < scenarios[currentIndex].considerations.length - 1) {
      setHintIndex(hintIndex + 1);
    }
  };

  const resetChoice = () => {
    setSelectedChoice(null);
    setShowFeedback(false);
  };

  const getChoiceFeedback = (choice: Choice) => {
    if (wrongAttempts.includes(choice.choice_text) || choice.choice_text === selectedChoice) {
      return choice.is_correct ? 
        <Text color="green" mt="xs">{choice.explanation}</Text> :
        <Text color="red" mt="xs">{choice.explanation}</Text>;
    }
    return null;
  };

  return (
    <Container size="xl">
      <Head>
        <title>Poker Decision Quiz</title>
      </Head>

      <Stack spacing="xl">
        <Title order={1} align="center" mt="xl">Poker Decision Quiz</Title>

        <Grid>
          <Grid.Col span={4}>
            <Paper p="md" radius="md" withBorder>
              <Stack>
                <Title order={2} size="h4">Game Information</Title>
                <Text><b>Type:</b> {scenarios[currentIndex].game_type}</Text>
                <Text><b>Stage:</b> {scenarios[currentIndex].tournament_stage}</Text>
                <Text><b>Blinds:</b> {scenarios[currentIndex].blinds}</Text>
                <Text><b>Effective Stacks:</b> {scenarios[currentIndex].effective_stacks} ({scenarios[currentIndex].effective_stacks_bb}BB)</Text>
                <Text><b>Your Position:</b> {scenarios[currentIndex].your_position}</Text>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={8}>
            <Paper p="md" radius="md" withBorder>
              <Stack>
                <Title order={2} size="h4">Table View</Title>
                {renderPokerTable()}
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={12}>
            <Paper p="md" radius="md" withBorder>
              <Grid>
                <Grid.Col span={4}>
                  <Stack>
                    <Title order={2} size="h4">Your Hand</Title>
                    <Group>
                      {scenarios[currentIndex].your_hand.match(/.{2}/g)?.map((card, i) => (
                        <div key={i}>{renderCard(card)}</div>
                      ))}
                    </Group>
                  </Stack>
                </Grid.Col>

                <Grid.Col span={8}>
                  <Stack>
                    <Title order={2} size="h4">Community Cards</Title>
                    <Group align="flex-start" spacing="xl">
                      <Stack spacing="xs">
                        <Text weight={500}>Flop</Text>
                        <Group>
                          {scenarios[currentIndex].community_cards.turn && scenarios[currentIndex].community_cards.flop.cards.map((card, i) => (
                            <div key={i}>{renderCard(card)}</div>
                          ))}
                        </Group>
                      </Stack>

                      {scenarios[currentIndex].community_cards.turn && (
                        <Stack spacing="xs">
                          <Text weight={500}>Turn</Text>
                          <div>{renderCard(scenarios[currentIndex].community_cards.turn.cards[3])}</div>
                        </Stack>
                      )}

                      {scenarios[currentIndex].community_cards.river && (
                        <Stack spacing="xs">
                          <Text weight={500}>River</Text>
                          <div>{renderCard(scenarios[currentIndex].community_cards.river.cards[4])}</div>
                        </Stack>
                      )}
                    </Group>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Paper>
          </Grid.Col>

          <Grid.Col span={12}>
            <Paper p="md" radius="md" withBorder>
              <Stack>
                <Title order={2} size="h4">Action History</Title>
                {renderActionTimeline()}
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={12}>
            <Paper p="md" radius="md" withBorder>
              <Stack>
                <Group position="apart">
                  <Title order={2} size="h4">What would you do?</Title>
                  <Button 
                    variant="subtle" 
                    leftIcon={<IconBulb size={16} />}
                    onClick={handleHint}
                    disabled={hintIndex >= scenarios[currentIndex].considerations.length - 1}
                  >
                    Need a hint?
                  </Button>
                </Group>

                {hintIndex >= 0 && (
                  <Card withBorder shadow="sm" radius="md" p="md" mb="md">
                    <Stack spacing="xs">
                      {scenarios[currentIndex].considerations.slice(0, hintIndex + 1).map((hint, idx) => (
                        <Transition
                          key={idx}
                          mounted={true}
                          transition="slide-down"
                          duration={400}
                          timingFunction="ease"
                        >
                          {(styles) => (
                            <Text style={styles}>
                              {idx + 1}. {hint}
                            </Text>
                          )}
                        </Transition>
                      ))}
                    </Stack>
                  </Card>
                )}

                <Grid>
                  {scenarios[currentIndex].choices.map((choice: Choice) => (
                    <Grid.Col span={6} key={choice.choice_text}>
                      <Card 
                        withBorder 
                        shadow="sm" 
                        radius="md" 
                        style={{ 
                          opacity: wrongAttempts.includes(choice.choice_text) ? 0.5 : 1,
                          height: '100%'
                        }}
                      >
                        <Stack>
                          <Button
                            size="lg"
                            fullWidth
                            variant={selectedChoice === choice.choice_text ? 
                              (choice.is_correct ? 'filled' : 'light') : 
                              'outline'
                            }
                            color={selectedChoice === choice.choice_text ?
                              (choice.is_correct ? 'green' : 'red') :
                              'blue'
                            }
                            onClick={() => handleChoice(choice.choice_text)}
                            disabled={wrongAttempts.includes(choice.choice_text) && !choice.is_correct}
                          >
                            {choice.choice_text}
                          </Button>
                          {showFeedback && getChoiceFeedback(choice)}
                        </Stack>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>

                {showFeedback && !scenarios[currentIndex].choices.find(c => c.choice_text === selectedChoice)?.is_correct && (
                  <Group position="right">
                    <Button
                      onClick={resetChoice}
                      variant="light"
                      color="blue"
                    >
                      Try Again
                    </Button>
                  </Group>
                )}

                {showFeedback && scenarios[currentIndex].choices.find(c => c.choice_text === selectedChoice)?.is_correct && (
                  <Group position="right">
                    <Button
                      onClick={() => {
                        setCurrentIndex(currentIndex + 1);
                        setSelectedChoice(null);
                        setShowFeedback(false);
                        setHintIndex(-1);
                        setWrongAttempts([]);
                        setHoveredPosition(null);
                      }
                      }
                      variant="light"
                    >
                      Next Scenario
                    </Button>
                  </Group>
                )}
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};

export default PokerQuiz;
