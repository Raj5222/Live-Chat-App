class Parent {
  constructor(public name: string = "Raj") {}

  greet(): void {
    console.log(`Hello, my name is ${this.name}`);
  }

  farewell(): void {
    console.log(`Goodbye from ${this.name}`);
  }
}

class Child extends Parent {
  constructor(name: string) {
    super(name);
    this.runDefaultMethod();
  }
  

  private runDefaultMethod(): void {
    console.log(
      "This is a default method that runs with every Child instance."
    );
  }
}


new Child("").greet()
