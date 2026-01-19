import type { ReactNode } from "react"
import clsx from "clsx"
import Link from "@docusaurus/Link"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import useBaseUrl from "@docusaurus/useBaseUrl"
import Layout from "@theme/Layout"
import Heading from "@theme/Heading"
import CodeBlock from "@theme/CodeBlock"
import {
  Brain,
  ShieldCheck,
  Package,
  Globe,
  Sparkles,
  Rocket,
  Bot,
  RefreshCw,
  GraduationCap,
  Zap,
  Heart
} from "lucide-react"

import styles from "./index.module.css"

/* ==========================================================================
   Hero Section
   ========================================================================== */

function HeroSection() {
  const pythonLogo = useBaseUrl("/img/python.svg")
  const tsLogo = useBaseUrl("/img/typescript.svg")

  return (
    <header className={styles.hero}>
      <div className={styles.heroBackground} />
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <div className={styles.heroLogos}>
            <img src={pythonLogo} alt="Python" className={styles.heroLogo} />
            <span className={styles.heroLogoArrow}>→</span>
            <img src={tsLogo} alt="TypeScript" className={styles.heroLogo} />
          </div>
          <Heading as="h1" className={styles.heroTitle}>
            Write <span className={styles.gradientText}>Python</span>
            <br />
            Ship <span className={styles.gradientText}>TypeScript</span>
          </Heading>
          <p className={styles.heroSubtitle}>
            The AST-based transpiler that converts Python to clean, idiomatic TypeScript.
            <br />
            Full type preservation. Python standard library included.
          </p>
          <div className={styles.heroButtons}>
            <Link className={clsx("button button--lg", styles.primaryButton)} to="/docs">
              Get Started
            </Link>
            <Link
              className={clsx("button button--lg", styles.secondaryButton)}
              href="https://github.com/sebastian-software/python2ts"
            >
              <GitHubIcon /> GitHub
            </Link>
            <Link
              className={clsx("button button--lg", styles.secondaryButton)}
              href="https://www.npmjs.com/package/python2ts"
            >
              <NpmIcon /> npm
            </Link>
          </div>
          <div className={styles.installCommand}>
            <code>npm install python2ts</code>
            <span className={styles.orText}>or</span>
            <code>npm install pythonlib</code>
          </div>
        </div>
        <div className={styles.heroCode}>
          <CodeTransformDemo />
        </div>
      </div>
    </header>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ marginRight: 8 }}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function NpmIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ marginRight: 8 }}>
      <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
    </svg>
  )
}

function CodeTransformDemo() {
  const pythonCode = `def fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence."""
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result`

  const tsCode = `import { range } from "pythonlib"

/**
 * Generate Fibonacci sequence.
 */
function fibonacci(n: number): number[] {
  let [a, b] = [0, 1]
  let result: number[] = []
  for (const _ of range(n)) {
    result.push(a)
    ;[a, b] = [b, a + b]
  }
  return result
}`

  return (
    <div className={styles.codeTransform}>
      <div className={styles.codePanel}>
        <div className={styles.codePanelHeader}>
          <PythonIcon />
          <span>Python</span>
        </div>
        <CodeBlock language="python" className={styles.codeBlock}>
          {pythonCode}
        </CodeBlock>
      </div>
      <div className={styles.transformArrow}>
        <ArrowIcon />
      </div>
      <div className={styles.codePanel}>
        <div className={styles.codePanelHeader}>
          <TypeScriptIcon />
          <span>TypeScript</span>
        </div>
        <CodeBlock language="typescript" className={styles.codeBlock}>
          {tsCode}
        </CodeBlock>
      </div>
    </div>
  )
}

function ArrowIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

function PythonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z" />
    </svg>
  )
}

function TypeScriptIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" />
    </svg>
  )
}

/* ==========================================================================
   Why Section
   ========================================================================== */

