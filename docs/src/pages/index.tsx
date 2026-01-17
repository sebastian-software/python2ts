import type { ReactNode } from "react"
import clsx from "clsx"
import Link from "@docusaurus/Link"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import Layout from "@theme/Layout"
import Heading from "@theme/Heading"

import styles from "./index.module.css"

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs">
            Get Started
          </Link>
          <Link
            className="button button--secondary button--lg"
            style={{ marginLeft: "1rem" }}
            href="https://github.com/sebastian-software/python2ts"
          >
            GitHub
          </Link>
        </div>
      </div>
    </header>
  )
}

type FeatureItem = {
  title: string
  description: ReactNode
}

const features: FeatureItem[] = [
  {
    title: "AI-First",
    description: (
      <>
        Python dominates AI/ML. TypeScript powers modern web apps. Bridge the gap — prototype in
        Python, deploy in TypeScript.
      </>
    )
  },
  {
    title: "Full Type Safety",
    description: (
      <>
        Python type hints automatically become TypeScript types. Generics, Protocols, TypedDicts —
        all supported.
      </>
    )
  },
  {
    title: "Runtime Library",
    description: (
      <>
        Python standard library in TypeScript: itertools, functools, collections, datetime, re, and
        more. Use standalone or with the transpiler.
      </>
    )
  },
  {
    title: "Run Everywhere",
    description: (
      <>
        Browsers, Node.js, Deno, Bun, Cloudflare Workers, AWS Lambda — anywhere JavaScript runs,
        your Python code can run too.
      </>
    )
  }
]

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx("col col--3")}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout title="Home" description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              {features.map((props, idx) => (
                <Feature key={idx} {...props} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
