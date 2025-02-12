describe("Registration", () => {
    it("A user signs up and is redirected to home page", () => {
    cy.visit("/users/new");
    cy.get("#name").type("name");
    cy.get("#email").type("someone@example.com");
    cy.get("#password1").type("Password@1");
    cy.get("#password2").type("Password@1");
    cy.get("#submit").click();

    cy.url().should("include", "/posts");
  });

  it("A user types two different passwords and is redirected to signing up page", () => {
    cy.visit("/users/new");
    cy.get("#name").type("name");
    cy.get("#email").type("someone1@example.com");
    cy.get("#password1").type("Password@12");
    cy.get("#password2").type("Password@1");
    
    cy.get("#submit").click();

    cy.url().should("include", "users/new");
    cy.contains("div", "Passwords do not match");
  });

  // should test if email is already in the database
  it("A user types an email that is already in the database and is redirected to signing up page", () => {
    cy.visit("/users/new");
    //signup
    cy.get("#name").type("name");
    cy.get("#email").type("someone2@example.com");
    cy.get("#password1").type("Password@1");
    cy.get("#password2").type("Password@1");
    cy.get("#submit").click();

    // needs to click logout
    cy.get("#logout").click();

    // needs to sign up again
    cy.visit("/users/new");
    cy.get("#name").type("name");
    cy.get("#email").type("someone2@example.com");
    cy.get("#password1").type("Password@1");
    cy.get("#password2").type("Password@1");
    cy.get("#submit").click();

    // should be redirected to sign up page
    cy.url().should("include", "users/new");

    // should see error message
    cy.contains("div", "Email already exists.");
  });

  it("A user writes an invalid name", () => {
    cy.visit("/users/new");
    //signup
    cy.get("#name").type("11111");
    cy.get("#email").type("someone2@example.com");
    cy.get("#password1").type("Password@1");
    cy.get("#password2").type("Password@1");
    cy.get("#submit").click();
    // should be redirected to sign up page
    cy.url().should("include", "users/new");

    // should see error message
    cy.contains("div", "Please enter a valid name");
  });

  it("A user writes an invalid password", () => {
    cy.visit("/users/new");
    //signup
    cy.get("#name").type("name");
    cy.get("#email").type("someone2@example.com");
    cy.get("#password1").type("password");
    cy.get("#password2").type("password");
    cy.get("#submit").click();
    // should be redirected to sign up page
    cy.url().should("include", "users/new");

    // should see error message
    cy.contains("div", "Password must be 8-15 characters and contain an uppercase, lowercase, numeric and special character");
  });
});
