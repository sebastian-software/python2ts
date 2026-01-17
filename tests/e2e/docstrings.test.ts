import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"

describe("Docstrings → JSDoc", () => {
  describe("function docstrings", () => {
    it("should transform simple function docstring", () => {
      const python = `
def greet(name):
    """Greet a person by name."""
    print(f"Hello, {name}")
`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("/**")
      expect(result).toContain(" * Greet a person by name.")
      expect(result).toContain(" */")
      expect(result).toContain("function greet(name)")
      expect(result).not.toContain('"""')
    })

    it("should transform multi-line description", () => {
      const python = `
def process(data):
    """Process the data.

    This function processes the input data and
    returns the result.
    """
    return data
`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("/**")
      expect(result).toContain(" * Process the data.")
      expect(result).toContain(" * This function processes the input data and")
      expect(result).toContain(" * returns the result.")
      expect(result).toContain(" */")
    })

    it("should parse Args section", () => {
      const python = `
def add(x, y):
    """Add two numbers.

    Args:
        x: The first number.
        y: The second number.
    """
    return x + y
`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("@param x - The first number.")
      expect(result).toContain("@param y - The second number.")
    })

    it("should strip type annotations from Args", () => {
      const python = `
def greet(name):
    """Greet someone.

    Args:
        name (str): The person's name.
    """
    print(name)
`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("@param name - The person's name.")
      expect(result).not.toContain("(str)")
    })

    it("should parse Returns section", () => {
      const python = `
def calculate():
    """Calculate the result.

    Returns:
        The calculated value.
    """
    return 42
`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("@returns The calculated value.")
    })

    it("should parse Raises section", () => {
      const python = `
def validate(x):
    """Validate input.

    Raises:
        ValueError: If x is negative.
        TypeError: If x is not a number.
    """
    pass
`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("@throws {ValueError} If x is negative.")
      expect(result).toContain("@throws {TypeError} If x is not a number.")
    })

    it("should handle full docstring with all sections", () => {
      const python = `
def divide(a, b):
    """Divide two numbers.

    Performs safe division of a by b.

    Args:
        a: The dividend.
        b: The divisor.

    Returns:
        The quotient.

    Raises:
        ZeroDivisionError: If b is zero.
    """
    if b == 0:
        raise ZeroDivisionError("Cannot divide by zero")
    return a / b
`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("/**")
      expect(result).toContain(" * Divide two numbers.")
      expect(result).toContain(" * Performs safe division of a by b.")
      expect(result).toContain("@param a - The dividend.")
      expect(result).toContain("@param b - The divisor.")
      expect(result).toContain("@returns The quotient.")
      expect(result).toContain("@throws {ZeroDivisionError} If b is zero.")
      expect(result).toContain(" */")
    })

    it("should handle single-quoted docstrings", () => {
      const python = `
def example():
    '''Single-quoted docstring.'''
    pass
`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("/**")
      expect(result).toContain(" * Single-quoted docstring.")
      expect(result).toContain(" */")
    })
  })

  describe("class docstrings", () => {
    it("should transform class docstring", () => {
      const python = `
class MyClass:
    """A simple class."""
    pass
`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("/**")
      expect(result).toContain(" * A simple class.")
      expect(result).toContain(" */")
      expect(result).toContain("class MyClass")
    })

    it("should transform class with multi-line docstring", () => {
      const python = `
class Calculator:
    """A calculator class.

    This class provides basic arithmetic operations.
    """

    def add(self, x, y):
        return x + y
`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("/**")
      expect(result).toContain(" * A calculator class.")
      expect(result).toContain(" * This class provides basic arithmetic operations.")
      expect(result).toContain(" */")
      expect(result).toContain("class Calculator")
    })
  })

  describe("method docstrings", () => {
    it("should transform method docstrings", () => {
      const python = `
class MyClass:
    def my_method(self):
        """Do something useful."""
        pass
`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("  /**")
      expect(result).toContain("   * Do something useful.")
      expect(result).toContain("  */")
      expect(result).toContain("  my_method()")
    })

    it("should transform __init__ docstring", () => {
      const python = `
class Person:
    def __init__(self, name, age):
        """Create a new person.

        Args:
            name: The person's name.
            age: The person's age.
        """
        self.name = name
        self.age = age
`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("  /**")
      expect(result).toContain("   * Create a new person.")
      expect(result).toContain("   * @param name - The person's name.")
      expect(result).toContain("   * @param age - The person's age.")
      expect(result).toContain("  */")
      expect(result).toContain("  constructor(name, age)")
    })

    it("should handle class and method docstrings together", () => {
      const python = `
class Service:
    """A service class.

    Provides service functionality.
    """

    def __init__(self, config):
        """Initialize the service.

        Args:
            config: Service configuration.
        """
        self.config = config

    def run(self):
        """Run the service.

        Returns:
            The service result.
        """
        return self.config
`
      const result = transpile(python, { includeRuntime: false })

      // Class docstring
      expect(result).toMatch(/\/\*\*\s*\n\s*\* A service class\./)
      expect(result).toContain("class Service")

      // Constructor docstring
      expect(result).toContain("@param config - Service configuration.")
      expect(result).toContain("constructor(config)")

      // Method docstring
      expect(result).toContain("@returns The service result.")
      expect(result).toContain("run()")
    })
  })

  describe("functions without docstrings", () => {
    it("should not add JSDoc for functions without docstrings", () => {
      const python = `
def simple():
    return 42
`
      const result = transpile(python, { includeRuntime: false })
      expect(result).not.toContain("/**")
      expect(result).toContain("function simple()")
    })

    it("should not treat regular strings as docstrings", () => {
      const python = `
def example():
    x = "not a docstring"
    return x
`
      const result = transpile(python, { includeRuntime: false })
      expect(result).not.toContain("/**")
      expect(result).toContain('"not a docstring"')
    })
  })

  describe("edge cases", () => {
    it("should handle empty docstring", () => {
      const python = `
def empty():
    """"""
    pass
`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("/**")
      expect(result).toContain(" */")
    })

    it("should handle docstring with only whitespace", () => {
      const python = `
def whitespace():
    """   """
    pass
`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("/**")
      expect(result).toContain(" */")
    })

    it("should handle async function with docstring", () => {
      const python = `
async def fetch_data():
    """Fetch data from the server."""
    return await get_data()
`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("/**")
      expect(result).toContain(" * Fetch data from the server.")
      expect(result).toContain(" */")
      expect(result).toContain("async function fetch_data()")
    })

    it("should preserve function body after docstring", () => {
      const python = `
def compute(x):
    """Compute the result."""
    y = x * 2
    z = y + 1
    return z
`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("let y = (x * 2)")
      expect(result).toContain("let z = (y + 1)")
      expect(result).toContain("return z")
    })
  })
})
