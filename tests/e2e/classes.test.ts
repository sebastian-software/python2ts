import { describe, it, expect } from "vitest"
import { transpile } from "../../src/generator/index.js"

describe("E2E: Classes", () => {
  describe("Basic Class Definitions", () => {
    it("should convert simple empty class", () => {
      const python = `class Dog:
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "class Dog {

        }"
      `)
    })

    it("should convert class with __init__", () => {
      const python = `class Dog:
    def __init__(self, name):
        self.name = name`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "class Dog {
          constructor(name) {
            this.name = name;
          }
        }"
      `)
    })

    it("should convert class with multiple __init__ parameters", () => {
      const python = `class Person:
    def __init__(self, name, age, city):
        self.name = name
        self.age = age
        self.city = city`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "class Person {
          constructor(name, age, city) {
            this.name = name;
            this.age = age;
            this.city = city;
          }
        }"
      `)
    })

    it("should convert __init__ with default parameters", () => {
      const python = `class Config:
    def __init__(self, debug = False):
        self.debug = debug`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "class Config {
          constructor(debug = false) {
            this.debug = debug;
          }
        }"
      `)
    })
  })

  describe("Instance Methods", () => {
    it("should convert simple instance method", () => {
      const python = `class Dog:
    def bark(self):
        print("Woof!")`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "class Dog {
          bark() {
            console.log("Woof!");
          }
        }"
      `)
    })

    it("should convert method with parameters", () => {
      const python = `class Calculator:
    def add(self, a, b):
        return a + b`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "class Calculator {
          add(a, b) {
            return (a + b);
          }
        }"
      `)
    })

    it("should convert method using self attributes", () => {
      const python = `class Counter:
    def increment(self):
        self.count = self.count + 1
        return self.count`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "class Counter {
          increment() {
            this.count = (this.count + 1);
            return this.count;
          }
        }"
      `)
    })

    it("should convert class with multiple methods", () => {
      const python = `class Dog:
    def __init__(self, name):
        self.name = name
    def bark(self):
        print(self.name)
    def greet(self, other):
        print(other)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "class Dog {
          constructor(name) {
            this.name = name;
          }

          bark() {
            console.log(this.name);
          }

          greet(other) {
            console.log(other);
          }
        }"
      `)
    })
  })

  describe("Inheritance", () => {
    it("should convert class with inheritance", () => {
      const python = `class Puppy(Dog):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "class Puppy extends Dog {

        }"
      `)
    })

    it("should convert child class with constructor", () => {
      const python = `class Puppy(Dog):
    def __init__(self, name, age):
        self.name = name
        self.age = age`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "class Puppy extends Dog {
          constructor(name, age) {
            this.name = name;
            this.age = age;
          }
        }"
      `)
    })

    it("should convert super().__init__ to super()", () => {
      const python = `class Puppy(Dog):
    def __init__(self, name, age):
        super().__init__(name)
        self.age = age`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "class Puppy extends Dog {
          constructor(name, age) {
            super(name);
            this.age = age;
          }
        }"
      `)
    })

    it("should convert child class with overridden method", () => {
      const python = `class Puppy(Dog):
    def bark(self):
        print("Yip!")`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "class Puppy extends Dog {
          bark() {
            console.log("Yip!");
          }
        }"
      `)
    })
  })

  describe("Special Methods", () => {
    it("should convert __str__ to toString", () => {
      const python = `class Person:
    def __str__(self):
        return self.name`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "class Person {
          toString() {
            return this.name;
          }
        }"
      `)
    })

    it("should convert __repr__ to toString", () => {
      const python = `class Point:
    def __repr__(self):
        return self.x`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "class Point {
          toString() {
            return this.x;
          }
        }"
      `)
    })
  })

  describe("Static Methods", () => {
    it("should convert @staticmethod", () => {
      const python = `class Math:
    @staticmethod
    def add(a, b):
        return a + b`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "class Math {
          static add(a, b) {
            return (a + b);
          }
        }"
      `)
    })

    it("should convert @classmethod", () => {
      const python = `class Factory:
    @classmethod
    def create(cls):
        return cls()`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "class Factory {
          static create() {
            return new this();
          }
        }"
      `)
    })
  })

  describe("Property Decorator", () => {
    it("should convert @property to getter", () => {
      const python = `class Circle:
    @property
    def radius(self):
        return self._radius`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "class Circle {
          get radius() {
            return this._radius;
          }
        }"
      `)
    })
  })

  describe("Full Class Examples", () => {
    it("should convert a complete class", () => {
      const python = `class Dog:
    def __init__(self, name, breed):
        self.name = name
        self.breed = breed
    def bark(self):
        print(self.name)
    def __str__(self):
        return self.name`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "class Dog {
          constructor(name, breed) {
            this.name = name;
            this.breed = breed;
          }

          bark() {
            console.log(this.name);
          }

          toString() {
            return this.name;
          }
        }"
      `)
    })

    it("should convert inheritance chain", () => {
      const python = `class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "class Animal {
          constructor(name) {
            this.name = name;
          }

          speak() {

          }
        }"
      `)
    })
  })
})
