import { defineConfig } from "astro/config"
import starlight from "@astrojs/starlight"
import starlightTypeDoc from "starlight-typedoc"
import tailwindcss from "@astrojs/tailwind"

export default defineConfig({
  site: "https://sebastian-software.github.io",
  base: "/python2ts",
  integrations: [
    starlight({
      title: "python2ts",
      tagline: "Write Python. Ship TypeScript. Run Everywhere.",
      logo: {
        src: "./src/assets/logo.svg"
      },
      social: {
        github: "https://github.com/sebastian-software/python2ts"
      },
      editLink: {
        baseUrl: "https://github.com/sebastian-software/python2ts/edit/main/docs/"
      },
      customCss: ["./src/styles/custom.css"],
      plugins: [
        starlightTypeDoc({
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
            "../packages/pythonlib/src/os.node.ts",
            "../packages/pythonlib/src/sys.ts",
            "../packages/pythonlib/src/time.ts",
            "../packages/pythonlib/src/copy.ts",
            "../packages/pythonlib/src/base64.ts",
            "../packages/pythonlib/src/uuid.ts",
            "../packages/pythonlib/src/hashlib.ts",
            "../packages/pythonlib/src/subprocess.ts",
            "../packages/pythonlib/src/urllib.ts",
            "../packages/pythonlib/src/pathlib.node.ts",
            "../packages/pythonlib/src/glob.node.ts",
            "../packages/pythonlib/src/shutil.node.ts",
            "../packages/pythonlib/src/tempfile.node.ts",
            "../packages/pythonlib/src/logging.node.ts"
          ],
          tsconfig: "../packages/pythonlib/tsconfig.json",
          output: "api",
          sidebar: {
            label: "API Reference",
            collapsed: true
          },
          typeDoc: {
            readme: "none",
            parametersFormat: "table",
            enumMembersFormat: "table",
            typeDeclarationFormat: "table",
            expandParameters: true
          }
        })
      ],
      sidebar: [
        {
          label: "Guide",
          autogenerate: { directory: "guide" }
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" }
        },
        {
          label: "API Reference",
          collapsed: true,
          autogenerate: { directory: "api" }
        },
        {
          label: "Architecture Decisions",
          collapsed: true,
          autogenerate: { directory: "adr" }
        }
      ],
      head: [
        {
          tag: "link",
          attrs: {
            rel: "icon",
            href: "/python2ts/favicon.ico"
          }
        }
      ]
    }),
    tailwindcss({
      applyBaseStyles: false
    })
  ]
})