const whyFeatures = [
  {
    icon: Brain,
    title: "AI-First Workflow",
    description:
      "Python dominates AI/ML. TypeScript powers modern web apps. Bridge the gap—prototype in Python, deploy anywhere JavaScript runs."
  },
  {
    icon: ShieldCheck,
    title: "Full Type Safety",
    description:
      "Python type hints become TypeScript types automatically. Generics, Protocols, TypedDicts, Callable—all preserved."
  },
  {
    icon: Package,
    title: "Python Standard Library",
    description:
      "itertools, functools, collections, datetime, re, math, random—use familiar Python APIs in your TypeScript code."
  },
  {
    icon: Globe,
    title: "Run Everywhere",
    description:
      "Node.js, Deno, Bun, browsers, Cloudflare Workers, AWS Lambda—anywhere JavaScript runs, your code runs too."
  },
  {
    icon: Sparkles,
    title: "Clean Output",
    description:
      "Generates idiomatic TypeScript, not a mess of runtime hacks. Code that's readable, maintainable, and fast."
  },
  {
    icon: Rocket,
    title: "Zero Config",
    description:
      "Works out of the box. npx python2ts input.py and you're done. No complex setup required."
  }
]

function WhySection() {
  return (
    <section className={styles.whySection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Why python2ts?</Heading>
          <p>
            The missing link between Python's powerful ecosystem and the JavaScript runtime
            universe.
          </p>
        </div>
        <div className={styles.featureGrid}>
          {whyFeatures.map((feature, idx) => {
            const IconComponent = feature.icon
            return (
              <div key={idx} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <IconComponent size={32} strokeWidth={1.5} />
                </div>
                <Heading as="h3">{feature.title}</Heading>
                <p>{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ==========================================================================
   Syntax Transformation Section
   ========================================================================== */

const syntaxExamples = [
  {
    title: "Functions & Types",
    python: `def greet(name: str, times: int = 1) -> str:
    return f"Hello, {name}!" * times`,
    typescript: `function greet(name: string, times: number = 1): string {
  return \`Hello, \${name}!\`.repeat(times)
}`
  },
  {
    title: "Classes & Dataclasses",
    python: `@dataclass
class Point:
    x: float
    y: float
    label: str = "origin"`,
    typescript: `class Point {
  constructor(
    public x: number,
    public y: number,
    public label: string = "origin"
  ) {}
}`
  },
  {
    title: "Generics & Protocols",
    python: `T = TypeVar('T')

class Container(Generic[T]):
    def __init__(self, value: T) -> None:
        self.value = value`,
    typescript: `class Container<T> {
  value: T

  constructor(value: T) {
    this.value = value
  }
}`
  },
  {
    title: "Comprehensions",
    python: `squares = [x ** 2 for x in range(10)]
evens = [x for x in nums if x % 2 == 0]
lookup = {k: v for k, v in pairs}`,
    typescript: `let squares = range(10).map(x => pow(x, 2))
let evens = nums.filter(x => mod(x, 2) === 0)
let lookup = Object.fromEntries(pairs)`
  }
]

function SyntaxSection() {
  return (
    <section className={styles.syntaxSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Syntax Transformation</Heading>
          <p>Clean, predictable conversions for every Python construct.</p>
        </div>
        <div className={styles.syntaxGrid}>
          {syntaxExamples.map((example, idx) => (
            <div key={idx} className={styles.syntaxCard}>
              <Heading as="h4">{example.title}</Heading>
              <div className={styles.syntaxComparison}>
                <div className={styles.syntaxPanel}>
                  <div className={styles.syntaxLabel}>Python</div>
                  <CodeBlock language="python">{example.python}</CodeBlock>
                </div>
                <div className={styles.syntaxPanel}>
                  <div className={styles.syntaxLabel}>TypeScript</div>
                  <CodeBlock language="typescript">{example.typescript}</CodeBlock>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ==========================================================================
   Runtime Library Section
   ========================================================================== */

const modules = [
  {
    name: "itertools",
    path: "pythonlib/itertools",
    functions: ["chain", "combinations", "permutations", "product", "zipLongest", "groupby"],
    example: `import { combinations } from "pythonlib/itertools"

for (const combo of combinations([1, 2, 3], 2)) {
  console.log(combo) // [1,2], [1,3], [2,3]
}`
  },
  {
    name: "functools",
    path: "pythonlib/functools",
    functions: ["partial", "reduce", "lruCache", "pipe", "cache"],
    example: `import { lruCache } from "pythonlib/functools"

const fib = lruCache((n: number): number =>
  n <= 1 ? n : fib(n - 1) + fib(n - 2)
)`
  },
  {
    name: "collections",
    path: "pythonlib/collections",
    functions: ["Counter", "defaultdict", "deque"],
    example: `import { Counter } from "pythonlib/collections"

const counter = new Counter("mississippi")
counter.mostCommon(2) // [["i", 4], ["s", 4]]`
  },
  {
    name: "datetime",
    path: "pythonlib/datetime",
    functions: ["datetime", "date", "time", "timedelta"],
    example: `import { datetime } from "pythonlib/datetime"

const now = datetime.now()
now.strftime("%Y-%m-%d %H:%M:%S")`
  },
  {
    name: "re",
    path: "pythonlib/re",
    functions: ["search", "match", "findAll", "sub", "compile"],
    example: `import { search } from "pythonlib/re"

const m = search("(?P<name>\\\\w+)@(?P<domain>\\\\w+)", email)
m?.group("name") // Named groups supported!`
  },
  {
    name: "random",
    path: "pythonlib/random",
    functions: ["randInt", "choice", "shuffle", "sample"],
    example: `import { randInt, choice } from "pythonlib/random"

randInt(1, 10)        // Random integer 1-10
choice(["a", "b"])    // Random element`
  }
]

function RuntimeSection() {
  return (
    <section className={styles.runtimeSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Python Standard Library for TypeScript</Heading>
          <p>
            <code>pythonlib</code> brings Python's powerful APIs to TypeScript—with camelCase naming
            that feels native.
          </p>
        </div>
        <div className={styles.moduleGrid}>
          {modules.map((mod, idx) => (
            <div key={idx} className={styles.moduleCard}>
              <div className={styles.moduleHeader}>
                <Heading as="h4">{mod.name}</Heading>
                <code className={styles.modulePath}>{mod.path}</code>
              </div>
              <div className={styles.moduleFunctions}>
                {mod.functions.map((fn, i) => (
                  <code key={i} className={styles.functionBadge}>
                    {fn}
                  </code>
                ))}
              </div>
              <CodeBlock language="typescript" className={styles.moduleExample}>
                {mod.example}
              </CodeBlock>
            </div>
          ))}
        </div>
        <div className={styles.moreModules}>
          <p>
            Plus: <code>pythonlib/math</code>, <code>pythonlib/json</code>,{" "}
            <code>pythonlib/string</code>, <code>pythonlib/os</code>, and more.
          </p>
          <Link to="/docs/runtime" className={styles.moreLink}>
            View all modules →
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ==========================================================================
   Runtime Support Section
   ========================================================================== */

function RuntimeSupportSection() {
  const nodejsIcon = useBaseUrl("/img/nodejs.svg")
  const bunIcon = useBaseUrl("/img/bun.svg")
  const denoIcon = useBaseUrl("/img/deno.svg")
  const playwrightIcon = useBaseUrl("/img/playwright.svg")

  const runtimes = [
    {
      name: "Node.js",
      versions: "v22, v24",
      icon: nodejsIcon,
      status: "Full test suite"
    },
    {
      name: "Bun",
      versions: "latest",
      icon: bunIcon,
      status: "Full test suite"
    },
    {
      name: "Deno",
      versions: "v2.x",
      icon: denoIcon,
      status: "Full test suite"
    },
    {
      name: "Browser",
      versions: "All modern",
      icon: playwrightIcon,
      status: "Runtime tests"
    }
  ]

  return (
    <section className={styles.runtimeSupportSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Tested on Every Commit</Heading>
          <p>Multi-runtime CI ensures your code works everywhere.</p>
        </div>
        <div className={styles.runtimeGrid}>
          {runtimes.map((runtime, idx) => (
            <div key={idx} className={styles.runtimeCard}>
              <img
                src={runtime.icon}
                alt={runtime.name}
                className={styles.runtimeIcon}
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
              <Heading as="h4">{runtime.name}</Heading>
              <div className={styles.runtimeVersion}>{runtime.versions}</div>
              <div className={styles.runtimeStatus}>✓ {runtime.status}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ==========================================================================
   Use Cases Section
   ========================================================================== */

const useCases = [
  {
    icon: Bot,
    title: "AI/ML to Production",
    description:
      "Prototype your ML algorithms in Python, then ship them as TypeScript for edge deployment, browser inference, or serverless functions."
  },
  {
    icon: RefreshCw,
    title: "Code Migration",
    description:
      "Gradually migrate Python codebases to TypeScript. Convert module by module while maintaining functionality."
  },
  {
    icon: GraduationCap,
    title: "Learning & Teaching",
    description:
      "Help Python developers learn TypeScript by showing side-by-side conversions. Great for tutorials and documentation."
  },
  {
    icon: Zap,
    title: "Performance Critical",
    description:
      "Run Python algorithms in V8's highly optimized JavaScript engine. Benefit from JIT compilation and modern runtime features."
  }
]

function UseCasesSection() {
  return (
    <section className={styles.useCasesSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Use Cases</Heading>
          <p>From prototyping to production, python2ts fits your workflow.</p>
        </div>
        <div className={styles.useCaseGrid}>
          {useCases.map((useCase, idx) => {
            const IconComponent = useCase.icon
            return (
              <div key={idx} className={styles.useCaseCard}>
                <div className={styles.useCaseIcon}>
                  <IconComponent size={40} strokeWidth={1.5} />
                </div>
                <Heading as="h4">{useCase.title}</Heading>
                <p>{useCase.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ==========================================================================
   Quick Start Section
   ========================================================================== */

function QuickStartSection() {
  return (
    <section className={styles.quickStartSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Quick Start</Heading>
          <p>Get up and running in seconds.</p>
        </div>
        <div className={styles.quickStartGrid}>
          <div className={styles.quickStartCard}>
            <div className={styles.stepNumber}>1</div>
            <Heading as="h4">Install</Heading>
            <CodeBlock language="bash">npm install python2ts</CodeBlock>
          </div>
          <div className={styles.quickStartCard}>
            <div className={styles.stepNumber}>2</div>
            <Heading as="h4">Transpile</Heading>
            <CodeBlock language="bash">npx python2ts input.py -o output.ts</CodeBlock>
          </div>
          <div className={styles.quickStartCard}>
            <div className={styles.stepNumber}>3</div>
            <Heading as="h4">Run</Heading>
            <CodeBlock language="bash">{`npx tsx output.ts\n# or: node, deno, bun...`}</CodeBlock>
          </div>
        </div>
        <div className={styles.quickStartAlt}>
          <p>Or use the runtime library directly:</p>
          <CodeBlock language="typescript">
            {`import { range, enumerate, sorted } from "pythonlib"
import { combinations } from "pythonlib/itertools"
import { Counter } from "pythonlib/collections"

// Python's powerful APIs, TypeScript's familiar style`}
          </CodeBlock>
        </div>
      </div>
    </section>
  )
}

/* ==========================================================================
   Acknowledgments Section
   ========================================================================== */

const acknowledgments = [
  {
    name: "Lezer",
    url: "https://lezer.codemirror.net/",
    description: "The incremental parser system that powers our Python parsing"
  },
  {
    name: "Prettier",
    url: "https://prettier.io/",
    description: "Code formatter for beautiful TypeScript output"
  },
  {
    name: "Docusaurus",
    url: "https://docusaurus.io/",
    description: "Documentation framework for this website"
  },
  {
    name: "Vitest",
    url: "https://vitest.dev/",
    description: "Testing framework for our test suite"
  }
]

function AcknowledgmentsSection() {
  return (
    <section className={styles.acknowledgementsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">
            <Heart size={28} style={{ marginRight: 12, verticalAlign: "middle" }} />
            Built With
          </Heading>
          <p>python2ts stands on the shoulders of these amazing open source projects.</p>
        </div>
        <div className={styles.acknowledgementsGrid}>
          {acknowledgments.map((ack, idx) => (
            <a
              key={idx}
              href={ack.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ackCard}
            >
              <Heading as="h4">{ack.name}</Heading>
              <p>{ack.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ==========================================================================
   CTA Section
   ========================================================================== */

function CTASection() {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <Heading as="h2">Ready to bridge Python and TypeScript?</Heading>
        <p>Join developers who ship Python algorithms to any JavaScript runtime.</p>
        <div className={styles.ctaButtons}>
          <Link className={clsx("button button--lg", styles.primaryButton)} to="/docs">
            Read the Docs
          </Link>
          <Link
            className={clsx("button button--lg", styles.ctaSecondaryButton)}
            href="https://github.com/sebastian-software/python2ts"
          >
            Star on GitHub
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ==========================================================================
   Main Component
   ========================================================================== */

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout title="Home" description={siteConfig.tagline}>
      <HeroSection />
      <main>
        <WhySection />
        <SyntaxSection />
        <RuntimeSection />
        <RuntimeSupportSection />
        <UseCasesSection />
        <QuickStartSection />
        <AcknowledgmentsSection />
        <CTASection />
      </main>
    </Layout>
  )
}
