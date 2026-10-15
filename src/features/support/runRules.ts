import { describeFeature, type StepTest, type loadFeature } from '@amiceli/vitest-cucumber';

type Feature = Awaited<ReturnType<typeof loadFeature>>;
type Scenario = Feature['scenarii'][number];
type Handler = (...args: never[]) => unknown;
// The keywords a feature file can use. The parser also has a generic `Step` type, which only defineSteps produces.
type Keyword = Exclude<keyof StepTest, 'context'>;

/**
 * Step definitions written once, as patterns, the way Cucumber does it. `{string}` matches a quoted value
 * and `{int}` a whole number. A new scenario that reuses existing steps needs only the .feature file.
 */
export class Steps {
  private readonly definitions: { pattern: RegExp; ints: boolean[]; fn: Handler }[] = [];

  define(expression: string, fn: Handler) {
    const ints: boolean[] = [];
    const source = expression.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{string\}|\{int\}/g, (token) => {
      ints.push(token === '{int}');
      return token === '{int}' ? '(-?\\d+)' : '"([^"]*)"';
    });
    this.definitions.push({ pattern: new RegExp(`^${source}$`), ints, fn });
    return this;
  }

  run(text: string) {
    for (const { pattern, ints, fn } of this.definitions) {
      const match = pattern.exec(text);
      if (!match) continue;
      const args = match.slice(1).map((value, i) => (ints[i] ? Number(value) : value));
      return (fn as (...a: unknown[]) => unknown)(...args);
    }
    throw new Error(`No step definition matches: "${text}"`);
  }
}

interface Hooks {
  beforeEach?: () => void;
  afterEach?: () => void;
}

/** Fills in an outline's <placeholders> from one row of its Examples table. */
const fill = (text: string, example: Record<string, string>) =>
  text.replace(/<([^>]+)>/g, (whole, key: string) => example[key] ?? whole);

function bind(scenario: Scenario, test: StepTest, steps: Steps, example: Record<string, string> = {}) {
  for (const step of scenario.steps) {
    test[step.type as Keyword](step.details, async () => {
      await steps.run(fill(step.details, example));
    });
  }
}

/**
 * Runs every rule and scenario in a feature file against the given steps.
 * Scenarios tagged @known-bug are reported as skipped: they state agreed behaviour the code does not meet yet.
 */
export function runRules(feature: Feature, steps: Steps, hooks: Hooks = {}) {
  describeFeature(
    feature,
    ({ Rule, Scenario, ScenarioOutline, BeforeEachScenario, AfterEachScenario }) => {
      if (hooks.beforeEach) BeforeEachScenario(hooks.beforeEach);
      if (hooks.afterEach) AfterEachScenario(hooks.afterEach);

      for (const scenario of feature.scenarii) {
        if ('examples' in scenario) {
          ScenarioOutline(scenario.description, (test, example) => bind(scenario, test, steps, example));
        } else {
          Scenario(scenario.description, (test) => bind(scenario, test, steps));
        }
      }

      for (const rule of feature.rules) {
        Rule(rule.name, ({ RuleScenario, RuleScenarioOutline }) => {
          for (const scenario of rule.scenarii) {
            if ('examples' in scenario) {
              RuleScenarioOutline(scenario.description, (test, example) =>
                bind(scenario, test, steps, example),
              );
            } else {
              RuleScenario(scenario.description, (test) => bind(scenario, test, steps));
            }
          }
        });
      }
    },
    { excludeTags: ['ignore', 'known-bug'] },
  );
}
