import { themes as prismThemes } from "prism-react-renderer"
import type { Config } from "@docusaurus/types"
import type * as Preset from "@docusaurus/preset-classic"

const config: Config = {
  title: "python2ts",
  tagline: "Write Python. Ship TypeScript. Run Everywhere.",
  favicon: "img/favicon.ico",

  future: {
    v4: true
  },

  markdown: {
    format: "detect"
  },

  url: "https://sebastian-software.github.io",
  baseUrl: "/python2ts/",

  organizationName: "sebastian-software",
  projectName: "python2ts",
  trailingSlash: false,

  onBrokenLinks: "throw",

  i18n: {
    defaultLocale: "en",
    locales: ["en"]
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/sebastian-software/python2ts/tree/main/docs/"
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css"
        }
      } satisfies Preset.Options
    ]
  ],

  plugins: [
    [
      "docusaurus-plugin-typedoc",
      {
        entryPoints: [
          "../packages/pythonlib/src/index.ts",
          "../packages/pythonlib/src/itertools.ts",
          "../packages/pythonlib/src/functools.ts",
          "../packages/pythonlib/src/collections.ts",
          "../packages/pythonlib/src/datetime.ts",
          "../packages/pythonlib/src/re.ts",
          "../packages/pythonlib/src/math.ts",
          "../packages/pythonlib/src/random.ts",
          "../packages/pythonlib/src/string.ts",
          "../packages/pythonlib/src/json.ts",
          "../packages/pythonlib/src/os.node.ts"
        ],
        entryPointStrategy: "expand",
        tsconfig: "../packages/pythonlib/tsconfig.json",
        out: "docs/api",
        readme: "none",
        indexFormat: "table",
        parametersFormat: "table",
        enumMembersFormat: "table",
        typeDeclarationFormat: "table",
        sanitizeComments: true,
        useCodeBlocks: true,
        expandParameters: true
      }
    ]
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true
    },
    navbar: {
      title: "python2ts",
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Docs"
        },
        {
          to: "/docs/api",
          label: "API",
          position: "left"
        },
        {
          href: "https://www.npmjs.com/package/python2ts",
          label: "npm",
          position: "right"
        },
        {
          href: "https://github.com/sebastian-software/python2ts",
          label: "GitHub",
          position: "right"
        }
      ]
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Getting Started",
              to: "/docs"
            },
            {
              label: "Syntax Reference",
              to: "/docs/syntax"
            },
            {
              label: "Runtime Library",
              to: "/docs/runtime"
            },
            {
              label: "API Reference",
              to: "/docs/api"
            }
          ]
        },
        {
          title: "Packages",
          items: [
            {
              label: "python2ts (Transpiler)",
              href: "https://www.npmjs.com/package/python2ts"
            },
            {
              label: "pythonlib (Runtime)",
              href: "https://www.npmjs.com/package/pythonlib"
            }
          ]
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/sebastian-software/python2ts"
            },
            {
              label: "Sebastian Software",
              href: "https://www.sebastian-software.de"
            }
          ]
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Sebastian Software GmbH. Built with Docusaurus.`
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["python", "typescript", "bash"]
    }
  } satisfies Preset.ThemeConfig
}

export default config
