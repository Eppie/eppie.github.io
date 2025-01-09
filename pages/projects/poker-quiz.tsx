import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { Container, Title, Paper, Text, Button, Stack, Group, Grid, Timeline, ThemeIcon, Card, Transition } from '@mantine/core';
import { IconCards, IconCoin, IconBulb } from '@tabler/icons-react';
import styles from '../../styles/PokerQuiz.module.css';
import scenarios from './poker_scenario.json';
import { useAppState } from '../../context/AppContext';

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
  opponents: Opponent[];
  current_state: string;
  community_cards: any;
  choices: Choice[];
  considerations: string[];
}

// const scenarios: ScenarioData[] = require("./poker_scenario.json");



const PokerQuiz: React.FC = () => {
  const { theme } = useAppState();
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
          // const opponent = scenarios[currentIndex].opponents?.find(opp => opp.position === pos.label);
          
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
                } `}
              >
                {pos.label}
              </div>
              

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
    <Container size="lg" className={`${styles.container} ${theme === 'dark' ? styles.dark : ''}`}>
      <Head>
        <title>Poker Decision Quiz</title>
      </Head>

      <Stack gap="xl">
        {/* <Title order={1} align="center" mt="xl">Poker Decision Quiz</Title> */}
        <Title order={1} mt="xl">Poker Decision Quiz</Title>
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
                    <Group align="flex-start" gap="xl">
                      <Stack gap="xs">
                        {/* <Text weight={500}>Flop</Text> */}
                        <Text>Flop</Text>
                        <Group>
                          {scenarios[currentIndex].community_cards.turn && scenarios[currentIndex].community_cards.flop.cards.map((card: string, i: React.Key | null | undefined) => (
                            <div key={i}>{renderCard(card)}</div>
                          ))}
                        </Group>
                      </Stack>

                      {scenarios[currentIndex].community_cards.turn && (
                        <Stack gap="xs">
                          {/* <Text weight={500}>Turn</Text> */}
                          <Text>Turn</Text>
                          <div>{renderCard(scenarios[currentIndex].community_cards.turn.cards[3])}</div>
                        </Stack>
                      )}

                      {scenarios[currentIndex].community_cards.river && (
                        <Stack gap="xs">
                          {/* <Text weight={500}>River</Text> */}
                          <Text>River</Text>
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
                {/* <Group position="apart"> */}
                <Group>
                  <Title order={2} size="h4">What would you do?</Title>
                  <Button 
                    variant="subtle" 
                    // leftIcon={<IconBulb size={16} />}
                    onClick={handleHint}
                    disabled={hintIndex >= scenarios[currentIndex].considerations.length - 1}
                  >
                    Need a hint?
                  </Button>
                </Group>

                {hintIndex >= 0 && (
                  <Card withBorder shadow="sm" radius="md" p="md" mb="md">
                    <Stack gap="xs">
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
                  // <Group position="right">
                  <Group>
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
                  // <Group position="right">
                  <Group>
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
