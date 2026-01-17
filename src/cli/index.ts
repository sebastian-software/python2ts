#!/usr/bin/env node
import { parseArgs } from "node:util"
import { readFile, writeFile } from "node:fs/promises"
import { createInterface } from "node:readline"
import { transpileAsync, type GeneratorOptions } from "../generator/index.js"

const VERSION = "0.1.0"

const HELP = `
python2ts - Transpile Python code to TypeScript

Usage:
  python2ts [options] [file]

Arguments:
  file                  Input Python file (reads from stdin if omitted)

Options:
  -o, --output <file>   Write output to file (prints to stdout if omitted)
  --no-runtime          Don't include runtime import statement
  --runtime-path <path> Custom runtime import path (default: python2ts/runtime)
  -h, --help            Show this help message
  -v, --version         Show version number

Examples:
  python2ts input.py                    Transpile and print to stdout
  python2ts input.py -o output.ts       Transpile to file
  cat input.py | python2ts              Read from stdin
  python2ts input.py --no-runtime       Transpile without runtime import
`.trim()

async function readStdin(): Promise<string> {
  const lines: string[] = []
  const rl = createInterface({
    input: process.stdin,
    crlfDelay: Infinity
  })

  for await (const line of rl) {
    lines.push(line)
  }

  return lines.join("\n")
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    options: {
      output: { type: "string", short: "o" },
      "no-runtime": { type: "boolean", default: false },
      "runtime-path": { type: "string" },
      help: { type: "boolean", short: "h", default: false },
      version: { type: "boolean", short: "v", default: false }
    },
    allowPositionals: true
  })

  if (values.help) {
    console.log(HELP)
    process.exit(0)
  }

  if (values.version) {
    console.log(VERSION)
    process.exit(0)
  }

  // Read input
  let pythonCode: string
  const inputFile = positionals[0]

  if (inputFile) {
    try {
      pythonCode = await readFile(inputFile, "utf-8")
    } catch (error) {
      const err = error as NodeJS.ErrnoException
      if (err.code === "ENOENT") {
        console.error(`Error: File not found: ${inputFile}`)
      } else {
        console.error(`Error reading file: ${err.message}`)
      }
      process.exit(1)
    }
  } else {
    // Read from stdin
    if (process.stdin.isTTY) {
      console.error("Error: No input file specified and stdin is a terminal.")
      console.error("Usage: python2ts <file> or cat file.py | python2ts")
      process.exit(1)
    }
    pythonCode = await readStdin()
  }

  // Transpile (with Prettier formatting)
  let tsCode: string
  try {
    const options: GeneratorOptions = {
      includeRuntime: !values["no-runtime"]
    }
    if (values["runtime-path"]) {
      options.runtimeImportPath = values["runtime-path"]
    }
    tsCode = await transpileAsync(pythonCode, options)
  } catch (error) {
    const err = error as Error
    console.error(`Transpilation error: ${err.message}`)
    process.exit(1)
  }

  // Write output
  const outputFile = values.output
  if (outputFile) {
    try {
      await writeFile(outputFile, tsCode, "utf-8")
    } catch (error) {
      const err = error as Error
      console.error(`Error writing file: ${err.message}`)
      process.exit(1)
    }
  } else {
    console.log(tsCode)
  }
}

main().catch((error: unknown) => {
  console.error(`Unexpected error: ${String(error)}`)
  process.exit(1)
})
